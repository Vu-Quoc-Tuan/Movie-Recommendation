import { projectId } from '../supabase/info';

// API Configuration
const isDevelopment = import.meta.env.DEV;

// Use local proxy in development to avoid CORS issues
// Use Supabase Edge Functions URL in production
export const API_BASE_URL = isDevelopment 
  ? '/api' 
  : import.meta.env.VITE_API_URL || `https://${projectId}.supabase.co/functions/v1`;

export const API_PATH = '/make-server';
export const API_URL = `${API_BASE_URL}${API_PATH}`;

export const getApiEndpoint = (path: string) => `${API_URL}${path}`;


