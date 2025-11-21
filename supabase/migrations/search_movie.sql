CREATE OR REPLACE FUNCTION search_movie(
    query_embedding vector(1024),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    title text,
    movie_overview text,
    similarity float
)
LANGUAGE sql STABLE
AS $$
    SELECT
        m.id,
        m.title,
        m.movie_overview,
        1 - (m.embedding <=> query_embedding) as similarity
    FROM movies m
    WHERE m.embedding IS NOT NULL
        AND 1 - (m.embedding <=> query_embedding) > match_threshold
    ORDER BY m.embedding <=> query_embedding
    LIMIT match_count
$$;