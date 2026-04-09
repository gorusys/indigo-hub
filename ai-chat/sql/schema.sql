-- Enable pgvector support.
create extension if not exists vector;

-- Embeddings table for chunked markdown docs.
-- Dimensions pinned to 1536: text-embedding-3-large with dimensions=1536
-- (OpenAI Matryoshka reduction). ivfflat/hnsw max is 2000 dims.
create table if not exists public.indigo_docs_embeddings (
  id uuid primary key,
  content text not null,
  embedding vector(1536) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- IVFFlat ANN index for cosine similarity search.
create index if not exists indigo_docs_embeddings_embedding_idx
  on public.indigo_docs_embeddings
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists indigo_docs_embeddings_metadata_path_idx
  on public.indigo_docs_embeddings ((metadata->>'path'));

-- Drop all overloaded versions before recreating to avoid ambiguous dispatch.
drop function if exists public.match_indigo_docs_embeddings(vector(3072), integer, text);
drop function if exists public.match_indigo_docs_embeddings(vector(1536), integer, text);
drop function if exists public.match_indigo_docs_embeddings(vector, integer, text);
drop function if exists public.match_indigo_docs_embeddings(text, integer, text);

-- RPC function used by the API for semantic retrieval.
-- Accepts query_embedding as text ("[0.1,0.2,...]") so PostgREST can pass it
-- without ambiguous type casting from JSON → pgvector.
create or replace function public.match_indigo_docs_embeddings(
  query_embedding text,
  match_count integer default 5,
  match_path text default null
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql
stable
as $$
  select
    de.id,
    de.content,
    de.metadata,
    1 - (de.embedding <=> query_embedding::vector) as similarity
  from public.indigo_docs_embeddings de
  where
    match_path is null
    or de.metadata->>'path' = match_path
    or de.metadata->>'url' = match_path
  order by de.embedding <=> query_embedding::vector
  limit greatest(match_count, 1);
$$;
