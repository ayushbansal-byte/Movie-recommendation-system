/**
 * vite.config.js
 *
 * Covers (Unit 7): Proxy Setup
 * During development Vite proxies /api/* to the Express backend at :3000
 * so there are no CORS issues and no hardcoded URLs in the React code.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
