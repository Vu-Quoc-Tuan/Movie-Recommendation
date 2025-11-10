-- Create movies table for storing movie data from TMDb
CREATE TABLE IF NOT EXISTS movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    genre TEXT[] NOT NULL DEFAULT '{}',
    country TEXT,
    year INTEGER,
    movie_overview TEXT,
    youtube_link TEXT,
    poster_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(year);
CREATE INDEX IF NOT EXISTS idx_movies_genre ON movies USING GIN(genre);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" 
ON movies FOR SELECT 
TO public 
USING (true);

-- Create policy to allow authenticated users to insert (optional)
CREATE POLICY "Allow authenticated insert" 
ON movies FOR INSERT 
TO authenticated 
WITH CHECK (true);
