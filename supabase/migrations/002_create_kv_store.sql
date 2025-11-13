-- Create kv_store table for Deno functions
CREATE TABLE IF NOT EXISTS kv_store_0c50a72d (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_kv_store_key ON kv_store_0c50a72d(key);

-- Enable Row Level Security
ALTER TABLE kv_store_0c50a72d ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" 
ON kv_store_0c50a72d FOR SELECT 
TO public 
USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access" 
ON kv_store_0c50a72d FOR ALL 
TO service_role 
USING (true);