/**
 * server.js  –  Movie Mania  –  Express entry point
 *
 * Covers (syllabus):
 *   Node.js Basics · HTTP Module · Creating Server · Request/Response
 *   Express Setup · Middleware · Routing · Route Params · Query Params
 *   Body Parsing · REST API Design · CRUD Endpoints · Status Codes
 *   Error Handling Middleware · Custom Middleware · Validation/Sanitization
 *   JWT · Password Hashing · Auth Middleware · Protected Routes
 *   Role-Based Access · File Upload (Multer) · Logging (Morgan)
 */

'use strict';

const path    = require('path');
const http    = require('http');           // Node core HTTP module
const app     = require('./src/app');      // Express application
const logger  = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

// ── Create HTTP server (wraps Express, keeps Node HTTP module visible) ──
const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`Movie Mania API listening on http://localhost:${PORT}`);
  logger.info(`Static frontend → http://localhost:${PORT}/`);
});

// ── Graceful shutdown ──
process.on('SIGTERM', () => {
  logger.info('SIGTERM received – shutting down');
  server.close(() => process.exit(0));
});

module.exports = server; // needed by Jest / Supertest
