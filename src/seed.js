/**
 * seed.js  –  Seed the MongoDB database with sample movies
 *
 * Covers (Unit 5): MongoDB Setup · Mongoose · CRUD Operations
 *
 * Usage:  node src/seed.js
 * Requires MONGO_URI in .env
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const Movie    = require('./models/Movie');
const logger   = require('./utils/logger');

const SEED_MOVIES = [
  { title:'Alpha',             genre:'Action',   year:2026, rating:7.5, audio:'Original Hindi', poster:'https://www.yashrajfilms.com/images/default-source/news1/alpha-posterc18c4fca-3883-4f22-8abc-8b76b33bcb8a.jpg?sfvrsn=47c7dccc_1', description:'YRF spy universe action film.' },
  { title:'Mardaani 3',        genre:'Thriller', year:2026, rating:7.2, audio:'Original Hindi', poster:'https://images.filmibeat.com/ph-big/2026/03/mardaani-3-ott-release-when-and-where-to-watch-rani-mukerjis-crime-thriller-after-its-box-office-success1773202806_0.webp', description:'Rani Mukerjee returns as Shivani Shivaji Roy.' },
  { title:'Vadh 2',            genre:'Thriller', year:2026, rating:7.4, audio:'Original Hindi', poster:'https://www.cinemaclock.com/images/posters/1000x1500/72/vadh-2-2025-orig-poster.jpg', description:'Sequel to the 2022 crime thriller.' },
  { title:'Chhaava',           genre:'Action',   year:2025, rating:7.3, audio:'Original Hindi', poster:'https://catalog.cinema-api.com/cf/images/ncg-images/ad892cd1d6ec40ed95a9cdff4dbb49f8.jpg?version=A1E8CDEA0D096B2B9211F114FA0D0854', description:'Period action drama about Chhatrapati Sambhaji Maharaj.' },
  { title:'Sky Force',         genre:'Action',   year:2025, rating:6.8, audio:'Original Hindi', poster:'https://media.assettype.com/deccanherald%2F2025-01-15%2Fm7rv77ak%2FSky-Force.jpeg', description:'Indian Air Force tribute film.' },
  { title:'Saiyaara',          genre:'Romance',  year:2025, rating:7.0, audio:'Original Hindi', poster:'https://lsf.go.id/storage/app/resources/resize/600_900_0_0_crop/img_5c99fdbb130d5e78d685fbdeb6de60ea.jpg', description:'Romantic drama film.' },
  { title:'Raid 2',            genre:'Thriller', year:2025, rating:6.8, audio:'Original Hindi', poster:'https://image.tmdb.org/t/p/w500/1RzqTwmLtohVwsemfbMO6Iy0Xw3.jpg', description:'Sequel to the 2018 hit Raid.' },
  { title:'Bhool Chuk Maaf',   genre:'Comedy',   year:2025, rating:6.8, audio:'Original Hindi', poster:'https://m.media-amazon.com/images/M/MV5BMjIyMTZiMGEtNmIyYi00MGI1LWFmY2MtYTMyZjBlYzljMDFlXkEyXkFqcGc%40._V1_.jpg', description:'Lighthearted comedy.' },
  { title:'War 2',             genre:'Action',   year:2025, rating:6.0, audio:'Original Hindi', poster:'https://content.tupaki.com/en/feeds/2025/06/27/856537-war.jpg', description:'YRF spy universe sequel.' },
  { title:'Stree 2',           genre:'Comedy',   year:2024, rating:7.0, audio:'Original Hindi', poster:'https://akm-img-a-in.tosshub.com/indiatoday/styles/medium_crop_simple/public/2025-01/mv5bmta1nmuxyzitzmvmny00ymqxltk4y2utzjvkmwuwmwq5n2ixxkeyxkfqcgc._v1_.jpg?size=750%3A%2A', description:'Horror comedy sequel.' },
  { title:'Bhool Bhulaiyaa 3', genre:'Comedy',   year:2024, rating:6.0, audio:'Original Hindi', poster:'https://img.republicworld.com/all_images/GavjMs9aAAI6BBL-1729870042701.webp', description:'Comedy horror franchise.' },
  { title:'Laapataa Ladies',   genre:'Comedy',   year:2024, rating:8.3, audio:'Original Hindi', poster:'https://cdn.teater.co/imgs/laapataa-ladies-2024_600_880.webp', description:'Award-winning social comedy.' },
  { title:'Pushpa 2: The Rule',genre:'Action',   year:2024, rating:7.5, audio:'Hindi dubbed',  poster:'https://akm-img-a-in.tosshub.com/indiatoday/styles/medium_crop_simple/public/2024-01/pushpa.jpg?VersionId=R6fsfj.oKrdMD5whabbIenDO7z7pbtbZ&size=750%3A%2A', description:'Allu Arjun blockbuster sequel.' },
  { title:'Devara: Part 1',    genre:'Action',   year:2024, rating:6.5, audio:'Hindi dubbed',  poster:'https://m.media-amazon.com/images/M/MV5BZWEwNmYwYTAtMmQxYS00ZTgwLWE0NmUtNGIwZDEyZmYwN2EwXkEyXkFqcGc%40._V1_FMjpg_UX1000_.jpg', description:'Jr. NTR action drama.' },
  { title:'Lucky Baskhar',     genre:'Thriller', year:2024, rating:8.0, audio:'Hindi dubbed',  poster:'https://image.tmdb.org/t/p/w500/pIUP6Se9datGkIT9NyEPTa1AU9W.jpg', description:'Dulquer Salmaan crime thriller.' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  logger.info('Connected to MongoDB');

  await Movie.deleteMany({});
  logger.info('Cleared existing movies');

  const inserted = await Movie.insertMany(SEED_MOVIES);
  logger.info(`Seeded ${inserted.length} movies`);

  await mongoose.connection.close();
  logger.info('Done. Connection closed.');
}

seed().catch(err => {
  logger.error(err.message);
  process.exit(1);
});
