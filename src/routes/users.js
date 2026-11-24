/**
 * routes/users.js  –  User management
 *
 * Covers (Unit 5): Mongoose queries · Populate (watchlist)
 * Covers (Unit 7): Role-Based UI
 *
 * GET    /api/users              – list all (admin)
 * GET    /api/users/:id          – get one (admin or own)
 * PATCH  /api/users/:id/watchlist – add/remove movie from watchlist
 */

'use strict';

const express      = require('express');
const { param, body } = require('express-validator');
const mongoose     = require('mongoose');

const AppError     = require('../utils/AppError');
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');
const validate     = require('../middleware/validate');

function getModel() {
  if (mongoose.connection.readyState === 1) return require('../models/User');
  return null;
}
function getStore() { return require('../data/users'); }

const router = express.Router();

// ── GET /api/users  (admin) ───────────────────────────────────────────────────
router.get('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const Model = getModel();
    if (Model) {
      const users = await Model.find().select('-password');
      return res.json(users);
    }
    res.json(getStore().all());
  } catch (err) { next(err); }
});

// ── GET /api/users/:id  (admin or own) ───────────────────────────────────────
router.get(
  '/:id',
  authenticate,
  async (req, res, next) => {
    try {
      const isOwnProfile = req.user.id === req.params.id;
      if (req.user.role !== 'admin' && !isOwnProfile) {
        return next(new AppError('Forbidden', 403));
      }

      const Model = getModel();
      if (Model) {
        const user = await Model.findById(req.params.id)
          .populate('watchlist', 'title genre year rating poster'); // Populate
        if (!user) return next(new AppError('User not found', 404));
        return res.json(user);
      }
      const user = getStore().findById(req.params.id);
      if (!user) return next(new AppError('User not found', 404));
      res.json(getStore().safeUser(user));
    } catch (err) { next(err); }
  }
);

// ── PATCH /api/users/:id/watchlist  (own account) ────────────────────────────
// body: { action: 'add'|'remove', movieId }
router.patch(
  '/:id/watchlist',
  authenticate,
  [
    body('action').isIn(['add', 'remove']).withMessage('Action must be add or remove'),
    body('movieId').notEmpty().withMessage('movieId is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return next(new AppError('Forbidden', 403));
      }
      const Model = getModel();
      if (!Model) return next(new AppError('Watchlist requires database connection', 503));

      const { action, movieId } = req.body;
      const update = action === 'add'
        ? { $addToSet: { watchlist: movieId } }
        : { $pull:    { watchlist: movieId } };

      const user = await Model.findByIdAndUpdate(req.params.id, update, { new: true })
        .populate('watchlist', 'title genre year rating poster');

      if (!user) return next(new AppError('User not found', 404));
      res.json({ message: `Movie ${action}ed`, watchlist: user.watchlist });
    } catch (err) { next(err); }
  }
);

module.exports = router;
