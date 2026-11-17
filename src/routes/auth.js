/**
 * routes/auth.js  –  Authentication endpoints
 *
 * Covers: Express Routing · Body Parsing · Validation/Sanitization ·
 *         Password Hashing (bcryptjs) · JWT · Status Codes (syllabus)
 *
 * POST /api/auth/register   – create account
 * POST /api/auth/login      – sign in, receive JWT
 * GET  /api/auth/me         – get own profile (protected)
 */

'use strict';

const express  = require('express');
const bcrypt   = require('bcryptjs');
const { body } = require('express-validator');

const userStore    = require('../data/users');
const { signToken }= require('../utils/jwt');
const authenticate = require('../middleware/authenticate');
const validate     = require('../middleware/validate');

const router = express.Router();

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password needs an uppercase letter')
      .matches(/[a-z]/).withMessage('Password needs a lowercase letter')
      .matches(/[0-9]/).withMessage('Password needs a number')
      .matches(/[^A-Za-z0-9]/).withMessage('Password needs a special character'),
    // optional: first registered user becomes admin
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;

      if (userStore.findByEmail(email)) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Password Hashing – covers syllabus item
      const passwordHash = await bcrypt.hash(password, 12);
      const user = userStore.create({ name, email, passwordHash, role });

      const token = signToken({ id: user.id, email: user.email, role: user.role });

      res.status(201).json({
        message: 'Account created',
        token,
        user: userStore.safeUser(user),
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = userStore.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = signToken({ id: user.id, email: user.email, role: user.role });

      res.json({
        message: 'Signed in',
        token,
        user: userStore.safeUser(user),
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/auth/me  (protected) ─────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  const user = userStore.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(userStore.safeUser(user));
});

module.exports = router;
