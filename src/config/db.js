/**
 * config/db.js  –  Mongoose connection
 *
 * Covers (Unit 5): MongoDB Setup · MongoDB Atlas · Mongoose Setup
 *
 * Call connectDB() once at server start.
 * Falls back to in-memory flag when MONGO_URI is not set so the
 * app still boots (and uses the in-memory stores) during local dev
 * without a real Atlas URI.
 */

'use strict';

const mongoose = require('mongoose');
const logger   = require('../utils/logger');

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    logger.warn('MONGO_URI not set – running with in-memory data stores (no persistence).');
    return false;          // signals "no DB" to the rest of the app
  }

  try {
    await mongoose.connect(uri, {
      // modern driver defaults – no deprecated options needed
    });
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);

    // Graceful disconnect on process exit
    process.on('SIGINT',  () => mongoose.connection.close().then(() => process.exit(0)));
    process.on('SIGTERM', () => mongoose.connection.close().then(() => process.exit(0)));

    return true;
  } catch (err) {
    logger.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = { connectDB, mongoose };
