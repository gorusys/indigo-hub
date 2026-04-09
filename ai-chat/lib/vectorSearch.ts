import "server-only";

import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL, getOpenAI } from "./openai";
import { hasServerEnv } from "./env";
import { getSupabaseAdminClient } from "./supabase";
import type { RetrievedDocChunk } from "./types";

const DEFAULT_TOP_K = 5;

// Minimum cosine similarity to consider a result relevant when the query does
// not clearly reference Indigo docs topics. Short acronyms (e.g. "cdp") often
// score below this even when the corpus contains the right pages — see
// isLikelyIndigoDocsQuery() for a bypass.
const SIMILARITY_THRESHOLD = 0.45;

function isLikelyIndigoDocsQuery(query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return false;

  if (
    /\b(indigo\s+(protocol|hub|agents?))\b/i.test(q) ||
    /\bstability\s+pools?\b/i.test(q) ||
    /\bovercollateral/i.test(q) ||
    /\bred\s+oracle\b/i.test(q)
  ) {
    return true;
  }

  const tokens = q.split(/[^a-z0-9]+/).filter(Boolean);
  const strong = new Set([
    "cdp",
    "cdps",
    "indy",
    "iusd",
    "ibtc",
    "ieth",
    "iasset",
    "iassets",
    "indigo",
    "collateral",
    "liquidation",
    "liquidate",
    "liquidated",
    "governance",
    "staking",
    "staked",
    "mintra",
    "rob",
  ]);
  for (const t of tokens) {
    if (strong.has(t)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Root cause: the IVFFlat index was created before data was loaded.
// With probes=1 (default), only 1 of 100 clusters is searched. Query vectors
// that fall into a cluster different from the stored documents return 0 rows.
// Stored document vectors always find themselves because they ARE in the index.
// Fix: JS cosine similarity on a module-level cache — bypasses the index.
// SQL fix (run in Supabase dashboard): see sql/fix_ivfflat.sql
// ---------------------------------------------------------------------------

// Module-level embedding cache — stored on globalThis so it survives
// Next.js hot-module reloads in development without re-downloading.
interface CachedEmbedding {
  id: string;
  embedding: Float32Array;
}

interface GlobalCache {
  data: CachedEmbedding[] | null;
  promise: Promise<CachedEmbedding[]> | null;
}

// Use a namespace on globalThis so the cache outlives module reloads.
const g = globalThis as typeof globalThis & { __zechubEmbCache?: GlobalCache };
if (!g.__zechubEmbCache) {
  g.__zechubEmbCache = { data: null, promise: null };
}
const _cache = g.__zechubEmbCache;

async function loadEmbeddingCache(
  supabase: ReturnType<typeof getSupabaseAdminClient>
): Promise<CachedEmbedding[]> {
  if (_cache.data) return _cache.data;
  if (_cache.promise) return _cache.promise;

  const loadStart = Date.now();
  console.log("[vectorSearch] cache: loading all embeddings from Supabase...");

  _cache.promise = (async () => {
    const chunks: CachedEmbedding[] = [];
    const PAGE_SIZE = 1000;
    let page = 0;

    while (true) {
      const { data, error } = await supabase
        .from("indigo_docs_embeddings")
        .select("id, embedding")
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (error) {
        console.error("[vectorSearch] cache: fetch error:", error.message);
        break;
      }
      if (!data || data.length === 0) break;

      for (const row of data) {
        const arr: number[] =
          typeof row.embedding === "string"
            ? JSON.parse(row.embedding as string)
            : (row.embedding as number[]);

        if (Array.isArray(arr) && arr.length === EMBEDDING_DIMENSIONS) {
          chunks.push({ id: row.id as string, embedding: new Float32Array(arr) });
        }
      }

      page++;
      if (data.length < PAGE_SIZE) break;
    }

    console.log(
      `[vectorSearch] cache: loaded ${chunks.length} embeddings in ${Date.now() - loadStart}ms`
    );
    _cache.data = chunks;
    return chunks;
  })();

  return _cache.promise;
}

function cosineSimilarity(a: Float32Array, b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom > 0 ? dot / denom : 0;
}

async function searchDocsJS(
  queryEmbedding: number[],
  topK: number,
  matchPath: string | null,
  supabase: ReturnType<typeof getSupabaseAdminClient>
): Promise<RetrievedDocChunk[]> {
  const t0 = Date.now();
  const cache = await loadEmbeddingCache(supabase);

  if (cache.length === 0) {
    console.error("[vectorSearch] JS search: cache empty — no embeddings loaded");
    return [];
  }

  // Compute cosine similarity for every cached embedding (brute-force)
  const scored = cache.map(({ id, embedding }) => ({
    id,
    similarity: cosineSimilarity(embedding, queryEmbedding),
  }));

  // Sort descending by similarity, take topK × 3 candidates for path filtering
  scored.sort((a, b) => b.similarity - a.similarity);
  const candidates = scored.slice(0, topK * 3).map((s) => s.id);
  const simMap = new Map(scored.map((s) => [s.id, s.similarity]));

  console.log(
    `[vectorSearch] JS cosine computed in ${Date.now() - t0}ms | top similarity=${scored[0]?.similarity.toFixed(3)}`
  );

  // Fetch full content + metadata for candidates
  let q = supabase
    .from("indigo_docs_embeddings")
    .select("id, content, metadata")
    .in("id", candidates);

  const { data: fullRows, error } = await q;
  if (error || !fullRows) {
    console.error("[vectorSearch] JS search: full row fetch error:", error?.message);
    return [];
  }

  let results: RetrievedDocChunk[] = fullRows.map((row: any) => ({
    id: row.id,
    content: row.content,
    metadata: row.metadata ?? {},
    similarity: simMap.get(row.id) ?? 0,
  }));

  // Apply path filter if the user is viewing a specific doc page
  if (matchPath) {
    const filtered = results.filter(
      (r) => r.metadata?.path === matchPath || r.metadata?.url === matchPath
    );
    // Fall back to unfiltered if path filter eliminates everything
    results = filtered.length > 0 ? filtered : results;
  }

  return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

function extractDocPath(pageUrl: string): string | null {
  try {
    const { pathname } = new URL(pageUrl);
    const clean = pathname.replace(/^\/+/, "").trim();
    return clean || null;
  } catch {
    return null;
  }
}

interface MatchDocsRpcRow {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export interface SearchDocsResult {
  chunks: RetrievedDocChunk[];
  // true  — search ran and found results
  // false — search ran but nothing scored above the similarity threshold
  // null  — search could not run (misconfigured creds, RPC missing, etc.)
  searchAvailable: boolean | null;
  // true when the top similarity score is below SIMILARITY_THRESHOLD and the
  // query does not look like an Indigo docs topic (see isLikelyIndigoDocsQuery).
  outOfScope: boolean;
}

// Pre-warm the embedding cache as soon as this module is first imported.
// Runs in the background so it doesn't block server startup.
// On Vercel warm instances the cache survives across requests; in dev it
// survives hot-module reloads because it lives on globalThis.
(function prewarm() {
  if (_cache.data || _cache.promise) return; // already warm or in-flight
  if (!hasServerEnv()) return; // skip during build or when env not configured
  try {
    const supabase = getSupabaseAdminClient();
    loadEmbeddingCache(supabase).catch((err) =>
      console.error("[vectorSearch] prewarm failed:", err)
    );
  } catch {
    // env invalid — prewarm skipped
  }
})();

export async function searchDocs(
  query: string,
  pageUrl?: string
): Promise<SearchDocsResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { chunks: [], searchAvailable: true, outOfScope: false };
  }

  // --- Embed the query ---
  let queryEmbedding: number[];
  const embedStart = Date.now();
  try {
    const embeddingRes = await getOpenAI().embeddings.create({
      model: EMBEDDING_MODEL,
      input: trimmed,
      dimensions: EMBEDDING_DIMENSIONS,
    });
    const vec = embeddingRes.data[0]?.embedding;
    if (!vec) {
      console.error("[vectorSearch] no embedding vector returned from OpenAI");
      return { chunks: [], searchAvailable: null, outOfScope: false };
    }
    queryEmbedding = vec;
    console.log(`[vectorSearch] embedding ok — ${Date.now() - embedStart}ms`);
  } catch (err) {
    console.error(`[vectorSearch] embedding failed (${Date.now() - embedStart}ms):`, err);
    return { chunks: [], searchAvailable: null, outOfScope: false };
  }

  const supabase = getSupabaseAdminClient();
  const docPath = pageUrl ? extractDocPath(pageUrl) : null;
  const searchStart = Date.now();

  // --- Primary: JS cosine similarity (bypasses broken IVFFlat index) ---
  console.log(`[vectorSearch] JS search | match_path=${docPath ?? "null (all docs)"}`);
  try {
    const chunks = await searchDocsJS(queryEmbedding, DEFAULT_TOP_K, docPath, supabase);
    const elapsed = Date.now() - searchStart;

    if (chunks.length > 0) {
      const topSim = chunks[0].similarity;
      const likelyIndigo = isLikelyIndigoDocsQuery(trimmed);
      const outOfScope =
        topSim < SIMILARITY_THRESHOLD && !likelyIndigo;

      console.log(
        `[vectorSearch] search ok (JS) — ${elapsed}ms | chunks=${chunks.length}` +
        ` | top similarity=${topSim.toFixed(3)}` +
        ` | likelyIndigo=${likelyIndigo}` +
        ` | outOfScope=${outOfScope}` +
        (outOfScope ? "" : ` | sources=[${chunks.map((c) => c.metadata?.path ?? "?").join(", ")}]`)
      );

      // Return no chunks when out-of-scope so the route returns a scoped message
      if (outOfScope) {
        return { chunks: [], searchAvailable: true, outOfScope: true };
      }
      return { chunks, searchAvailable: true, outOfScope: false };
    }

    // Fallback: attempt RPC in case JS cache is empty or server just started
    console.log("[vectorSearch] JS returned 0 chunks, trying SQL RPC fallback...");
  } catch (err) {
    console.error(`[vectorSearch] JS search error:`, err);
  }

  // --- Fallback: SQL RPC (may work after index is fixed) ---
  try {
    const { data, error } = await supabase.rpc("match_indigo_docs_embeddings", {
      query_embedding: `[${queryEmbedding.join(",")}]`,
      match_count: DEFAULT_TOP_K,
      match_path: docPath,
    });

    if (error) {
      console.error(`[vectorSearch] RPC error:`, error.message);
      return { chunks: [], searchAvailable: null, outOfScope: false };
    }

    const chunks = ((data ?? []) as MatchDocsRpcRow[]).map((row) => ({
      id: row.id,
      content: row.content,
      metadata: row.metadata ?? {},
      similarity: row.similarity ?? 0,
    }));

    const topSim = chunks[0]?.similarity ?? 0;
    const likelyIndigo = isLikelyIndigoDocsQuery(trimmed);
    const outOfScope =
      chunks.length > 0 && topSim < SIMILARITY_THRESHOLD && !likelyIndigo;

    console.log(
      `[vectorSearch] search ok (RPC) — ${Date.now() - searchStart}ms | chunks=${chunks.length}` +
      (chunks.length > 0
        ? ` | top similarity=${topSim.toFixed(3)} | likelyIndigo=${likelyIndigo} | outOfScope=${outOfScope}`
        : " | no matches")
    );

    if (outOfScope) {
      return { chunks: [], searchAvailable: true, outOfScope: true };
    }
    return { chunks, searchAvailable: true, outOfScope: false };
  } catch (err) {
    console.error(`[vectorSearch] RPC unexpected error:`, err);
    return { chunks: [], searchAvailable: null, outOfScope: false };
  }
}
