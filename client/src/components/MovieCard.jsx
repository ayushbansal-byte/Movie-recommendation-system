/**
 * MovieCard.jsx  –  reusable UI component
 *
 * Covers (Unit 6): Functional Components · Props · JSX · Styling in React
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to={`/movies/${movie._id || movie.id}`}
      className="group block bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all hover:-translate-y-1 hover:shadow-2xl"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-zinc-800">
        {!imgError && movie.poster ? (
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-900 text-center p-4">
            <span className="text-white font-bold text-sm">{movie.title}</span>
            <span className="text-zinc-500 text-xs mt-1">Poster unavailable</span>
          </div>
        )}

        {/* Genre badge */}
        <span className="absolute top-2 left-2 bg-brand/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
          {movie.genre}
        </span>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm truncate group-hover:text-brand transition">
          {movie.title}
        </h3>
        <p className="text-zinc-500 text-xs mt-0.5">{movie.year} · {movie.audio}</p>
        <p className="text-yellow-400 text-xs mt-1 font-semibold">⭐ {movie.rating}/10</p>
      </div>
    </Link>
  );
}
