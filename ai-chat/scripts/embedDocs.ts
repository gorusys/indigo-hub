/**
 * Embedding ingestion script.
 * Usage: npx ts-node --project tsconfig.scripts.json scripts/embedDocs.ts
 *
 * Reads all .md files under /docs, chunks them, creates embeddings via
 * text-embedding-3-large, and upserts into the Supabase indigo_docs_embeddings table.
 */

import { readdir, readFile } from "fs/promises";
import { join, relative } from "path";
import { v4 as uuidv4 } from "uuid";
import * as dotenv from "dotenv";
import OpenAI from "openai";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { chunkMarkdown } from "../lib/chunking";

dotenv.config({ path: ".env.local" });

const DOCS_DIR = join(process.cwd(), "docs");
const EMBEDDING_MODEL = "text-embedding-3-large";
// Pinned to 1536 dims — pgvector ivfflat/hnsw max is 2000
const EMBEDDING_DIMENSIONS = 1536;
const BATCH_SIZE = 10; // embeddings sent per OpenAI call

// -------- Bootstrap clients (script context, not Next.js server) --------
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

// -------- Collect all .md file paths recursively --------
async function collectMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectMarkdownFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }

  return results;
}

// -------- Embed a batch of strings in a single API call --------
async function embedBatch(
  openai: OpenAI,
  inputs: string[]
): Promise<number[][]> {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: inputs,
    dimensions: EMBEDDING_DIMENSIONS,
  });
  return res.data.map((d) => d.embedding);
}

// -------- Upsert rows into Supabase --------
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
  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }
}

// -------- Main --------
async function main() {
  const { openai, supabase } = buildClients();
  const files = await collectMarkdownFiles(DOCS_DIR);
  console.log(`Found ${files.length} markdown file(s) in ${DOCS_DIR}`);

  let totalChunks = 0;

  for (const filePath of files) {
    const content = await readFile(filePath, "utf-8");
    const relPath = relative(DOCS_DIR, filePath);
    const chunks = chunkMarkdown(content);

    if (!chunks.length) {
      console.log(`  [skip] ${relPath} — no content after chunking`);
      continue;
    }

    console.log(`  ${relPath}: ${chunks.length} chunk(s)`);

    // Process in batches to stay within rate limits
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const embeddings = await embedBatch(openai, batch);

      const rows: EmbeddingRow[] = batch.map((chunkText, j) => ({
        id: uuidv4(),
        content: chunkText,
        embedding: embeddings[j],
        metadata: {
          path: relPath,
          file: filePath,
          chunkIndex: i + j,
        },
      }));

      await upsertRows(supabase, rows);
      totalChunks += batch.length;
      console.log(`    upserted chunks ${i + 1}-${i + batch.length}`);
    }
  }

  console.log(`\nDone. ${totalChunks} chunk(s) stored in indigo_docs_embeddings.`);
}

main().catch((err) => {
  console.error("Embed script failed:", err);
  process.exit(1);
});
