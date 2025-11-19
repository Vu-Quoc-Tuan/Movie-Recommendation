/**
 * Centralized Supabase Configuration
 * 
 * This file consolidates all Supabase project settings and provides
 * helper functions for building URLs and headers dynamically.
 */

import { projectId, publicAnonKey } from './info';

// Export core configuration
export const SUPABASE_PROJECT_ID = projectId;
export const SUPABASE_PUBLIC_ANON_KEY = publicAnonKey;
export const SUPABASE_URL = `https://${projectId}.supabase.co`;

// Edge function configuration
export const SUPABASE_FUNCTION_NAME = 'make-server-0c50a72d';

/**
 * Builds a complete URL for Supabase Edge Functions
 * @param route - The route/path after the function name (e.g., 'auth/login', 'user/save')
 * @returns Full URL to the edge function
 */
export function buildFunctionUrl(route: string): string {
    return `${SUPABASE_URL}/functions/v1/${SUPABASE_FUNCTION_NAME}/${route}`;
}

/**
 * Builds authorization headers for Edge Function requests
 * @returns Object with Authorization header containing the anon key
 */
export function buildFunctionHeaders(): Record<string, string> {
    return {
        'Authorization': `Bearer ${SUPABASE_PUBLIC_ANON_KEY}`,
    };
}
