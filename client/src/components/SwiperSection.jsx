/**
 * SwiperSection.jsx  –  Smart card swiper
 *
 * Covers (syllabus):
 *   Functional Components · useState · useEffect · Conditional Rendering ·
 *   Event Handling · Lists · Keys · API Integration · Loading States · Error States
 *
 * Like button is synced with WatchlistContext so liked swiper cards
 * appear on the My Likes page.
 */
import React, { useState } from 'react';
import api from '../api/axios';
import MovieCard from './MovieCard';
import { useWatchlist } from '../context/WatchlistContext';

const PHASE = { INTRO: 'intro', DECK: 'deck', SUMMARY: 'summary' };

export default function SwiperSection() {
  const [phase,   setPhase]   = useState(PHASE.INTRO);
  const [deck,    setDeck]    = useState([]);
  const [cursor,  setCursor]  = useState(0);
  const [liked,   setLiked]   = useState([]);
  const [imgErr,  setImgErr]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Sync likes with global watchlist
  const { toggleLike, isLiked } = useWatchlist();

  async function startSwiper() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/movies?limit=100');
      const shuffled = [...data.movies].sort(() => Math.random() - 0.5);
      setDeck(shuffled);
      setCursor(0);
      setLiked([]);
      setImgErr(false);
      setPhase(PHASE.DECK);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function advance(isLikeAction) {
    const movie = deck[cursor];
    if (isLikeAction) {
      // Save to global watchlist (syncs with My Likes page)
      toggleLike(movie);
      setLiked(prev => [...prev, movie]);
    }
    const next = cursor + 1;
    if (next < deck.length) {
      setCursor(next);
      setImgErr(false);
    } else {
      setPhase(PHASE.SUMMARY);
    }
  }

  const current = deck[cursor];

  return (
    <section className="swiper-section">
      <div className="section-divider"><span>OR</span></div>

      {phase === PHASE.INTRO && (
        <div className="swiper-intro">
          <p className="eyebrow">QUICK PICKS</p>
          <h2 className="swiper-heading">Like it or skip it?</h2>
          <p className="swiper-sub">Go through every movie one by one and save the ones you want to watch.</p>
          {error && <p className="error-state">{error}</p>}
          <button className="swiper-start-btn" onClick={startSwiper} disabled={loading}>
            {loading ? 'Loading…' : 'Start Swiping ›'}
          </button>
        </div>
      )}

      {phase === PHASE.DECK && current && (
        <div className="swiper-deck">
          <p className="swiper-progress">{cursor + 1} of {deck.length}</p>

          <div className="swiper-card-wrap">
            <div className="swiper-card" key={current._id || current.id}>
              <div className={`swiper-poster${imgErr ? ' no-poster' : ''}`}>
                <span className="poster-fallback">{current.title}</span>
                {!imgErr && current.poster && (
                  <img
                    src={current.poster}
                    alt={`${current.title} poster`}
                    onError={() => setImgErr(true)}
                  />
                )}
              </div>
              <span className="swiper-genre-badge">{current.genre}</span>
              <div className="swiper-overlay">
                <h3>{current.title}</h3>
                <p className="swiper-meta">{current.year} · {current.audio}</p>
                <span className="swiper-rating">⭐ {current.rating}/10</span>
              </div>
            </div>
          </div>

          <div className="swiper-actions">
            <button className="swiper-btn skip" onClick={() => advance(false)}>⏭ Skip</button>
            <button
              className={`swiper-btn like${isLiked(current._id || current.id) ? ' already-liked' : ''}`}
              onClick={() => advance(true)}
            >
              {isLiked(current._id || current.id) ? '❤️ Liked' : '👍 Like'}
            </button>
          </div>
        </div>
      )}

      {phase === PHASE.SUMMARY && (
        <div className="swiper-summary">
          <h3>Your liked movies</h3>
          <p className="note">
            {liked.length > 0
              ? `You liked ${liked.length} movie${liked.length > 1 ? 's' : ''} — saved to ❤️ My Likes.`
              : 'You skipped everything. Try again with fresh eyes!'}
          </p>
          <div className="movie-grid summary-grid">
            {liked.map(m => <MovieCard key={m._id || m.id} movie={m} />)}
          </div>
          <button
            className="swiper-start-btn"
            style={{ marginTop: 32 }}
            onClick={() => { setPhase(PHASE.INTRO); setLiked([]); }}
          >
            Swipe again ›
          </button>
        </div>
      )}
    </section>
  );
}
