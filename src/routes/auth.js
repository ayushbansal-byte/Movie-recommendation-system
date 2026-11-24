/**
 * routes/auth.js  –  Authentication endpoints
 *
 * Covers (Unit 4): Routing · Body Parsing · Validation · JWT · Password Hashing
 * Covers (Unit 5): Mongoose model usage · Custom Errors
 * Covers (Unit 7): Authentication Flow · JWT Storage · Environment Variables
 *
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/logout     (client-side token drop, server just confirms)
 * GET  /api/auth/me
 */

'use strict';

const express      = require('express');
const { body }     = require('express-validator');
const mongoose     = require('mongoose');

const { signToken }  = require('../utils/jwt');
const AppError       = require('../utils/AppError');
const authenticate   = require('../middleware/authenticate');
const validate       = require('../middleware/validate');

// Use Mongoose model when DB is connected, fall back to in-memory store
function getStore() {
  if (mongoose.connection.readyState === 1) return require('../models/User');
  return require('../data/users');
}

const router = express.Router();

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })       .withMessage('At least 8 characters')
      .matches(/[A-Z]/)           .withMessage('One uppercase letter required')
      .matches(/[a-z]/)           .withMessage('One lowercase letter required')
      .matches(/[0-9]/)           .withMessage('One number required')
      .matches(/[^A-Za-z0-9]/)   .withMessage('One special character required'),
    body('role').optional().isIn(['user', 'admin']),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;
      const Store = getStore();
      const isMongoose = mongoose.connection.readyState === 1;

      // ── Mongoose path ────────────────────────────────────────────────────────
      if (isMongoose) {
        const exists = await Store.findOne({ email });
        if (exists) return next(new AppError('Email already registered', 409));

        const user  = await Store.create({ name, email, password, role });
        const token = signToken({ id: user._id, email: user.email, role: user.role });
        return res.status(201).json({ message: 'Account created', token, user });
      }

      // ── In-memory fallback ───────────────────────────────────────────────────
      const bcrypt = require('bcryptjs');
      if (Store.findByEmail(email)) return next(new AppError('Email already registered', 409));
      const passwordHash = await bcrypt.hash(password, 12);
      const user  = Store.create({ name, email, passwordHash, role });
      const token = signToken({ id: user.id, email: user.email, role: user.role });
      return res.status(201).json({ message: 'Account created', token, user: Store.safeUser(user) });
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
      const Store = getStore();
      const isMongoose = mongoose.connection.readyState === 1;

      // ── Mongoose path ────────────────────────────────────────────────────────
      if (isMongoose) {
        const user = await Store.findByEmail(email);
        if (!user || !(await user.comparePassword(password))) {
          return next(new AppError('Invalid email or password', 401));
        }
        const token = signToken({ id: user._id, email: user.email, role: user.role });
        user.password = undefined;
        return res.json({ message: 'Signed in', token, user });
      }

      // ── In-memory fallback ───────────────────────────────────────────────────
      const bcrypt = require('bcryptjs');
      const user   = Store.findByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return next(new AppError('Invalid email or password', 401));
      }
      const token = signToken({ id: user.id, email: user.email, role: user.role });
      return res.json({ message: 'Signed in', token, user: Store.safeUser(user) });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
// JWT is stateless – the client drops the token. Server just confirms.
router.post('/logout', authenticate, (_req, res) => {
  res.json({ message: 'Logged out. Please discard your token on the client.' });
});

// ── GET /api/auth/me  (protected) ─────────────────────────────────────────────
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const Store = getStore();
    const isMongoose = mongoose.connection.readyState === 1;
    if (isMongoose) {
      const user = await Store.findById(req.user.id);
      if (!user) return next(new AppError('User not found', 404));
      return res.json(user);
    }
    const user = Store.findById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));
    res.json(Store.safeUser(user));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
