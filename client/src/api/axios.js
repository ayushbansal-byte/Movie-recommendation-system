/**
 * axios.js  –  Axios instance
 *
 * Covers (syllabus):
 *   API Integration with Axios/Fetch · JWT Storage ·
 *   Connecting React with Node/Express APIs · Environment Variables
 */
import axios from 'axios';

// Environment Variables (syllabus) – base URL from .env or proxy fallback
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor – attach JWT token (Auth Context / syllabus) ─────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('movieManiaToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor – normalise errors ───────────────────────────────────
api.interceptors.response.use(
  res  => res,
  err  => {
    const message = err.response?.data?.error || err.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export default api;
