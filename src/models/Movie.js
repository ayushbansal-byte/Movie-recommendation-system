/**
 * models/Movie.js  –  Mongoose Movie model
 *
 * Covers (Unit 5):
 *   Schemas · Models · Validation · Virtuals · Static Methods ·
 *   Indexing · Compound Indexes · Aggregation · Populate ·
 *   Referencing vs Embedding · Mongoose Middleware
 */

'use strict';

const mongoose = require('mongoose');

// ── Review sub-document schema (Embedding – Unit 5) ───────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',            // Referencing (Unit 5)
      required: true,
    },
    userName: { type: String, required: true },
    rating:   { type: Number, required: true, min: 1, max: 10 },
    comment:  { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

// ── Main movie schema ─────────────────────────────────────────────────────────
const movieSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: [true, 'Title is required'],
      trim:     true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    genre: {
      type:     String,
      required: [true, 'Genre is required'],
      enum: {
        values:  ['Action', 'Comedy', 'Romance', 'Thriller', 'Drama', 'Horror', 'Sci-Fi', 'Animation'],
        message: '{VALUE} is not a supported genre',
      },
    },
    year: {
      type:    Number,
      required: [true, 'Year is required'],
      min: [1900, 'Year must be ≥ 1900'],
      max: [2100, 'Year must be ≤ 2100'],
    },
    rating: {
      type:    Number,
      required: [true, 'Rating is required'],
      min: [0, 'Rating must be ≥ 0'],
      max: [10, 'Rating must be ≤ 10'],
    },
    audio: {
      type:    String,
      required: [true, 'Audio field is required'],
      trim:    true,
    },
    poster: {
      type:    String,
      default: '',
    },
    description: {
      type:    String,
      trim:    true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',           // Referencing (Unit 5) – populate example
    },
    reviews: [reviewSchema],  // Embedding (Unit 5)
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject:{ virtuals: true },
  }
);

// ── Indexes (Unit 5 – Indexing · Compound Indexes) ───────────────────────────
movieSchema.index({ title: 'text', description: 'text' }); // text search index
movieSchema.index({ genre: 1, year: -1 });                 // compound index
movieSchema.index({ rating: -1 });                         // sort by rating

// ── Virtual – average review rating (Unit 5 – Virtuals) ──────────────────────
movieSchema.virtual('avgReviewRating').get(function () {
  if (!this.reviews || this.reviews.length === 0) return null;
  const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10;
});

// ── Virtual – review count ────────────────────────────────────────────────────
movieSchema.virtual('reviewCount').get(function () {
  return this.reviews ? this.reviews.length : 0;
});

// ── Mongoose Middleware – pre-find logging (Unit 5) ───────────────────────────
movieSchema.pre(/^find/, function (next) {
  this._startTime = Date.now();
  next();
});

movieSchema.post(/^find/, function (_docs, next) {
  // Could log query time: Date.now() - this._startTime
  next();
});

// ── Static method – genre aggregation (Unit 5 – Aggregation) ─────────────────
movieSchema.statics.getGenreStats = function () {
  return this.aggregate([
    {
      $group: {
        _id:       '$genre',
        count:     { $sum: 1 },
        avgRating: { $avg: '$rating' },
        maxRating: { $max: '$rating' },
        minRating: { $min: '$rating' },
      },
    },
    { $sort: { avgRating: -1 } },
    {
      $project: {
        genre:     '$_id',
        count:     1,
        avgRating: { $round: ['$avgRating', 1] },
        maxRating: 1,
        minRating: 1,
        _id:       0,
      },
    },
  ]);
};

// ── Static method – top N movies by rating (Unit 5 – Aggregation) ────────────
movieSchema.statics.getTopRated = function (limit = 5) {
  return this.aggregate([
    { $sort:  { rating: -1 } },
    { $limit: limit },
    { $project: { title: 1, genre: 1, year: 1, rating: 1, poster: 1, _id: 1 } },
  ]);
};

// ── toJSON – remove __v ───────────────────────────────────────────────────────
movieSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Movie', movieSchema);
