/**
 * routes/movies.js  –  Movies REST API
 *
 * Covers: REST API Design · CRUD Endpoints · Route Params · Query Params ·
 *         Status Codes · Protected Routes · Role-Based Access (syllabus)
 *
 * GET    /api/movies           – list / filter movies (public)
 * GET    /api/movies/:id       – get one movie (public)
 * POST   /api/movies           – add a movie (admin only)
 * PUT    /api/movies/:id       – replace a movie (admin only)
 * PATCH  /api/movies/:id       – partial update  (admin only)
 * DELETE /api/movies/:id       – delete a movie  (admin only)
 */

'use strict';

const express  = require('express');
const { body, query, param } = require('express-validator');

const movieStore   = require('../data/movies');
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');
const validate     = require('../middleware/validate');

const router = express.Router();

// ── Shared validation for create/update ──────────────────────────────────────
const movieBody = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('genre').trim().notEmpty().withMessage('Genre is required'),
  body('year')
    .isInt({ min: 1900, max: 2100 }).withMessage('Year must be between 1900 and 2100'),
  body('rating')
    .isFloat({ min: 0, max: 10 }).withMessage('Rating must be 0–10'),
  body('audio').trim().notEmpty().withMessage('Audio field is required'),
  body('poster').optional().isURL().withMessage('Poster must be a valid URL'),
];

// ── GET /api/movies  (Query Params filtering) ─────────────────────────────────
router.get(
  '/',
  [
    query('genre').optional().trim(),
    query('year').optional().isInt({ min: 1900, max: 2100 }),
    query('minRating').optional().isFloat({ min: 0, max: 10 }),
    query('search').optional().trim(),
  ],
  validate,
  (req, res) => {
    const { genre, year, minRating, search } = req.query;
    const results = movieStore.getAll({ genre, year, minRating, search });
    res.json({ count: results.length, movies: results });
  }
);

// ── GET /api/movies/:id  (Route Params) ───────────────────────────────────────
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid movie ID')],
  validate,
  (req, res) => {
    const movie = movieStore.getById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  }
);

// ── POST /api/movies  (admin only) ───────────────────────────────────────────
router.post(
  '/',
  authenticate,
  authorize('admin'),
  movieBody,
  validate,
  (req, res) => {
    const movie = movieStore.create({ ...req.body, addedBy: req.user.id });
    res.status(201).json(movie);
  }
);

// ── PUT /api/movies/:id  (admin only – full replace) ─────────────────────────
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  [param('id').isUUID(), ...movieBody],
  validate,
  (req, res) => {
    const updated = movieStore.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Movie not found' });
    res.json(updated);
  }
);

// ── PATCH /api/movies/:id  (admin only – partial update) ─────────────────────
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  [param('id').isUUID()],
  validate,
  (req, res) => {
    const updated = movieStore.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Movie not found' });
    res.json(updated);
  }
);

// ── DELETE /api/movies/:id  (admin only) ─────────────────────────────────────
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  [param('id').isUUID()],
  validate,
  (req, res) => {
    const deleted = movieStore.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Movie not found' });
    res.status(200).json({ message: 'Movie deleted' });
  }
);

module.exports = router;
