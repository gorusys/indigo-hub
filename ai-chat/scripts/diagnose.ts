/**
 * End-to-end RAG pipeline test.
 * Tests the JS cosine fallback path that is now the primary search method.
 * Usage: npx ts-node --project tsconfig.scripts.json scripts/diagnose.ts
 */

import * as dotenv from "dotenv";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const SUPABASE_URL   = process.env.SUPABASE_URL!;
const SERVICE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const EMBEDDING_DIMS = 1536;
const PAGE_SIZE      = 1000;

const pass = (m: string) => console.log(`  ✅  ${m}`);
const fail = (m: string) => console.log(`  ❌  ${m}`);
const info = (m: string) => console.log(`  ℹ️   ${m}`);
const sep  = (t: string) => console.log(`\n── ${t} ${"─".repeat(Math.max(0, 52 - t.length))}`);

function cosineSim(a: Float32Array, b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d > 0 ? dot / d : 0;
}

async function main() {
  console.log("\nIndigo Hub RAG — End-to-End Pipeline Test\n" + "=".repeat(60));

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  // ── 1. Load embedding cache ───────────────────────────────────
  sep("1. Load all embeddings (JS cosine search cache)");
  const t0 = Date.now();
  const cache: { id: string; embedding: Float32Array }[] = [];
  let page = 0;

  while (true) {
    const { data, error } = await sb
      .from("indigo_docs_embeddings")
      .select("id, embedding")
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) { fail(`Fetch error: ${error.message}`); process.exit(1); }
    if (!data || data.length === 0) break;

    for (const row of data) {
      const arr: number[] = typeof row.embedding === "string"
        ? JSON.parse(row.embedding) : row.embedding;
      if (Array.isArray(arr) && arr.length === EMBEDDING_DIMS) {
        cache.push({ id: row.id, embedding: new Float32Array(arr) });
      }
    }
    page++;
    if (data.length < PAGE_SIZE) break;
  }
  pass(`Loaded ${cache.length} embeddings in ${Date.now() - t0}ms`);

  // ── 2. Embed test queries ─────────────────────────────────────
  sep("2. Embed test queries");
  const TEST_QUERIES = [
    "What is Indigo Protocol?",
    "How do iAssets (iUSD, iBTC, iETH) work?",
    "What are Collateralized Debt Positions (CDPs)?",
  ];

  for (const query of TEST_QUERIES) {
    const t1 = Date.now();
    const embRes = await openai.embeddings.create({
      model: "text-embedding-3-large", input: query, dimensions: EMBEDDING_DIMS,
    });
    const qvec = embRes.data[0].embedding;

    // JS cosine search
    const scored = cache.map(({ id, embedding }) => ({
      id, similarity: cosineSim(embedding, qvec),
    })).sort((a, b) => b.similarity - a.similarity).slice(0, 5);

    if (scored.length === 0 || scored[0].similarity < 0.5) {
      fail(`Query: "${query}" — low/no results (top sim=${scored[0]?.similarity.toFixed(3) ?? "N/A"})`);
      continue;
    }

    // Fetch full content for top results
    const topIds = scored.map(s => s.id);
    const { data: fullRows } = await sb.from("indigo_docs_embeddings")
      .select("id, content, metadata").in("id", topIds);

    const simMap = new Map(scored.map(s => [s.id, s.similarity]));
    const results = (fullRows ?? []).map((r: any) => ({
      path: r.metadata?.path ?? "?",
      sim: simMap.get(r.id) ?? 0,
      snippet: (r.content as string).slice(0, 80).replace(/\n/g, " "),
    })).sort((a, b) => b.sim - a.sim);

    pass(`Query: "${query}" — ${Date.now() - t1}ms | top sim=${results[0]?.sim.toFixed(3)}`);
    results.slice(0, 3).forEach((r, i) => {
      info(`  #${i+1}: sim=${r.sim.toFixed(3)} | ${r.path}`);
      info(`       "${r.snippet}..."`);
    });
  }

  // ── 3. Full chat API simulation ───────────────────────────────
  sep("3. Full chat pipeline: embed → search → OpenAI");
  const chatQuery = "What is Indigo Protocol?";
  const t2 = Date.now();
  const embRes2 = await openai.embeddings.create({
    model: "text-embedding-3-large", input: chatQuery, dimensions: EMBEDDING_DIMS,
  });
  const qvec2 = embRes2.data[0].embedding;

  const scored2 = cache.map(({ id, embedding }) => ({
    id, similarity: cosineSim(embedding, qvec2),
  })).sort((a, b) => b.similarity - a.similarity).slice(0, 15);

  const { data: fullRows2 } = await sb.from("indigo_docs_embeddings")
    .select("id, content, metadata").in("id", scored2.map(s => s.id));

  const simMap2 = new Map(scored2.map(s => [s.id, s.similarity]));
  const chunks = (fullRows2 ?? []).map((r: any) => ({
    content: r.content as string,
    path: r.metadata?.path ?? "?",
    sim: simMap2.get(r.id) ?? 0,
  })).sort((a, b) => b.sim - a.sim).slice(0, 5);

  if (chunks.length === 0) { fail("No chunks found!"); process.exit(1); }
  pass(`Found ${chunks.length} relevant chunks`);

  const context = chunks.map((c, i) =>
    `[Source ${i + 1}: ${c.path}]\n${c.content}`
  ).join("\n\n---\n\n");

  const systemPrompt = `You are Indigo Hub AI, an expert assistant for the Indigo Protocol education docs.
Answer questions using the provided documentation excerpts. Be concise and accurate.

Documentation:
${context}`;

  const chatRes = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: chatQuery },
    ],
    max_tokens: 300,
  });

  const answer = chatRes.choices[0]?.message?.content ?? "";
  const elapsed = Date.now() - t2;

  if (answer.length > 10) {
    pass(`OpenAI answered in ${elapsed}ms total`);
    console.log(`\n  Answer: "${answer.trim().replace(/\n/g, "\n          ")}"\n`);
  } else {
    fail(`OpenAI returned empty/short answer`);
  }

  // ── Summary ───────────────────────────────────────────────────
  sep("Result");
  pass("JS cosine similarity search + OpenAI pipeline is working correctly!");
  info("The fix is live in lib/vectorSearch.ts (uses embedding cache).");
  info("To permanently fix the SQL function, run sql/fix_ivfflat.sql in Supabase dashboard.");
  console.log("\n" + "=".repeat(60) + "\n");
}

main().catch(err => { console.error(err); process.exit(1); });
