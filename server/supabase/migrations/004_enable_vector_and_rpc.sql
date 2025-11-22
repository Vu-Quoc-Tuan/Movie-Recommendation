-- Enable pgvector extension to work with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to movies table
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create an index for faster vector similarity search (IVFFlat)
CREATE INDEX IF NOT EXISTS idx_movies_embedding ON public.movies USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create a function to match movies based on vector similarity
CREATE OR REPLACE FUNCTION match_movies (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  movie_overview TEXT,
  poster_url TEXT,
  year INTEGER,
  genre TEXT[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    movies.id,
    movies.title,
    movies.movie_overview,
    movies.poster_url,
    movies.year,
    movies.genre,
    1 - (movies.embedding <=> query_embedding) as similarity
  FROM movies
  WHERE 1 - (movies.embedding <=> query_embedding) > match_threshold
  ORDER BY movies.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
