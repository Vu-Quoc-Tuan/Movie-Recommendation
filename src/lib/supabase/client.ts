/**
 * Supabase Client for Browser/Client-Side Code
 * 
 * This client is safe to use in the browser because it uses the PUBLIC anon key.
 * It can only perform operations allowed by Row Level Security (RLS) policies.
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLIC_ANON_KEY } from './config';

if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL is not configured. Check your Supabase project settings.');
}

if (!SUPABASE_PUBLIC_ANON_KEY) {
    throw new Error('SUPABASE_PUBLIC_ANON_KEY is not configured. Check your src/lib/supabase/config.ts');
}

/**
 * Main Supabase client instance for all browser-side operations.
 * Use this to query the database, authenticate users, etc.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_ANON_KEY);

export default supabase;
