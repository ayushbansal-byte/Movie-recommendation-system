/**
 * importTmdb.js  –  Import movies directly from TMDB API into MongoDB
 *
 * Usage:  node src/importTmdb.js
 * Requires MONGO_URI and TMDB_API_KEY in .env
 *
 * Fetches ~1000 movies across popular, top_rated, and now_playing categories.
 * Each movie gets: title, year, genre, rating (0-10), poster, description, audio.
 */

'use strict';

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

require('dotenv').config();

const https    = require('https');
const mongoose = require('mongoose');
const Movie    = require('./models/Movie');
const logger   = require('./utils/logger');

const TMDB_KEY = process.env.TMDB_API_KEY;
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

// TMDB genre_id → our schema enum
const GENRE_MAP = {
  28:    'Action',      // Action
  12:    'Action',      // Adventure
  16:    'Animation',   // Animation
  35:    'Comedy',      // Comedy
  80:    'Thriller',    // Crime
  99:    'Drama',       // Documentary
  18:    'Drama',       // Drama
  10751: 'Animation',   // Family
  14:    'Sci-Fi',      // Fantasy
  36:    'Drama',       // History
  27:    'Horror',      // Horror
  10402: 'Comedy',      // Music
  9648:  'Thriller',    // Mystery
  10749: 'Romance',     // Romance
  878:   'Sci-Fi',      // Science Fiction
  10770: 'Drama',       // TV Movie
  53:    'Thriller',    // Thriller
  10752: 'Action',      // War
  37:    'Drama',       // Western
};

function pickGenre(genreIds) {
  for (const id of (genreIds || [])) {
    if (GENRE_MAP[id]) return GENRE_MAP[id];
  }
  return 'Drama';
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'MovieMania/1.0' } }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchPages(endpoint, totalPages) {
  const results = [];
  for (let page = 1; page <= totalPages; page++) {
    const url = `https://api.themoviedb.org/3/movie/${endpoint}?api_key=${TMDB_KEY}&language=en-US&page=${page}`;
    try {
      const data = await httpsGet(url);
      if (data.results) results.push(...data.results);
    } catch (err) {
      logger.warn(`  Failed page ${page} of ${endpoint}: ${err.message}`);
    }
    await sleep(260); // stay under 40 req/10s
  }
  return results;
}

async function run() {
  if (!TMDB_KEY) { logger.error('TMDB_API_KEY not set'); process.exit(1); }
  if (!process.env.MONGO_URI) { logger.error('MONGO_URI not set'); process.exit(1); }

  logger.info('Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGO_URI);
  logger.info('Connected.');

  // Fetch ~17 pages each = ~340 movies per category, total ~1000+
  logger.info('Fetching popular movies from TMDB…');
  const popular    = await fetchPages('popular',    17);
  logger.info(`  ${popular.length} popular movies fetched`);

  logger.info('Fetching top_rated movies from TMDB…');
  const topRated   = await fetchPages('top_rated',  17);
  logger.info(`  ${topRated.length} top_rated movies fetched`);

  logger.info('Fetching now_playing movies from TMDB…');
  const nowPlaying = await fetchPages('now_playing', 17);
  logger.info(`  ${nowPlaying.length} now_playing movies fetched`);

  // Merge and deduplicate by TMDB id
  const seen = new Set();
  const all  = [...popular, ...topRated, ...nowPlaying].filter(m => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
  logger.info(`Total unique movies from TMDB: ${all.length}`);

  // Convert to our schema
  const docs = all
    .filter(m => m.title && m.release_date && m.vote_average > 0)
    .map(m => ({
      title:       m.title,
      genre:       pickGenre(m.genre_ids),
      year:        parseInt(m.release_date.slice(0, 4)) || 2000,
      rating:      Math.round(m.vote_average * 10) / 10,  // already 0-10
      audio:       'English',
      poster:      m.poster_path ? `${IMG_BASE}${m.poster_path}` : '',
      description: m.overview || '',
    }))
    .filter(m => m.year >= 1900 && m.year <= 2100 && m.rating >= 0 && m.rating <= 10);

  logger.info(`Valid movie documents to insert: ${docs.length}`);

  logger.info('Clearing existing movies…');
  await Movie.deleteMany({});

  logger.info('Inserting in batches of 100…');
  let inserted = 0;
  for (let i = 0; i < docs.length; i += 100) {
    await Movie.insertMany(docs.slice(i, i + 100), { ordered: false });
    inserted += Math.min(100, docs.length - i);
    logger.info(`  inserted ${inserted}/${docs.length}`);
  }

  logger.info(`Done. ${inserted} movies imported from TMDB into MongoDB.`);
  await mongoose.connection.close();
}

run().catch(err => {
  logger.error('importTmdb failed:', err.message);
  process.exit(1);
});
