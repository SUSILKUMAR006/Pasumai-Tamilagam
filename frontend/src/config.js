// Backend origin (no trailing slash, no /api suffix). Set VITE_API_BASE_URL
// in production (e.g. your Render backend URL); falls back to localhost for dev.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
