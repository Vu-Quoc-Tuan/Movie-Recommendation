-- Ensure mood column exists and is of type TEXT[]
-- If it exists as TEXT (scalar), convert it to TEXT[] (array)
DO $$
DECLARE
    col_type text;
BEGIN
    -- Check if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movies' AND column_name = 'mood') THEN
        SELECT data_type INTO col_type FROM information_schema.columns 
        WHERE table_name = 'movies' AND column_name = 'mood';

        -- If it is 'text' (scalar), convert to array
        IF col_type = 'text' THEN
            ALTER TABLE public.movies ALTER COLUMN mood TYPE TEXT[] USING CASE WHEN mood IS NULL THEN '{}' ELSE ARRAY[mood] END;
        END IF;
    ELSE
        -- If not exists, add it
        ALTER TABLE public.movies ADD COLUMN mood TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Create GIN index for array operations
DROP INDEX IF EXISTS idx_movies_mood;
CREATE INDEX IF NOT EXISTS idx_movies_mood ON public.movies USING GIN(mood);
