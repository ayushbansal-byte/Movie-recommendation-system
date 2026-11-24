/**
 * AppError.js  –  Custom operational error class
 *
 * Covers (Unit 5): Custom Errors · Error Handling
 *
 * Usage:  throw new AppError('Movie not found', 404);
 */

'use strict';

class AppError extends Error {
  /**
   * @param {string} message  Human-readable error message
   * @param {number} status   HTTP status code
   */
  constructor(message, status = 500) {
    super(message);
    this.status      = status;
    this.isOperational = true;   // distinguishes from programmer errors
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
