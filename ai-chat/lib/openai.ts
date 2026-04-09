import OpenAI from "openai";
import { getServerEnv } from "./env";

let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: getServerEnv().OPENAI_API_KEY,
    });
  }
  return _openai;
}

export const EMBEDDING_MODEL = "text-embedding-3-large";
// Pinned to 1536 dims — pgvector ivfflat/hnsw max is 2000; 1536 matches ada-002
// and is still high quality via OpenAI's Matryoshka dimensionality reduction.
export const EMBEDDING_DIMENSIONS = 1536;
export const CHAT_MODEL = "gpt-4.1-mini";
