/**
 * Movies.jsx  –  Movie recommendation + card swiper page
 *
 * Covers (syllabus):
 *   Functional Components · useState · useEffect · Custom Hooks (useMovies) ·
 *   Lists · Keys · Conditional Rendering · Event Handling · Forms ·
 *   Controlled Components · Search · Filters · Pagination Frontend ·
 *   Loading States · Error States · API Integration · Role-Based UI ·
 *   CRUD Full Stack (admin delete visible)
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMovies } from '../hooks/useMovies';
import MovieCard from '../components/MovieCard';
import Topbar from '../components/Topbar';
import SwiperSection from '../components/SwiperSection';

const GENRES = ['Action', 'Comedy', 'Romance', 'Thriller'];
const ERAS   = ['2026', '2025', '2024'];

export default function Movies() {
  // Controlled Components (syllabus)
  const [genre,     setGenre]     = useState('');
  const [era,       setEra]       = useState('');
  const [minRating, setMinRating] = useState(6);
  const [search,    setSearch]    = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { user } = useAuth();
  const { movies, loading, error, fetchMovies } = useMovies();

  async function handleSubmit(e) {
    e.preventDefault();
    await fetchMovies({ genre, year: era, minRating, search });
    setSubmitted(true);
  }

  function handleReset() {
    setSubmitted(false);
    setGenre('');
    setEra('');
    setMinRating(6);
    setSearch('');
  }

  // Derive results title
  const parts = [genre, era].filter(Boolean);
  const resultsTitle = parts.length ? `Best ${parts.join(' · ')} picks` : 'Top picks for you';

  return (
    <>
      <Topbar />
      <main>

        {/* ── Recommendation banner ── */}
        {!submitted && (
          <section className="rec-banner">
            <div className="rec-banner-inner">
              <p className="eyebrow">PERSONALISED FOR YOU</p>
              <h1 className="rec-heading">Find your next watch</h1>
              <p className="rec-sub">Tell us what you're in the mood for and we'll find the best matches.</p>
            </div>
          </section>
        )}

        {/* ── Filter form ── */}
        {!submitted && (
          <div className="rec-wrap">
            {/* Forms + Controlled Components (syllabus) */}
            <form className="rec-card" onSubmit={handleSubmit}>

              {/* Genre chips – Lists + Keys (syllabus) */}
              <div className="rec-field">
                <label>Genre</label>
                <div className="chip-group">
                  <button
                    type="button"
                    className={`chip${genre === '' ? ' active' : ''}`}
                    onClick={() => setGenre('')}
                  >All</button>
                  {GENRES.map(g => (
                    <button
                      key={g}
                      type="button"
                      className={`chip${genre === g ? ' active' : ''}`}
                      onClick={() => setGenre(g)}
                    >
                      {g === 'Action'   ? '🎬' :
                       g === 'Comedy'   ? '😂' :
                       g === 'Romance'  ? '❤️' : '🔪'} {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Era chips – Lists + Keys (syllabus) */}
              <div className="rec-field">
                <label>Era</label>
                <div className="chip-group">
                  <button
                    type="button"
                    className={`chip${era === '' ? ' active' : ''}`}
                    onClick={() => setEra('')}
                  >Any year</button>
                  {ERAS.map(y => (
                    <button
                      key={y}
                      type="button"
                      className={`chip${era === y ? ' active' : ''}`}
                      onClick={() => setEra(y)}
                    >{y}</button>
                  ))}
                </div>
              </div>

              {/* Rating slider – Controlled Component */}
              <div className="rec-field">
                <label>
                  Minimum rating —{' '}
                  <span className="rating-val">{parseFloat(minRating).toFixed(1)}</span> ⭐
                </label>
                <div className="slider-track">
                  <span className="slider-min">5</span>
                  <input
                    type="range"
                    min="5" max="9" step="0.5"
                    value={minRating}
                    onChange={e => setMinRating(e.target.value)}
                    className="rec-slider"
                  />
                  <span className="slider-max">9</span>
                </div>
              </div>

              {/* Search – Controlled Component */}
              <div className="rec-field">
                <label htmlFor="recSearch">
                  Search title <span className="opt-label">(optional)</span>
                </label>
                <input
                  id="recSearch"
                  type="search"
                  placeholder="e.g. Stree, Pushpa…"
                  className="rec-text-input"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <button type="submit" className="rec-submit-btn" disabled={loading}>
                {loading ? 'Loading…' : 'Get Recommendations →'}
              </button>
            </form>
          </div>
        )}

        {/* ── Results section ── */}
        {submitted && (
          <section className="results-section">
            <div className="results-inner">
              <div className="results-header">
                <h2>{resultsTitle}</h2>
                <button className="button" onClick={handleReset}>← New search</button>
              </div>

              {/* Loading States (syllabus) */}
              {loading && <p className="loading-state">Loading movies…</p>}

              {/* Error States (syllabus) */}
              {error && <p className="error-state">{error}</p>}

              {/* Lists + Keys (syllabus) */}
              {!loading && !error && (
                <>
                  <p className="note">
                    {movies.length > 0
                      ? `${movies.length} recommendation${movies.length > 1 ? 's' : ''} · sorted by rating`
                      : 'No movies match your filters. Try loosening them.'}
                  </p>
                  <div className="movie-grid">
                    {movies.map(m => (
                      <MovieCard key={m._id || m.id} movie={m} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* ── Smart card swiper ── */}
        {!submitted && <SwiperSection />}

        <footer className="page-footer">Movie Mania · Student project demo</footer>
      </main>
    </>
  );
}
