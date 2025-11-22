/**
 * Get API endpoint URL for NestJS backend
 * Uses Vite proxy in development (/api) or direct URL in production
 */
export function getApiEndpoint(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In development, Vite proxy rewrites /api to http://localhost:8000
  // In production, you may need to set VITE_API_URL environment variable
  const baseUrl = import.meta.env.VITE_API_URL || '/api';
  
  // NestJS endpoints have prefix /make-server
  const fullPath = `/make-server/${cleanPath}`;
  
  return `${baseUrl}${fullPath}`;
}

