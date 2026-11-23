/**
 * errorHandler.js  –  Global Express error-handling middleware
 *
 * Covers (Unit 5): Error Handling · Custom Errors · Mongoose validation errors
 * Covers (Unit 4): Error Handling Middleware
 *
 * Handles:
 *   - AppError (operational)
 *   - Mongoose ValidationError
 *   - Mongoose CastError  (invalid ObjectId)
 *   - Mongoose duplicate key (code 11000)
 *   - JWT errors
 *   - Generic 500
 */

'use strict';

const logger   = require('../utils/logger');
const AppError = require('../utils/AppError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let error = { ...err, message: err.message, status: err.status || 500 };

  // ── Mongoose: bad ObjectId ──────────────────────────────────────────────────
  if (err.name === 'CastError') {
    error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  // ── Mongoose: duplicate key ─────────────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new AppError(`Duplicate value for '${field}'. Please use a different value.`, 409);
  }

  // ── Mongoose: schema validation ─────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    error = new AppError(messages.join('. '), 422);
  }

  // ── JWT: invalid token ──────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }

  // ── JWT: expired token ──────────────────────────────────────────────────────
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired. Please log in again.', 401);
  }

  // ── Multer: file size ───────────────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new AppError('File too large. Maximum size is 5 MB.', 400);
  }

  // ── Log non-operational errors (programmer bugs) ───────────────────────────
  if (!error.isOperational) {
    logger.error('UNHANDLED ERROR:', err);
  }

  const status  = error.status || 500;
  const message = error.isOperational ? error.message : 'Internal server error';

  res.status(status).json({
    error:   message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
