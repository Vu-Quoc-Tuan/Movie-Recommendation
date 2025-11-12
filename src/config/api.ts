// API Configuration
// export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:8000' 
  : import.meta.env.VITE_API_URL || `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1`;

export const API_PATH = '/make-server-0c50a72d';
export const API_URL = `${API_BASE_URL}${API_PATH}`;

export const getApiEndpoint = (path: string) => `${API_URL}${path}`;


