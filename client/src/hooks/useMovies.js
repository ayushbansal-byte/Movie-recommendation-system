/**
 * hooks/useMovies.js  –  Custom hook for fetching movies
 *
 * Covers (Unit 6): Custom Hooks · useState · useEffect · API Integration
 * Covers (Unit 7): Loading States · Error States · Search · Filters · Pagination
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export function useMovies(initialFilters = {}) {
  const [movies,     setMovies]     = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters,    setFilters]    = useState({ page: 1, limit: 12, ...initialFilters });

  const fetchMovies = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
      );
      const { data } = await api.get(`/movies?${query}`);
      setMovies(data.movies);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies(filters);
  }, [filters, fetchMovies]);

  function updateFilters(newFilters) {
    setFilters(prev => ({ ...prev, ...newFilters, page: newFilters.page ?? 1 }));
  }

  return { movies, loading, error, total, totalPages, filters, updateFilters };
}
