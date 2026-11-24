/**
 * useMovies.js  –  Custom Hook for fetching movies
 *
 * Covers (syllabus):
 *   Custom Hooks · useState · useEffect · Loading States ·
 *   Error States · API Integration · Search · Filters · Pagination Frontend
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export function useMovies(filters = {}) {
  const [movies,     setMovies]     = useState([]);
  const [loading,    setLoading]    = useState(false);   // Loading States
  const [error,      setError]      = useState(null);    // Error States
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // useCallback keeps the function reference stable across renders
  const fetchMovies = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      const merged = { ...filters, ...params };
      if (merged.genre)     query.set('genre',     merged.genre);
      if (merged.year)      query.set('year',      merged.year);
      if (merged.minRating) query.set('minRating', merged.minRating);
      if (merged.search)    query.set('search',    merged.search);
      if (merged.page)      query.set('page',      merged.page);
      query.set('limit', merged.limit || '100');

      const { data } = await api.get(`/movies?${query}`);
      // Shuffle results so repeated searches feel varied
      const shuffled = [...data.movies].sort(() => Math.random() - 0.5);
      setMovies(shuffled);
      setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
    } catch (err) {
      setError(err.message);   // Error States (syllabus)
    } finally {
      setLoading(false);       // Loading States (syllabus)
    }
  }, []); // eslint-disable-line

  return { movies, loading, error, pagination, fetchMovies };
}
