/**
 * routes/upload.js  –  File Upload endpoint
 *
 * Covers: File Upload · Multer · Cloud Storage Introduction (syllabus)
 *
 * POST /api/upload/poster   – upload a poster image (admin only)
 *
 * Files are stored locally in /uploads/.
 * In production you would swap the diskStorage for an S3/Cloudinary stream
 * (Cloud Storage Introduction – the route structure stays the same).
 */

'use strict';

const path   = require('path');
const fs     = require('fs');
const express= require('express');
const multer = require('multer');

const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');

const router = express.Router();

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── Multer disk storage ───────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error('Only JPEG, PNG and WebP images are allowed'));
  },
});

// ── POST /api/upload/poster  (admin only) ─────────────────────────────────────
router.post(
  '/poster',
  authenticate,
  authorize('admin'),
  upload.single('poster'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({
      message: 'Poster uploaded',
      url,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  }
);

module.exports = router;
