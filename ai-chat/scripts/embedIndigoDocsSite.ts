/**
 * Embed docs.indigoprotocol.io (GitBook) markdown pages into Supabase.
 *
 * Crawls /readme/*.md links starting from /readme.md so chunk metadata stores
 * the real canonical URL (no 404s from guessing local mkdocs paths).
 *
 * Usage: npx ts-node --project tsconfig.scripts.json scripts/embedIndigoDocsSite.ts
 */

import * as dotenv from "dotenv";
import OpenAI from "openai";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { v5 as uuidv5 } from "uuid";

import { chunkMarkdown } from "../lib/chunking";
import {
  extractMarkdownLinksToMdPages,
  normalizeDocsSiteUrl,
  INDIGO_DOCS_ENTRY,
} from "../lib/indigoDocsSite";

dotenv.config({ path: ".env.local" });

const EMBEDDING_MODEL = "text-embedding-3-large";
const EMBEDDING_DIMENSIONS = 1536;
const BATCH_SIZE = 10;
const FETCH_DELAY_MS = 200;
/** UUID v5 namespace — stable ids per (canonicalUrl + chunkIndex) */
const ROW_ID_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

function rowId(canonicalUrl: string, chunkIndex: number): string {
  return uuidv5(`${canonicalUrl}#${chunkIndex}`, ROW_ID_NAMESPACE);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildClients() {
  const apiKey = process.env.OPENAI_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !supabaseUrl || !serviceRole) {
    throw new Error(
      "Missing env vars: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return {
    openai: new OpenAI({ apiKey }),
    supabase: createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }),
  };
}

async function fetchMarkdown(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      Accept: "text/markdown,text/plain,*/*",
      "User-Agent": "IndigoAI-embed/1.0 (+https://github.com/gorusys/indigo-hub)",
    },
  });
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

async function embedBatch(openai: OpenAI, inputs: string[]): Promise<number[][]> {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: inputs,
    dimensions: EMBEDDING_DIMENSIONS,
  });
  return res.data.map((d) => d.embedding);
}

interface EmbeddingRow {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

async function upsertRows(supabase: SupabaseClient, rows: EmbeddingRow[]) {
  const { error } = await supabase.from("indigo_docs_embeddings").upsert(rows, {
    onConflict: "id",
  });
  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
}

async function clearEmbeddings(supabase: SupabaseClient) {
  const { error } = await supabase
    .from("indigo_docs_embeddings")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) console.warn("[embed-site] clear table warning:", error.message);
}

async function main() {
  const { openai, supabase } = buildClients();

  console.log(`[embed-site] Crawling + embedding from ${INDIGO_DOCS_ENTRY}`);
  await clearEmbeddings(supabase);

  const queue: string[] = [INDIGO_DOCS_ENTRY];
  const seen = new Set<string>();
  let totalChunks = 0;
  let pages = 0;

  while (queue.length > 0) {
    const raw = queue.shift()!;
    const url = normalizeDocsSiteUrl(raw);
    if (seen.has(url)) continue;
    seen.add(url);

    await sleep(FETCH_DELAY_MS);

    let markdown: string;
    try {
      markdown = await fetchMarkdown(url);
    } catch (e) {
      console.warn(`[embed-site] skip ${url}:`, e instanceof Error ? e.message : e);
      continue;
    }

    pages += 1;
    const pathname = new URL(url).pathname.replace(/^\/+/, "");

    const chunks = chunkMarkdown(markdown);
    if (!chunks.length) {
      console.log(`  [skip] ${pathname} — empty after chunking`);
    } else {
      console.log(`  ${pathname}: ${chunks.length} chunk(s)`);
    }

    for (const next of extractMarkdownLinksToMdPages(markdown, url)) {
      const n = normalizeDocsSiteUrl(next);
      if (!seen.has(n)) queue.push(n);
    }

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const embeddings = await embedBatch(openai, batch);

      const rows: EmbeddingRow[] = batch.map((chunkText, j) => {
        const chunkIndex = i + j;
        return {
          id: rowId(url, chunkIndex),
          content: chunkText,
          embedding: embeddings[j],
          metadata: {
            source: "docs.indigoprotocol.io",
            canonicalUrl: url,
            path: pathname,
            chunkIndex,
          },
        };
      });

      await upsertRows(supabase, rows);
      totalChunks += batch.length;
    }
  }

  console.log(`\n[embed-site] Done. ${pages} page(s), ${totalChunks} chunk(s) in indigo_docs_embeddings.`);
}

main().catch((err) => {
  console.error("embedIndigoDocsSite failed:", err);
  process.exit(1);
});
