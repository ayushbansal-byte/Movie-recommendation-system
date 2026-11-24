/**
 * authenticate.js  –  JWT Auth Middleware
 *
 * Covers: Auth Middleware · Protected Routes (syllabus)
 *
 * Usage: router.get('/protected', authenticate, handler)
 *
 * Reads the Authorization header:  Bearer <token>
 * Attaches decoded payload to req.user on success.
 */

'use strict';

const { verifyToken } = require('../utils/jwt');

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authenticate;
