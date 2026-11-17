/**
 * errorHandler.js  –  Global Express error-handling middleware
 *
 * Covers: Error Handling Middleware (syllabus)
 * Must be the LAST app.use() call in app.js (4-arg signature).
 */

'use strict';

const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack });

  const status  = err.status || err.statusCode || 500;
  const message = err.expose ? err.message : 'Internal server error';

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
