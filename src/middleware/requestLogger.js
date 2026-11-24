/**
 * requestLogger.js  –  Custom request-logger middleware
 *
 * Covers: Custom Middleware (syllabus)
 *
 * Shows how to write middleware from scratch (beyond Morgan).
 * Logs method, URL, status code, and response time.
 */

'use strict';

const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} → ${res.statusCode} (${ms} ms)`);
  });
  next();
}

module.exports = requestLogger;
