-- ============================================================================
-- Migration 00005: pgvector Embeddings for FlowE Knowledge
--
-- Enables vector similarity search for FlowE's knowledge retrieval.
-- Uses Vertex AI textembedding-gecko (768 dimensions) for embeddings.
-- This upgrades the keyword-based retrieval to semantic search.
-- ============================================================================

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to flowe_knowledge
ALTER TABLE flowe_knowledge
  ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create an IVFFlat index for approximate nearest neighbor search
-- (will become effective once we have > 100 rows with embeddings)
-- Using cosine distance for text similarity
CREATE INDEX IF NOT EXISTS idx_flowe_knowledge_embedding
  ON flowe_knowledge
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);

-- Semantic search function: find knowledge entries similar to a query embedding
CREATE OR REPLACE FUNCTION match_flowe_knowledge(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_category text DEFAULT NULL,
  filter_org_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  category text,
  title text,
  content text,
  keywords text[],
  tags text[],
  example_question text,
  example_response text,
  confidence real,
  source text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fk.id,
    fk.category,
    fk.title,
    fk.content,
    fk.keywords,
    fk.tags,
    fk.example_question,
    fk.example_response,
    fk.confidence,
    fk.source,
    1 - (fk.embedding <=> query_embedding) AS similarity
  FROM flowe_knowledge fk
  WHERE
    fk.is_active = true
    AND fk.embedding IS NOT NULL
    AND 1 - (fk.embedding <=> query_embedding) > match_threshold
    AND (filter_category IS NULL OR fk.category = filter_category)
    AND (filter_org_id IS NULL OR fk.organization_id IS NULL OR fk.organization_id = filter_org_id)
  ORDER BY fk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION match_flowe_knowledge TO authenticated;
GRANT EXECUTE ON FUNCTION match_flowe_knowledge TO service_role;
