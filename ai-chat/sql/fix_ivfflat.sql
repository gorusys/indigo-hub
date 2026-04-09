-- =============================================================================
-- ROOT CAUSE: IVFFlat index was created before/during data ingestion.
-- IVFFlat requires cluster centroids trained on populated data.
-- With probes=1 (default), only 1 of 100 clusters is searched — vectors that
-- land in unpopulated clusters return 0 results.
--
-- This script fixes the issue. Run it once in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rxqbomdoivkxxaukrzzo/sql
-- =============================================================================

-- Step 1: Drop the broken IVFFlat index
DROP INDEX IF EXISTS indigo_docs_embeddings_embedding_idx;

-- Step 2: Recreate the IVFFlat index WITH data present (correct centroids)
-- 2329 rows with lists=50 is appropriate (rule of thumb: sqrt(n) ≤ lists ≤ n/3)
CREATE INDEX indigo_docs_embeddings_embedding_idx
  ON public.indigo_docs_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- Step 3: Drop all overloaded versions of the RPC function
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT oid::regprocedure AS sig
    FROM pg_proc
    WHERE proname = 'match_indigo_docs_embeddings'
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig;
  END LOOP;
END$$;

-- Step 4: Recreate the RPC function using PL/pgSQL so we can set ivfflat.probes
-- Accepting query_embedding as text to avoid PostgREST json→vector cast issues
CREATE OR REPLACE FUNCTION public.match_indigo_docs_embeddings(
  query_embedding text,
  match_count     integer DEFAULT 5,
  match_path      text    DEFAULT NULL
)
RETURNS TABLE (id uuid, content text, metadata jsonb, similarity float)
LANGUAGE plpgsql STABLE AS $$
BEGIN
  -- Probe 10 clusters instead of default 1 for much better recall
  SET LOCAL ivfflat.probes = 10;

  RETURN QUERY
    SELECT de.id, de.content, de.metadata,
           1 - (de.embedding <=> query_embedding::vector) AS similarity
    FROM public.indigo_docs_embeddings de
    WHERE match_path IS NULL
       OR de.metadata->>'path' = match_path
       OR de.metadata->>'url'  = match_path
    ORDER BY de.embedding <=> query_embedding::vector
    LIMIT GREATEST(match_count, 1);
END;
$$;

-- Step 5: Force PostgREST schema cache reload
SELECT pg_notify('pgrst', 'reload schema');

-- Step 6: Smoke test — should return 5 rows with valid similarity scores
SELECT id, metadata->>'path' AS path, similarity
FROM match_indigo_docs_embeddings(
  (SELECT embedding::text FROM public.indigo_docs_embeddings ORDER BY random() LIMIT 1),
  5,
  NULL
);
