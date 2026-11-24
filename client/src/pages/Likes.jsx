/**
 * Likes.jsx – Liked / Watchlist movies page
 *
 * Covers (syllabus): Functional Components · useContext · Lists · Keys ·
 *                    Conditional Rendering · Loading States
 */
import React from 'react';
import { Link } from 'react-router-dom';
import Topbar from '../components/Topbar';
import MovieCard from '../components/MovieCard';
import { useWatchlist } from '../context/WatchlistContext';

export default function Likes() {
  const { watchlist, loading } = useWatchlist();

  return (
    <>
      <Topbar />
      <main>
        <section className="rec-banner">
          <div className="rec-banner-inner">
            <p className="eyebrow">YOUR COLLECTION</p>
            <h1 className="rec-heading">❤️ My Liked Movies</h1>
            <p className="rec-sub">Movies you've liked across all your searches and swipes.</p>
          </div>
        </section>

        <div className="results-inner">
          {loading && <p className="loading-state">Loading your likes…</p>}

          {!loading && watchlist.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ fontSize: 48, margin: '0 0 16px' }}>🤍</p>
              <p style={{ color: '#888', fontSize: 16 }}>
                No liked movies yet. Hit the ❤️ on any movie card to save it here.
              </p>
              <Link className="button red" to="/movies" style={{ marginTop: 20, display: 'inline-block' }}>
                Browse Movies
              </Link>
            </div>
          )}

          {!loading && watchlist.length > 0 && (
            <>
              <div className="results-header">
                <h2>{watchlist.length} liked movie{watchlist.length > 1 ? 's' : ''}</h2>
                <Link className="button" to="/movies">← Browse more</Link>
              </div>
              <div className="movie-grid">
                {watchlist.map(m => (
                  <MovieCard key={m._id || m.id} movie={m} />
                ))}
              </div>
            </>
          )}
        </div>

        <footer className="page-footer">Movie Mania · Student project demo</footer>
      </main>
    </>
  );
}
