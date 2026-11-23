/**
 * context/AuthContext.jsx  –  Global auth state
 *
 * Covers (Unit 6): useContext · useReducer · Context API · Custom Hooks
 * Covers (Unit 7): Auth Context · JWT Storage · Login/Logout · Protected Routes
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../api/axios';

// ── Initial state ──────────────────────────────────────────────────────────────
const initialState = {
  user:  JSON.parse(localStorage.getItem('mm_user') || 'null'),
  token: localStorage.getItem('mm_token') || null,
  loading: false,
  error:   null,
};

// ── Reducer (useReducer – Unit 6) ─────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'REQUEST':  return { ...state, loading: true, error: null };
    case 'SUCCESS':
      return { ...state, loading: false, user: action.user, token: action.token, error: null };
    case 'ERROR':    return { ...state, loading: false, error: action.error };
    case 'LOGOUT':   return { ...state, user: null, token: null, error: null };
    default:         return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Persist token + user to localStorage whenever they change
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('mm_token', state.token);
      localStorage.setItem('mm_user',  JSON.stringify(state.user));
    } else {
      localStorage.removeItem('mm_token');
      localStorage.removeItem('mm_user');
    }
  }, [state.token, state.user]);

  // ── register ───────────────────────────────────────────────────────────────
  async function register(name, email, password) {
    dispatch({ type: 'REQUEST' });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      dispatch({ type: 'SUCCESS', user: data.user, token: data.token });
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      dispatch({ type: 'ERROR', error: msg });
      throw new Error(msg);
    }
  }

  // ── login ──────────────────────────────────────────────────────────────────
  async function login(email, password) {
    dispatch({ type: 'REQUEST' });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      dispatch({ type: 'SUCCESS', user: data.user, token: data.token });
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      dispatch({ type: 'ERROR', error: msg });
      throw new Error(msg);
    }
  }

  // ── logout ─────────────────────────────────────────────────────────────────
  function logout() {
    dispatch({ type: 'LOGOUT' });
  }

  return (
    <AuthContext.Provider value={{ ...state, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Custom hook (Unit 6 – Custom Hooks) ──────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
