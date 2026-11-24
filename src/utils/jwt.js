/**
 * jwt.js  –  JWT helpers
 *
 * Covers: JWT (syllabus) – sign + verify tokens
 */

'use strict';

const jwt = require('jsonwebtoken');

const SECRET     = process.env.JWT_SECRET     || 'movie_mania_dev_secret_change_in_prod';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a signed JWT for the given payload.
 * @param {object} payload  – e.g. { id, email, role }
 * @returns {string}
 */
function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

/**
 * Verify and decode a JWT.
 * @param {string} token
 * @returns {object}  decoded payload
 * @throws  JsonWebTokenError / TokenExpiredError
 */
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };
