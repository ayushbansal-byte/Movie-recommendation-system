/**
 * routes/users.js  –  User management endpoints
 *
 * Covers: Protected Routes · Role-Based Access · REST API Design (syllabus)
 *
 * GET  /api/users        – list all users  (admin only)
 * GET  /api/users/:id    – get one user    (admin OR own profile)
 */

'use strict';

const express = require('express');
const { param } = require('express-validator');

const userStore    = require('../data/users');
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');
const validate     = require('../middleware/validate');

const router = express.Router();

// ── GET /api/users  (admin only) ─────────────────────────────────────────────
router.get('/', authenticate, authorize('admin'), (_req, res) => {
  res.json(userStore.all());
});

// ── GET /api/users/:id  (admin or own profile) ───────────────────────────────
router.get(
  '/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid user ID')],
  validate,
  (req, res) => {
    // Allow admins to see any profile; regular users can only see their own
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const user = userStore.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(userStore.safeUser(user));
  }
);

module.exports = router;
