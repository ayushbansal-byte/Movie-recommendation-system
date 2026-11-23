/**
 * server.js  –  Movie Mania  –  Entry point
 *
 * Covers (Unit 5): MongoDB Setup · Mongoose connection
 * Covers (Unit 7): Environment Variables
 */

'use strict';

require('dotenv').config();   // load .env before anything else

const http       = require('http');
const app        = require('./src/app');
const { connectDB } = require('./src/config/db');
const logger     = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

async function start() {
  // Connect to MongoDB (falls back gracefully when MONGO_URI is absent)
  await connectDB();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    logger.info(`Movie Mania API  →  http://localhost:${PORT}`);
    logger.info(`Frontend         →  http://localhost:${PORT}/`);
    logger.info(`React dev proxy  →  http://localhost:5173/  (run: cd client && npm run dev)`);
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM – shutting down');
    server.close(() => process.exit(0));
  });

  return server;
}

module.exports = start();
