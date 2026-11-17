/**
 * app.js  –  Express application factory
 *
 * Covers: Express Setup · Middleware · Routing · Body Parsing ·
 *         CORS · Logging (Morgan) · Error Handling Middleware ·
 *         Static files (serves the existing HTML/CSS/JS frontend)
 */

'use strict';

const path       = require('path');
const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');       // HTTP request logger

const authRoutes  = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const userRoutes  = require('./routes/users');
const uploadRoutes= require('./routes/upload');

const errorHandler    = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFound');
const requestLogger   = require('./middleware/requestLogger');

const app = express();

// ── Middleware stack ──────────────────────────────────────────────────────────

// 1. Morgan HTTP request logger (covers "logging" syllabus item)
app.use(morgan('dev'));

// 2. Custom request logger middleware (covers "Custom Middleware" syllabus item)
app.use(requestLogger);

// 2. CORS – allow the same-origin frontend (and optionally a dev Vite server)
app.use(cors({ origin: '*' }));

// 3. Body parsing  (covers "Body Parsing" syllabus item)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Serve static frontend files (HTML / CSS / JS in project root)
app.use(express.static(path.join(__dirname, '..')));

// 5. Serve uploaded poster images
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/movies',  movieRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/upload',  uploadRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler (must be before the error handler) ──
app.use(notFoundHandler);

// ── Global error handler  (covers "Error Handling Middleware" syllabus item) ──
app.use(errorHandler);

module.exports = app;
