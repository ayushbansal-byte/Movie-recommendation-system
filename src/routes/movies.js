/**
 * routes/movies.js  –  Movies REST API
 *
 * Covers (Unit 4): REST API Design · CRUD · Route/Query Params · Status Codes
 * Covers (Unit 5): Mongoose Queries · Find · Populate · Aggregation · Indexing · Performance (.lean())
 * Covers (Unit 7): Search · Filters · Pagination Frontend · Role-Based UI
 *
 * GET    /api/movies                 – list / filter / search / paginate
 * GET    /api/movies/stats           – genre aggregation stats
 * GET    /api/movies/top             – top-rated (aggregation pipeline)
 * GET    /api/movies/:id             – single movie (populate addedBy)
 * POST   /api/movies                 – create (admin)
 * PUT    /api/movies/:id             – full replace (admin)
 * PATCH  /api/movies/:id             – partial update (admin)
 * DELETE /api/movies/:id             – delete (admin)
 * POST   /api/movies/:id/reviews     – add review (authenticated)
 * DELETE /api/movies/:id/reviews/:rid – delete own review
 */

'use strict';

const express              = require('express');
const { body, query, param } = require('express-validator');
const mongoose             = require('mongoose');

const AppError     = require('../utils/AppError');
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');
const validate     = require('../middleware/validate');

function getModel() {
  if (mongoose.connection.readyState === 1) return require('../models/Movie');
  return null;   // signals use of in-memory store
}
function getStore() { return require('../data/movies'); }

const router = express.Router();

// ── Shared body validation ────────────────────────────────────────────────────
const movieBody = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('genre').trim().notEmpty().withMessage('Genre is required'),
  body('year').isInt({ min: 1900, max: 2100 }).withMessage('Year 1900–2100'),
  body('rating').isFloat({ min: 0, max: 10 }).withMessage('Rating 0–10'),
  body('audio').trim().notEmpty().withMessage('Audio field is required'),
  body('poster').optional({ checkFalsy: true }).isURL().withMessage('Poster must be a valid URL'),
  body('description').optional().trim(),
];

// ── GET /api/movies/stats  (Aggregation – Unit 5) ─────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const Movie = getModel();
    if (!Movie) {
      // in-memory fallback: simple group-by genre
      const all = getStore().getAll();
      const map = {};
      all.forEach(m => {
        if (!map[m.genre]) map[m.genre] = { genre: m.genre, count: 0, total: 0 };
        map[m.genre].count++;
        map[m.genre].total += m.rating;
      });
      return res.json(Object.values(map).map(g => ({
        genre: g.genre, count: g.count, avgRating: +(g.total / g.count).toFixed(1),
      })));
    }
    const stats = await Movie.getGenreStats();   // static aggregation method
    res.json(stats);
  } catch (err) { next(err); }
});

// ── GET /api/movies/top  (Aggregation pipeline · Performance – Unit 5) ───────
router.get('/top', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 5, 20);
    const Movie = getModel();
    if (!Movie) {
      return res.json(getStore().getAll().slice(0, limit));
    }
    const top = await Movie.getTopRated(limit);
    res.json(top);
  } catch (err) { next(err); }
});

// ── GET /api/movies  (Find · Query Params · Pagination – Unit 5 & 7) ─────────
router.get(
  '/',
  [
    query('genre').optional().trim(),
    query('year').optional().isInt({ min: 1900, max: 2100 }),
    query('minRating').optional().isFloat({ min: 0, max: 10 }),
    query('search').optional().trim(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sort').optional().isIn(['rating', '-rating', 'year', '-year', 'title', '-title']),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { genre, year, minRating = 0, search, sort = '-rating' } = req.query;
      const page  = Math.max(parseInt(req.query.page)  || 1, 1);
      const limit = Math.min(parseInt(req.query.limit) || 10, 100);
      const skip  = (page - 1) * limit;

      const Movie = getModel();

      // ── Mongoose path ──────────────────────────────────────────────────────
      if (Movie) {
        const filter = {};
        if (genre) filter.genre = genre;
        if (year)  filter.year  = Number(year);
        if (Number(minRating) > 0) filter.rating = { $gte: Number(minRating) };
        if (search) filter.$text = { $search: search };   // text index

        const sortObj = sort.startsWith('-')
          ? { [sort.slice(1)]: -1 }
          : { [sort]: 1 };

        const [movies, total] = await Promise.all([
          Movie.find(filter)
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .populate('addedBy', 'name email')  // Populate – Unit 5
            .lean(),  // Performance – Unit 5: returns plain JS objects instead of
                      // full Mongoose documents (skips hydration), significantly
                      // faster for read-only list responses
          Movie.countDocuments(filter),
        ]);

        return res.json({
          count:      movies.length,
          total,
          page,
          totalPages: Math.ceil(total / limit),
          movies,
        });
      }

      // ── In-memory fallback ─────────────────────────────────────────────────
      const all     = getStore().getAll({ genre, year, minRating, search });
      const total   = all.length;
      const movies  = all.slice(skip, skip + limit);
      return res.json({
        count: movies.length, total, page,
        totalPages: Math.ceil(total / limit),
        movies,
      });
    } catch (err) { next(err); }
  }
);

// ── GET /api/movies/:id  (Populate – Unit 5) ─────────────────────────────────
router.get(
  '/:id',
  async (req, res, next) => {
    try {
      const Movie = getModel();
      if (Movie) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return next(new AppError('Invalid movie ID', 400));
        }
        const movie = await Movie.findById(req.params.id)
          .populate('addedBy', 'name email')
          .populate('reviews.user', 'name');
        if (!movie) return next(new AppError('Movie not found', 404));
        return res.json(movie);
      }
      const movie = getStore().getById(req.params.id);
      if (!movie) return next(new AppError('Movie not found', 404));
      res.json(movie);
    } catch (err) { next(err); }
  }
);

// ── POST /api/movies  (admin) ─────────────────────────────────────────────────
router.post(
  '/',
  authenticate, authorize('admin'),
  movieBody, validate,
  async (req, res, next) => {
    try {
      const Movie = getModel();
      if (Movie) {
        const movie = await Movie.create({ ...req.body, addedBy: req.user.id });
        return res.status(201).json(movie);
      }
      const movie = getStore().create({ ...req.body, addedBy: req.user.id });
      res.status(201).json(movie);
    } catch (err) { next(err); }
  }
);

// ── PUT /api/movies/:id  (admin – full replace) ───────────────────────────────
router.put(
  '/:id',
  authenticate, authorize('admin'),
  movieBody, validate,
  async (req, res, next) => {
    try {
      const Movie = getModel();
      if (Movie) {
        const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
          new: true, runValidators: true,
        });
        if (!movie) return next(new AppError('Movie not found', 404));
        return res.json(movie);
      }
      const movie = getStore().update(req.params.id, req.body);
      if (!movie) return next(new AppError('Movie not found', 404));
      res.json(movie);
    } catch (err) { next(err); }
  }
);

// ── PATCH /api/movies/:id  (admin – partial) ─────────────────────────────────
router.patch(
  '/:id',
  authenticate, authorize('admin'),
  async (req, res, next) => {
    try {
      const Movie = getModel();
      if (Movie) {
        const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
          new: true, runValidators: true,
        });
        if (!movie) return next(new AppError('Movie not found', 404));
        return res.json(movie);
      }
      const movie = getStore().update(req.params.id, req.body);
      if (!movie) return next(new AppError('Movie not found', 404));
      res.json(movie);
    } catch (err) { next(err); }
  }
);

// ── DELETE /api/movies/:id  (admin) ──────────────────────────────────────────
router.delete(
  '/:id',
  authenticate, authorize('admin'),
  async (req, res, next) => {
    try {
      const Movie = getModel();
      if (Movie) {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) return next(new AppError('Movie not found', 404));
        return res.json({ message: 'Movie deleted' });
      }
      const deleted = getStore().remove(req.params.id);
      if (!deleted) return next(new AppError('Movie not found', 404));
      res.json({ message: 'Movie deleted' });
    } catch (err) { next(err); }
  }
);

// ── POST /api/movies/:id/reviews  (authenticated) ────────────────────────────
router.post(
  '/:id/reviews',
  authenticate,
  [
    body('rating').isInt({ min: 1, max: 10 }).withMessage('Rating 1–10'),
    body('comment').optional().trim().isLength({ max: 500 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const Movie = getModel();
      if (!Movie) return next(new AppError('Reviews require database connection', 503));

      const movie = await Movie.findById(req.params.id);
      if (!movie) return next(new AppError('Movie not found', 404));

      // Prevent duplicate reviews from same user
      const already = movie.reviews.find(r => r.user.toString() === req.user.id);
      if (already) return next(new AppError('You have already reviewed this movie', 409));

      movie.reviews.push({
        user:     req.user.id,
        userName: req.user.email,
        rating:   req.body.rating,
        comment:  req.body.comment || '',
      });
      await movie.save();
      res.status(201).json({ message: 'Review added', reviews: movie.reviews });
    } catch (err) { next(err); }
  }
);

// ── DELETE /api/movies/:id/reviews/:rid  (own review or admin) ───────────────
router.delete('/:id/reviews/:rid', authenticate, async (req, res, next) => {
  try {
    const Movie = getModel();
    if (!Movie) return next(new AppError('Reviews require database connection', 503));

    const movie = await Movie.findById(req.params.id);
    if (!movie) return next(new AppError('Movie not found', 404));

    const review = movie.reviews.id(req.params.rid);
    if (!review) return next(new AppError('Review not found', 404));

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorised to delete this review', 403));
    }

    review.deleteOne();
    await movie.save();
    res.json({ message: 'Review deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
