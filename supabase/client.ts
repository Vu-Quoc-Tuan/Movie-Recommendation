import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, '../.env') });

import { createClient } from '@supabase/supabase-js';
import info from "../src/lib/supabase/info";


const SUPABASE_PROJECT_ID = info?.SUPABASE_PROJECT_ID || info?.projectId || process.env.SUPABASE_PROJECT_ID;
const SUPABASE_PUBLIC_ANON_KEY = info?.SUPABASE_PUBLIC_ANON_KEY || info?.publicAnonKey || process.env.SUPABASE_PUBLIC_ANON_KEY;

if (!SUPABASE_PROJECT_ID) {
  throw new Error('SUPABASE_PROJECT_ID not found. Set it in src/lib/supabase/info.ts or as an env var.');
}

if (!SUPABASE_PUBLIC_ANON_KEY) {
  throw new Error('SUPABASE_PUBLIC_ANON_KEY not found. Set it in src/lib/supabase/info.ts or as an env var.');
}

const supabaseUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co`;

export const supabase = createClient(supabaseUrl, SUPABASE_PUBLIC_ANON_KEY);

// Test connection
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('movies').select('count');
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet
      console.error('Connection error:', error);
      return false;
    }
    console.log('✓ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    return false;
  }
}
