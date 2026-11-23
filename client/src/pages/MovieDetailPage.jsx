/**
 * MovieDetailPage.jsx  –  Single movie + reviews
 *
 * Covers (Unit 6): useEffect · Route Params · Conditional Rendering · Forms
 * Covers (Unit 7): Loading States · Error States · CRUD Full Stack
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api          from '../api/axios';
import { useAuth }  from '../context/AuthContext';
import Spinner      from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

export default function MovieDetailPage() {
  const { id }              = useParams();
  const { user }            = useAuth();
  const navigate            = useNavigate();

  const [movie,      setMovie]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [imgError,   setImgError]   = useState(false);

  // Review form state
  const [rating,  setRating]  = useState(7);
  const [comment, setComment] = useState('');
  const [revErr,  setRevErr]  = useState('');
  const [revOk,   setRevOk]   = useState('');
  const [revLoad, setRevLoad] = useState(false);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/movies/${id}`);
        setMovie(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load movie');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  async function handleDeleteMovie() {
    if (!window.confirm('Delete this movie?')) return;
    try {
      await api.delete(`/movies/${id}`);
      navigate('/movies');
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    setRevErr(''); setRevOk(''); setRevLoad(true);
    try {
      const { data } = await api.post(`/movies/${id}/reviews`, { rating, comment });
      setMovie(prev => ({ ...prev, reviews: data.reviews }));
      setRevOk('Review added!');
      setComment('');
    } catch (err) {
      setRevErr(err.response?.data?.error || 'Failed to add review');
    } finally {
      setRevLoad(false);
    }
  }

  if (loading) return <Spinner />;
  if (error)   return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  if (!movie)  return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

      {/* ── Movie header ── */}
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Poster */}
        <div className="flex-shrink-0 w-full sm:w-48 aspect-[2/3] bg-zinc-800 rounded-xl overflow-hidden">
          {!imgError && movie.poster ? (
            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm p-4 text-center">
              {movie.title}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <span className="inline-block bg-brand text-white text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3">
            {movie.genre}
          </span>
          <h1 className="text-3xl font-black mb-2">{movie.title}</h1>
          <p className="text-zinc-400 text-sm mb-1">{movie.year} · {movie.audio}</p>
          <p className="text-yellow-400 font-bold text-lg mb-3">⭐ {movie.rating}/10</p>
          {movie.description && (
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">{movie.description}</p>
          )}
          {movie.avgReviewRating && (
            <p className="text-zinc-500 text-sm">
              User avg: <span className="text-yellow-300 font-semibold">{movie.avgReviewRating}/10</span>
              {' '}({movie.reviewCount} review{movie.reviewCount !== 1 ? 's' : ''})
            </p>
          )}

          {/* Admin actions – Role-Based UI (Unit 7) */}
          {user?.role === 'admin' && (
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => navigate(`/admin/movies/${id}/edit`)}
                className="border border-zinc-600 hover:border-zinc-400 text-zinc-300 px-4 py-1.5 rounded text-sm transition"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteMovie}
                className="border border-red-800 hover:border-red-500 text-red-400 hover:text-red-300 px-4 py-1.5 rounded text-sm transition"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Reviews section ── */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6 border-b border-zinc-800 pb-3">
          Reviews ({movie.reviews?.length || 0})
        </h2>

        {/* Review form – authenticated users only */}
        {user && (
          <form onSubmit={submitReview} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
            <h3 className="font-semibold mb-4">Add your review</h3>
            <div className="flex items-center gap-3 mb-3">
              <label className="text-xs text-zinc-400">Rating:</label>
              <input
                type="range" min="1" max="10" step="1"
                value={rating}
                onChange={e => setRating(Number(e.target.value))}
                className="flex-1 accent-brand"
              />
              <span className="text-yellow-400 font-bold w-8 text-center">{rating}</span>
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write a comment… (optional)"
              maxLength={500}
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-brand rounded-lg px-4 py-2.5 text-sm text-white outline-none transition resize-none"
            />
            {revErr && <p className="text-red-400 text-xs mt-2">{revErr}</p>}
            {revOk  && <p className="text-green-400 text-xs mt-2">{revOk}</p>}
            <button
              type="submit" disabled={revLoad}
              className="mt-3 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
            >
              {revLoad ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        )}

        {/* Review list */}
        {(!movie.reviews || movie.reviews.length === 0) ? (
          <p className="text-zinc-500 text-sm">No reviews yet. Be the first!</p>
        ) : (
          <div className="flex flex-col gap-4">
            {movie.reviews.map(r => (
              <div key={r._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-zinc-200">{r.userName}</span>
                  <span className="text-yellow-400 text-sm font-bold">⭐ {r.rating}/10</span>
                </div>
                {r.comment && <p className="text-zinc-400 text-sm">{r.comment}</p>}
                <p className="text-zinc-600 text-xs mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
