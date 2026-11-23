/**
 * MoviesPage.jsx  –  Browse & filter movies
 *
 * Covers (Unit 6): useState · useEffect · Lists · Keys · Conditional Rendering · Forms
 * Covers (Unit 7): Search · Filters · Pagination Frontend · Loading States · Error States
 */

import React, { useState } from 'react';
import { useMovies } from '../hooks/useMovies';
import MovieCard    from '../components/MovieCard';
import Spinner      from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import Pagination   from '../components/Pagination';

const GENRES = ['', 'Action', 'Comedy', 'Romance', 'Thriller', 'Drama', 'Horror', 'Sci-Fi', 'Animation'];
const YEARS  = ['', '2026', '2025', '2024', '2023', '2022'];
const SORTS  = [
  { value: '-rating', label: 'Rating ↓' },
  { value:  'rating', label: 'Rating ↑' },
  { value: '-year',   label: 'Newest' },
  { value:  'year',   label: 'Oldest' },
  { value:  'title',  label: 'A → Z' },
];

export default function MoviesPage() {
  const [search, setSearch] = useState('');
  const { movies, loading, error, total, totalPages, filters, updateFilters } = useMovies();

  function handleSearchSubmit(e) {
    e.preventDefault();
    updateFilters({ search, page: 1 });
  }

  function handleFilterChange(key, value) {
    updateFilters({ [key]: value, page: 1 });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Banner ── */}
      <div className="mb-8 text-center">
        <p className="text-xs font-bold tracking-widest text-brand uppercase mb-2">Personalised for you</p>
        <h1 className="text-4xl sm:text-5xl font-black">Find your next watch</h1>
        <p className="text-zinc-400 mt-2 text-sm">Browse, filter and search {total} movies</p>
      </div>

      {/* ── Filters bar ── */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        {/* Search (Unit 7 – Search) */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 min-w-[200px]">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title…"
            className="flex-1 bg-zinc-800 border border-zinc-700 focus:border-brand rounded-lg px-4 py-2 text-sm text-white outline-none transition"
          />
          <button type="submit" className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
            Search
          </button>
        </form>

        {/* Genre filter */}
        <select
          value={filters.genre || ''}
          onChange={e => handleFilterChange('genre', e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-sm outline-none"
        >
          {GENRES.map(g => <option key={g} value={g}>{g || 'All genres'}</option>)}
        </select>

        {/* Year filter */}
        <select
          value={filters.year || ''}
          onChange={e => handleFilterChange('year', e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-sm outline-none"
        >
          {YEARS.map(y => <option key={y} value={y}>{y || 'Any year'}</option>)}
        </select>

        {/* Min rating */}
        <select
          value={filters.minRating || ''}
          onChange={e => handleFilterChange('minRating', e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-sm outline-none"
        >
          {['', '5', '6', '7', '8'].map(r => (
            <option key={r} value={r}>{r ? `⭐ ${r}+` : 'Any rating'}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={filters.sort || '-rating'}
          onChange={e => handleFilterChange('sort', e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-sm outline-none"
        >
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* ── Results count ── */}
      {!loading && !error && (
        <p className="text-zinc-500 text-sm mb-4">
          {total} result{total !== 1 ? 's' : ''}
        </p>
      )}

      {/* ── Loading state (Unit 7) ── */}
      {loading && <Spinner />}

      {/* ── Error state (Unit 7) ── */}
      {error && !loading && (
        <ErrorMessage message={error} onRetry={() => updateFilters({ page: 1 })} />
      )}

      {/* ── Movie grid – Lists & Keys (Unit 6) ── */}
      {!loading && !error && (
        <>
          {movies.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
              No movies match your filters. Try loosening them.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.map(m => (
                <MovieCard key={m._id || m.id} movie={m} />
              ))}
            </div>
          )}

          {/* Pagination (Unit 7) */}
          <Pagination
            page={filters.page}
            totalPages={totalPages}
            onPageChange={p => updateFilters({ page: p })}
          />
        </>
      )}
    </div>
  );
}
