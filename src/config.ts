// src/config.ts

// Automatically uses Vercel's environment variable if available, 
// otherwise falls back to your live Render backend URL.
export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 'https://devlens-ai-9a3w.onrender.com';