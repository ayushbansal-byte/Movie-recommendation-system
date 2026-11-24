/**
 * WatchlistContext.jsx – Liked/Watchlist state
 *
 * Covers (syllabus): useContext · useState · useEffect · Custom Hooks · API Integration
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const { isAuth, user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);  // array of movie objects
  const [loading,   setLoading]   = useState(false);

  // Load watchlist from API when user logs in
  const fetchWatchlist = useCallback(async () => {
    if (!isAuth || !user) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/users/${user.id || user._id}`);
      setWatchlist(data.watchlist || []);
    } catch (_) {
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  }, [isAuth, user]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // Returns true if movieId is in watchlist
  const isLiked = (movieId) =>
    watchlist.some(m => (m._id || m.id) === movieId);

  // Toggle like/unlike
  const toggleLike = async (movie) => {
    if (!isAuth || !user) return;
    const movieId = movie._id || movie.id;
    const action  = isLiked(movieId) ? 'remove' : 'add';

    // Optimistic update
    setWatchlist(prev =>
      action === 'add'
        ? [...prev, movie]
        : prev.filter(m => (m._id || m.id) !== movieId)
    );

    try {
      await api.patch(`/users/${user.id || user._id}/watchlist`, { action, movieId });
    } catch (_) {
      // Revert on failure
      fetchWatchlist();
    }
  };

  return (
    <WatchlistContext.Provider value={{ watchlist, loading, isLiked, toggleLike }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used inside WatchlistProvider');
  return ctx;
}
