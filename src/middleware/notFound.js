/**
 * notFound.js  –  404 catch-all middleware
 * Covers: Status Codes, Custom Middleware (syllabus)
 */

'use strict';

function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = notFoundHandler;
