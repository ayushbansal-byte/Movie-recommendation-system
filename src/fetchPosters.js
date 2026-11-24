/**
 * fetchPosters.js  –  Fetch TMDB poster URLs for all movies in MongoDB
 *
 * Usage:  node src/fetchPosters.js
 * Requires MONGO_URI and TMDB_API_KEY in .env
 *
 * For each movie: searches TMDB by title+year → saves poster_path URL to MongoDB
 */

'use strict';

// Force Google DNS for Atlas SRV resolution
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

require('dotenv').config();

const https    = require('https');
const mongoose = require('mongoose');
const Movie    = require('./models/Movie');
const logger   = require('./utils/logger');

const TMDB_KEY  = process.env.TMDB_API_KEY;
const IMG_BASE  = 'https://image.tmdb.org/t/p/w500';

if (!TMDB_KEY) {
  logger.error('TMDB_API_KEY not set in .env');
  process.exit(1);
}

// Simple HTTPS GET returning parsed JSON
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'MovieMania/1.0' } }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// Search TMDB for a movie, return poster URL or empty string
async function getPoster(title, year) {
  try {
    const q   = encodeURIComponent(title);
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${q}&year=${year}&language=en-US`;
    const data = await httpsGet(url);
    const hit  = data.results && data.results[0];
    if (hit && hit.poster_path) return `${IMG_BASE}${hit.poster_path}`;
    // retry without year filter if no result
    if (!hit) {
      const url2 = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${q}&language=en-US`;
      const data2 = await httpsGet(url2);
      const hit2  = data2.results && data2.results[0];
      if (hit2 && hit2.poster_path) return `${IMG_BASE}${hit2.poster_path}`;
    }
  } catch (_) { /* ignore per-movie errors */ }
  return '';
}

// Sleep to respect TMDB rate limit (40 req/10s on free tier)
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  if (!process.env.MONGO_URI) {
    logger.error('MONGO_URI not set in .env');
    process.exit(1);
  }

  logger.info('Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGO_URI);
  logger.info('Connected.');

  // Only fetch for movies that don't already have a poster
  const movies = await Movie.find({ $or: [{ poster: '' }, { poster: { $exists: false } }] })
    .select('_id title year poster');

  logger.info(`Found ${movies.length} movies without posters. Fetching from TMDB…`);

  let updated = 0;
  let failed  = 0;

  for (let i = 0; i < movies.length; i++) {
    const m = movies[i];
    const poster = await getPoster(m.title, m.year);

    if (poster) {
      await Movie.findByIdAndUpdate(m._id, { poster });
      updated++;
    } else {
      failed++;
    }

    // Log progress every 50 movies
    if ((i + 1) % 50 === 0) {
      logger.info(`  ${i + 1}/${movies.length} processed — ${updated} updated, ${failed} no poster`);
    }

    // Rate limit: ~25 requests per second max, stay under 40/10s
    await sleep(250);
  }

  logger.info(`Done. ${updated} posters updated, ${failed} movies had no poster on TMDB.`);
  await mongoose.connection.close();
}

run().catch(err => {
  logger.error('fetchPosters failed:', err.message);
  process.exit(1);
});
