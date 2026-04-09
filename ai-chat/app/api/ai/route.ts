import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CHAT_MODEL, getOpenAI } from "@/lib/openai";
import { hasServerEnv } from "@/lib/env";
import { searchDocs } from "@/lib/vectorSearch";
import { checkRateLimit } from "@/lib/rateLimit";
import type { ChatMessage } from "@/lib/types";
import type { RetrievedDocChunk } from "@/lib/types";

// ---------------- Sensitive data patterns ----------------
// Block sensitive wallet/key material from ever reaching OpenAI.
const SENSITIVE_PATTERNS: { pattern: RegExp; label: string }[] = [
  // Zcash unified / sapling / transparent addresses
  { pattern: /\bu[a-z0-9]{80,}\b/i,      label: "Zcash unified address" },
  { pattern: /\bzs1[a-z0-9]{76,}\b/i,    label: "Zcash shielded address" },
  { pattern: /\bt1[a-zA-Z0-9]{33}\b/,    label: "Zcash transparent address" },
  // Viewing / spending keys
  { pattern: /\bzxviews[a-z0-9]{80,}\b/i, label: "Zcash viewing key" },
  { pattern: /\bsecret-spending-key\b/i,  label: "Zcash spending key" },
  // Generic 24-word BIP39 seed phrase heuristic (12-24 words)
  {
    pattern: /\b([a-z]{3,8}\s){11,23}[a-z]{3,8}\b/,
    label: "seed phrase",
  },
  // Long raw hex strings (private key candidate)
  { pattern: /\b[0-9a-f]{60,}\b/i, label: "private key" },
];

function containsSensitiveData(text: string): string | null {
  for (const { pattern, label } of SENSITIVE_PATTERNS) {
    if (pattern.test(text)) return label;
  }
  return null;
}

// ---------------- Input validation schema ----------------
const RequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  pageUrl: z.string().url().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      })
    )
    .max(20)
    .optional(),
});

// ---------------- Constants ----------------
const REQUEST_TIMEOUT_MS = 60_000;

// Used when we have retrieved doc chunks to ground the answer.
const SYSTEM_PROMPT_WITH_DOCS = `You are the Indigo Hub AI assistant — an expert on the Indigo Protocol education docs.
Answer the user's question using ONLY the documentation sections provided below.
Be concise and accurate. Do NOT reference "sections", "excerpts", or numbered sources in your answer.
After your answer, output exactly this block (replace the placeholder with the actual links given):

**Sources:**
{SOURCE_LINKS}`;

// Used when vector search returned nothing (empty DB, no match, or search unavailable).
const SYSTEM_PROMPT_FALLBACK = `You are the Indigo Hub AI assistant — a knowledgeable assistant about the Indigo Protocol and the Indigo Hub learning initiative.
The documentation search did not return results for this question, so answer from your general knowledge about Indigo Protocol and Indigo Hub.
Be accurate and helpful. Remind the user at the end of your answer that for the most up-to-date details they can visit docs.indigoprotocol.io.`;

// Returned directly (no OpenAI call) when the query is unrelated to Indigo Protocol education docs.
const OUT_OF_SCOPE_ANSWER =
  "I'm Indigo Hub AI, specialized in answering questions about the **Indigo Protocol education docs** and the **Indigo Hub learning initiative** — topics like iAssets (iUSD, iBTC, iETH), CDPs, Stability Pools, INDY staking & governance, and developer resources.\n\n" +
  "Your question doesn't seem to be related to those topics, so I can't provide a useful answer here.\n\n" +
  "If you have a question about Indigo Protocol or Indigo Hub, feel free to ask! You can also browse the full documentation at [docs.indigoprotocol.io](https://docs.indigoprotocol.io/).";

// ---------------- Helpers ----------------
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out")), ms)
  );
  return Promise.race([promise, timeout]);
}

function getCallerIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// Convert a stored doc path like "beginner/intro.md"
// to an Indigo docs site URL under docs.indigoprotocol.io.
function pathToIndigoDocsUrl(rawPath: string): string {
  const INDIGO_DOCS_BASE = "https://docs.indigoprotocol.io/";

  const normalized = rawPath.replace(/^\/+/, "");
  const noDocsPrefix = normalized.replace(/^docs\//, "");
  const withoutExt = noDocsPrefix.replace(/\.md$/i, "");

  // Handle index.md mapping (mkdocs typically maps it to a directory root).
  if (withoutExt === "index") return INDIGO_DOCS_BASE;
  if (withoutExt.endsWith("/index")) {
    return `${INDIGO_DOCS_BASE}${withoutExt.slice(0, -"/index".length)}`;
  }

  return `${INDIGO_DOCS_BASE}${withoutExt}`;
}

/** GitBook stores canonical URLs with `.md`; public pages work without the suffix. */
function formatSourceLinkUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname !== "docs.indigoprotocol.io") return url;
    if (u.pathname.toLowerCase().endsWith(".md")) {
      u.pathname = u.pathname.slice(0, -3);
    }
    return u.toString();
  } catch {
    return url;
  }
}

/** Prefer metadata.canonicalUrl from site crawl embed; else fall back to path-based URL (raw; strip .md at display time). */
function resolveSourceUrl(
  metadata: Record<string, unknown> | undefined,
  pathFallback: string
): string {
  const canon = metadata?.canonicalUrl ?? metadata?.docsUrl;
  if (typeof canon === "string" && /^https?:\/\//i.test(canon)) {
    return canon;
  }
  if (pathFallback) return pathToIndigoDocsUrl(pathFallback);
  return "";
}

// Build a human-readable page title from the file path.
// Uses the last two meaningful path segments for context (parent / filename).
function pathToTitle(rawPath: string): string {
  // Strip repo prefix and extension
  const cleaned = rawPath
    .replace(/^docs\//, "")
    .replace(/\.md$/i, "");

  const parts = cleaned.split("/").filter(Boolean);
  // Take last two segments for context (parent / filename)
  const relevant = parts.slice(-2);

  return relevant
    .map((seg) =>
      seg
        // split camelCase words: "someModuleName" → "Some Module Name"
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        // replace underscores/hyphens with spaces
        .replace(/[_-]+/g, " ")
        // capitalise each word
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim()
    )
    .join(" — ");
}

function buildContextBlock(chunks: RetrievedDocChunk[]): string {
  return chunks
    .map((c, i) => {
      const path = (c.metadata?.path as string) ?? "";
      const rawUrl =
        resolveSourceUrl(c.metadata, path) ||
        ((c.metadata?.url as string) ?? "");
      const url = rawUrl ? formatSourceLinkUrl(rawUrl) : "";
      const label = path ? pathToTitle(path) : "Indigo Docs";
      return `--- Section ${i + 1}: ${label} (${url}) ---\n${c.content}`;
    })
    .join("\n\n");
}

// Extract unique, deduplicated source links from chunks
function buildSourceLinks(chunks: RetrievedDocChunk[]): string {
  const seen = new Set<string>();
  const links: string[] = [];

  for (const chunk of chunks) {
    const path = (chunk.metadata?.path as string) ?? "";
    const rawUrl =
      resolveSourceUrl(chunk.metadata, path) ||
      ((chunk.metadata?.url as string) ?? "");
    const url = rawUrl ? formatSourceLinkUrl(rawUrl) : "";
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const title = path ? pathToTitle(path) : "Indigo Docs";
    links.push(`- [${title}](${url})`);
  }

  return links.join("\n");
}

// ---------------- Route handler ----------------
export async function POST(req: NextRequest) {
  // Rate limiting
  if (!hasServerEnv()) {
    return NextResponse.json(
      {
        error:
          "AI assistant is not configured. Set OPENAI_API_KEY and Supabase variables on the server.",
      },
      { status: 503 }
    );
  }

  const ip = getCallerIp(req);
  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
      }
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Validate inputs
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { message, pageUrl, history = [] } = parsed.data;

  // Block sensitive wallet/key material from ever reaching OpenAI
  const sensitiveMatch = containsSensitiveData(message);
  if (sensitiveMatch) {
    return NextResponse.json(
      {
        error: `Your message appears to contain a ${sensitiveMatch}. For your security, private keys, seed phrases, and wallet addresses should never be shared with any third-party service.`,
      },
      { status: 400 }
    );
  }

  const requestStart = Date.now();
  console.log(`[/api/ai] → request | page=${pageUrl ?? "none"} | historyTurns=${history.length}`);

  try {
    const answer = await withTimeout(
      (async () => {
        // 1. Retrieve relevant doc chunks — never throws, always returns a result
        const { chunks, searchAvailable, outOfScope } = await searchDocs(message, pageUrl);
        const hasContext = chunks.length > 0;

        // 2. Out-of-scope: query is unrelated to Indigo Protocol education docs — return static message
        //    immediately without spending an OpenAI token.
        if (outOfScope) {
          console.log(`[/api/ai] mode=OUT_OF_SCOPE | skipping OpenAI call`);
          return OUT_OF_SCOPE_ANSWER;
        }

        // 3. Choose system prompt and context injection based on what we found
        let systemPrompt: string;
        let contextInjection: string;

        if (hasContext) {
          const sourceLinks = buildSourceLinks(chunks);
          systemPrompt = SYSTEM_PROMPT_WITH_DOCS.replace("{SOURCE_LINKS}", sourceLinks);
          contextInjection = `Use the following documentation sections to answer:\n\n${buildContextBlock(chunks)}`;
          console.log(`[/api/ai] mode=RAG | chunks=${chunks.length} | searchAvailable=${searchAvailable}`);
        } else {
          systemPrompt = SYSTEM_PROMPT_FALLBACK;
          contextInjection =
            searchAvailable === null
              ? "Note: The documentation search is currently unavailable. Answer from general knowledge."
              : "Note: No documentation excerpts matched this query. Answer from general knowledge about Indigo Protocol and Indigo Hub.";
          console.log(`[/api/ai] mode=FALLBACK | chunks=0 | searchAvailable=${searchAvailable}`);
        }

        // 4. Assemble messages
        const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
          { role: "system", content: systemPrompt },
          { role: "user", content: contextInjection },
          ...history.map((h: ChatMessage) => ({
            role: h.role as "user" | "assistant",
            content: h.content,
          })),
          { role: "user", content: message },
        ];

        // 5. Call OpenAI Responses API
        const llmStart = Date.now();
        const response = await getOpenAI().responses.create({
          model: CHAT_MODEL,
          input: messages,
        });
        console.log(`[/api/ai] OpenAI ok — ${Date.now() - llmStart}ms | model=${CHAT_MODEL}`);

        return response.output_text ?? "";
      })(),
      REQUEST_TIMEOUT_MS
    );

    console.log(`[/api/ai] ✓ done — total=${Date.now() - requestStart}ms`);
    return NextResponse.json({ answer });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
    const isTimeout = msg === "Request timed out";

    console.error(`[/api/ai] ✗ error — total=${Date.now() - requestStart}ms | ${msg}`);
    return NextResponse.json(
      { error: isTimeout ? "The request took too long. Try again." : "Failed to get answer." },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
