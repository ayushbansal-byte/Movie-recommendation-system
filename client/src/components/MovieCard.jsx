/**
 * MovieCard.jsx – Reusable movie card with like/heart button
 *
 * Covers (syllabus): Components · Props · useState · Event Handling · Conditional Rendering
 */
import React, { useState } from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';

export default function MovieCard({ movie }) {
  const [imgError, setImgError] = useState(false);
  const { isLiked, toggleLike } = useWatchlist();
  const { isAuth } = useAuth();

  const movieId = movie._id || movie.id;
  const liked   = isLiked(movieId);

  return (
    <article className="movie-card">
      <div className={`poster${imgError ? ' no-poster' : ''}`}>
        <span className="poster-fallback">
          {movie.title}
          <small>Poster unavailable</small>
        </span>
        {!imgError && movie.poster && (
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            onError={() => setImgError(true)}
          />
        )}
        {/* Heart button — only shown when logged in */}
        {isAuth && (
          <button
            className={`like-btn${liked ? ' liked' : ''}`}
            onClick={() => toggleLike(movie)}
            aria-label={liked ? 'Unlike' : 'Like'}
            title={liked ? 'Remove from likes' : 'Add to likes'}
          >
            {liked ? '❤️' : '🤍'}
          </button>
        )}
      </div>
      <h2>{movie.title}</h2>
      <p>{movie.genre} · {movie.year} · {movie.audio}</p>
      <p>⭐ {movie.rating}/10</p>
    </article>
  );
}
