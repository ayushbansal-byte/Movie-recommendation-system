/**
 * movies.js  –  In-memory movies store
 *
 * Covers: Modules, data layer abstraction, CRUD.
 * Pre-seeded with the same 15 movies that were in script.js.
 */

'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {Array<{id,title,genre,year,rating,audio,poster,addedBy}>} */
let movies = [
  { title:'Alpha',             genre:'Action',   year:2026, rating:7.5, audio:'Original Hindi', poster:'https://www.yashrajfilms.com/images/default-source/news1/alpha-posterc18c4fca-3883-4f22-8abc-8b76b33bcb8a.jpg?sfvrsn=47c7dccc_1' },
  { title:'Mardaani 3',        genre:'Thriller', year:2026, rating:7.2, audio:'Original Hindi', poster:'https://images.filmibeat.com/ph-big/2026/03/mardaani-3-ott-release-when-and-where-to-watch-rani-mukerjis-crime-thriller-after-its-box-office-success1773202806_0.webp' },
  { title:'Vadh 2',            genre:'Thriller', year:2026, rating:7.4, audio:'Original Hindi', poster:'https://www.cinemaclock.com/images/posters/1000x1500/72/vadh-2-2025-orig-poster.jpg' },
  { title:'Chhaava',           genre:'Action',   year:2025, rating:7.3, audio:'Original Hindi', poster:'https://catalog.cinema-api.com/cf/images/ncg-images/ad892cd1d6ec40ed95a9cdff4dbb49f8.jpg?version=A1E8CDEA0D096B2B9211F114FA0D0854' },
  { title:'Sky Force',         genre:'Action',   year:2025, rating:6.8, audio:'Original Hindi', poster:'https://media.assettype.com/deccanherald%2F2025-01-15%2Fm7rv77ak%2FSky-Force.jpeg' },
  { title:'Saiyaara',          genre:'Romance',  year:2025, rating:7.0, audio:'Original Hindi', poster:'https://lsf.go.id/storage/app/resources/resize/600_900_0_0_crop/img_5c99fdbb130d5e78d685fbdeb6de60ea.jpg' },
  { title:'Raid 2',            genre:'Thriller', year:2025, rating:6.8, audio:'Original Hindi', poster:'https://image.tmdb.org/t/p/w500/1RzqTwmLtohVwsemfbMO6Iy0Xw3.jpg' },
  { title:'Bhool Chuk Maaf',   genre:'Comedy',   year:2025, rating:6.8, audio:'Original Hindi', poster:'https://m.media-amazon.com/images/M/MV5BMjIyMTZiMGEtNmIyYi00MGI1LWFmY2MtYTMyZjBlYzljMDFlXkEyXkFqcGc%40._V1_.jpg' },
  { title:'War 2',             genre:'Action',   year:2025, rating:6.0, audio:'Original Hindi', poster:'https://content.tupaki.com/en/feeds/2025/06/27/856537-war.jpg' },
  { title:'Stree 2',           genre:'Comedy',   year:2024, rating:7.0, audio:'Original Hindi', poster:'https://akm-img-a-in.tosshub.com/indiatoday/styles/medium_crop_simple/public/2025-01/mv5bmta1nmuxyzitzmvmny00ymqxltk4y2utzjvkmwuwmwq5n2ixxkeyxkfqcgc._v1_.jpg?size=750%3A%2A' },
  { title:'Bhool Bhulaiyaa 3', genre:'Comedy',   year:2024, rating:6.0, audio:'Original Hindi', poster:'https://img.republicworld.com/all_images/GavjMs9aAAI6BBL-1729870042701.webp' },
  { title:'Laapataa Ladies',   genre:'Comedy',   year:2024, rating:8.3, audio:'Original Hindi', poster:'https://cdn.teater.co/imgs/laapataa-ladies-2024_600_880.webp' },
  { title:'Pushpa 2: The Rule',genre:'Action',   year:2024, rating:7.5, audio:'Hindi dubbed',  poster:'https://akm-img-a-in.tosshub.com/indiatoday/styles/medium_crop_simple/public/2024-01/pushpa.jpg?VersionId=R6fsfj.oKrdMD5whabbIenDO7z7pbtbZ&size=750%3A%2A' },
  { title:'Devara: Part 1',    genre:'Action',   year:2024, rating:6.5, audio:'Hindi dubbed',  poster:'https://m.media-amazon.com/images/M/MV5BZWEwNmYwYTAtMmQxYS00ZTgwLWE0NmUtNGIwZDEyZmYwN2EwXkEyXkFqcGc%40._V1_FMjpg_UX1000_.jpg' },
  { title:'Lucky Baskhar',     genre:'Thriller', year:2024, rating:8.0, audio:'Hindi dubbed',  poster:'https://image.tmdb.org/t/p/w500/pIUP6Se9datGkIT9NyEPTa1AU9W.jpg' },
].map(m => ({ id: uuidv4(), ...m, addedBy: 'system', createdAt: new Date().toISOString() }));

// ── CRUD helpers ──────────────────────────────────────────────────────────────

function getAll({ genre, year, minRating = 0, search } = {}) {
  return movies.filter(m => {
    if (genre  && m.genre !== genre) return false;
    if (year   && m.year  !== Number(year))  return false;
    if (m.rating < Number(minRating)) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.rating - a.rating);
}

function getById(id) {
  return movies.find(m => m.id === id) || null;
}

function create(data) {
  const movie = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
  movies.push(movie);
  return movie;
}

function update(id, data) {
  const idx = movies.findIndex(m => m.id === id);
  if (idx === -1) return null;
  movies[idx] = { ...movies[idx], ...data };
  return movies[idx];
}

function remove(id) {
  const idx = movies.findIndex(m => m.id === id);
  if (idx === -1) return false;
  movies.splice(idx, 1);
  return true;
}

module.exports = { getAll, getById, create, update, remove };
