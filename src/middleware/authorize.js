/**
 * authorize.js  –  Role-Based Access Control Middleware
 *
 * Covers: Role-Based Access (syllabus)
 *
 * Usage:
 *   router.delete('/:id', authenticate, authorize('admin'), handler)
 *
 * @param {...string} roles  One or more allowed roles.
 */

'use strict';

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
}

module.exports = authorize;
