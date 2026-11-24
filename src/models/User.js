/**
 * models/User.js  –  Mongoose User model
 *
 * Covers (Unit 5):
 *   Schemas · Models · Validation · Mongoose Middleware (pre-save hook) ·
 *   Virtuals · Static Methods · Custom Errors · Password Hashing
 */

'use strict';

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ── Schema ────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      minlength: [2,  'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type:     String,
      required: [true, 'Email is required'],
      unique:   true,          // Indexing – unique index on email
      lowercase: true,
      trim:     true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type:     String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select:   false,         // never returned by default in queries
    },
    role: {
      type:    String,
      enum:    { values: ['user', 'admin'], message: 'Role must be user or admin' },
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    watchlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'Movie',         // Relationships – referencing (Unit 5)
      },
    ],
  },
  {
    timestamps: true,          // adds createdAt / updatedAt automatically
  }
);

// ── Compound index (Unit 5 – Indexing) ───────────────────────────────────────
userSchema.index({ email: 1, role: 1 });

// ── Virtual – fullName alias (Unit 5 – Virtuals) ─────────────────────────────
userSchema.virtual('fullName').get(function () {
  return this.name;
});

// ── Mongoose Middleware – pre-save hook (Unit 5) ──────────────────────────────
// Hash password before saving when it has been modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method – compare password ───────────────────────────────────────
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ── Static method – find by email (Unit 5 – Static Methods) ──────────────────
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

// ── toJSON – strip password from any JSON output ──────────────────────────────
userSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
