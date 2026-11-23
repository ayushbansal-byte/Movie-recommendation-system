/**
 * api/axios.js  –  Axios instance
 *
 * Covers (Unit 6): API Integration with Axios/Fetch
 * Covers (Unit 7): JWT Storage · Auth Context · Connecting React with Node/Express APIs
 *
 * - baseURL uses the Vite proxy (/api) so no hardcoded host
 * - Request interceptor injects Bearer token from localStorage
 * - Response interceptor handles 401 (token expired → logout)
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor – attach JWT (Unit 7) ─────────────────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('mm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor – handle auth errors (Unit 7) ───────────────────────
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // Token expired or invalid – clear storage and redirect
      localStorage.removeItem('mm_token');
      localStorage.removeItem('mm_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
