/**
 * importCsv.js  –  Import movies.csv + ratings.csv into MongoDB
 *
 * Usage:  node src/importCsv.js
 * Requires MONGO_URI in .env
 *
 * Strategy:
 *  1. Stream ratings.csv (678 MB) – compute avgRating + ratingCount per movieId
 *  2. Pick top 1000 movies by rating count (most-reviewed = most popular)
 *  3. Parse movies.csv – extract title, year, genres for those 1000 movies
 *  4. Map CSV genres → schema enum values
 *  5. Insert into MongoDB via Movie model
 */

'use strict';

// Force Node.js to use Google DNS (8.8.8.8) to resolve Atlas SRV records
// when the system DNS fails to resolve mongodb+srv:// hostnames.
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

require('dotenv').config();

const fs       = require('fs');
const path     = require('path');
const readline = require('readline');
const mongoose = require('mongoose');
const Movie    = require('./models/Movie');
const logger   = require('./utils/logger');

const MOVIES_CSV  = path.join(__dirname, '..', 'movies.csv');
const RATINGS_CSV = path.join(__dirname, '..', 'ratings.csv');
const TOP_N       = 1000;

// ── Genre mapping: CSV genres → schema enum ───────────────────────────────────
// Schema allows: Action | Comedy | Romance | Thriller | Drama | Horror | Sci-Fi | Animation
const GENRE_MAP = {
  'Action':     'Action',
  'Comedy':     'Comedy',
  'Romance':    'Romance',
  'Thriller':   'Thriller',
  'Drama':      'Drama',
  'Horror':     'Horror',
  'Sci-Fi':     'Sci-Fi',
  'Animation':  'Animation',
  // map less specific genres to closest match
  'Adventure':  'Action',
  'Crime':      'Thriller',
  'Mystery':    'Thriller',
  'Fantasy':    'Sci-Fi',
  'Children':   'Animation',
  'War':        'Drama',
  'Western':    'Drama',
  'Musical':    'Comedy',
  'Documentary':'Drama',
  'Film-Noir':  'Thriller',
  'IMAX':       'Action',
};

function mapGenre(csvGenres) {
  const list = csvGenres.split('|');
  for (const g of list) {
    if (GENRE_MAP[g]) return GENRE_MAP[g];
  }
  return 'Drama'; // fallback
}

// ── Extract year from title like "Toy Story (1995)" ───────────────────────────
function parseTitle(raw) {
  const match = raw.match(/^(.*)\s+\((\d{4})\)$/);
  if (match) return { title: match[1].trim(), year: parseInt(match[2]) };
  return { title: raw.trim(), year: 2000 };
}

// ── Stream a CSV file line by line ────────────────────────────────────────────
function streamLines(filePath, onLine) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath, { encoding: 'utf8' }),
      crlfDelay: Infinity,
    });
    let header = true;
    rl.on('line', line => {
      if (header) { header = false; return; } // skip header row
      if (line.trim()) onLine(line);
    });
    rl.on('close', resolve);
    rl.on('error', reject);
  });
}

async function run() {
  // ── 1. Connect to MongoDB ──────────────────────────────────────────────────
  if (!process.env.MONGO_URI) {
    logger.error('MONGO_URI not set in .env — cannot import to database.');
    logger.info('Add MONGO_URI=mongodb://localhost:27017/moviemania to .env and retry.');
    process.exit(1);
  }

  logger.info('Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGO_URI);
  logger.info('Connected.');

  // ── 2. Stream ratings.csv → aggregate per movieId ─────────────────────────
  logger.info('Reading ratings.csv (this may take a minute — file is 678 MB)…');
  const ratingMap = new Map(); // movieId → { sum, count }

  let ratingLines = 0;
  await streamLines(RATINGS_CSV, line => {
    ratingLines++;
    const [userId, movieId, rating] = line.split(',');
    const id  = parseInt(movieId);
    const val = parseFloat(rating);
    if (!ratingMap.has(id)) ratingMap.set(id, { sum: 0, count: 0 });
    const entry = ratingMap.get(id);
    entry.sum   += val;
    entry.count += 1;
    if (ratingLines % 5_000_000 === 0) logger.info(`  processed ${ratingLines.toLocaleString()} rating rows…`);
  });
  logger.info(`Ratings processed: ${ratingLines.toLocaleString()} rows, ${ratingMap.size.toLocaleString()} unique movies.`);

  // ── 3. Pick top 1000 by rating count (most popular) ─────────────────────
  const sorted = [...ratingMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, TOP_N);

  const topIds = new Set(sorted.map(([id]) => id));

  // Build avgRating lookup (convert 0.5–5 scale → 0–10)
  const avgRatingLookup = new Map();
  for (const [id, { sum, count }] of sorted) {
    const avg = (sum / count) * 2;          // scale 0.5–5 → 1–10
    avgRatingLookup.set(id, Math.round(avg * 10) / 10);
  }

  // ── 4. Stream movies.csv → build movie docs for topIds ───────────────────
  logger.info('Reading movies.csv…');
  const movieDocs = [];

  await streamLines(MOVIES_CSV, line => {
    // Handle quoted fields (e.g. "American President, The (1995)")
    let movieId, rest;
    if (line.startsWith('"')) {
      const closeQuote = line.indexOf('"', 1);
      const inner = line.slice(1, closeQuote);
      rest = line.slice(closeQuote + 2); // skip closing quote + comma
      movieId = parseInt(inner);
    } else {
      const firstComma = line.indexOf(',');
      movieId = parseInt(line.slice(0, firstComma));
      rest = line.slice(firstComma + 1);
    }

    if (!topIds.has(movieId)) return;

    // Split rest into title and genres (last comma-separated field)
    const lastComma = rest.lastIndexOf(',');
    let titleRaw = rest.slice(0, lastComma).replace(/^"|"$/g, '');
    const csvGenres = rest.slice(lastComma + 1).trim();

    const { title, year } = parseTitle(titleRaw);
    const genre  = mapGenre(csvGenres);
    const rating = avgRatingLookup.get(movieId) || 5.0;

    movieDocs.push({
      title,
      genre,
      year,
      rating,
      audio:       'English',
      poster:      '',
      description: `${csvGenres.replace(/\|/g, ', ')} film from ${year}.`,
    });
  });

  logger.info(`Parsed ${movieDocs.length} movie documents.`);

  // ── 5. Insert into MongoDB ────────────────────────────────────────────────
  logger.info('Clearing existing movies…');
  await Movie.deleteMany({});

  logger.info('Inserting movies in batches…');
  const BATCH = 100;
  let inserted = 0;
  for (let i = 0; i < movieDocs.length; i += BATCH) {
    const batch = movieDocs.slice(i, i + BATCH);
    await Movie.insertMany(batch, { ordered: false });
    inserted += batch.length;
    logger.info(`  inserted ${inserted}/${movieDocs.length}`);
  }

  logger.info(`Done. ${inserted} movies imported into MongoDB.`);
  await mongoose.connection.close();
}

run().catch(err => {
  logger.error('Import failed:', err.message);
  process.exit(1);
});
