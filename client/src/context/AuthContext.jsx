/**
 * AuthContext.jsx
 *
 * Covers (syllabus):
 *   useContext · useReducer · Context API · Auth Context ·
 *   JWT Storage · Authentication Flow · State Management
 */
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// ── Initial state ─────────────────────────────────────────────────────────────
const initialState = {
  token:    localStorage.getItem('movieManiaToken') || null,
  user:     JSON.parse(localStorage.getItem('movieManiaUser') || 'null'),
  isAuth:   !!localStorage.getItem('movieManiaToken'),
};

// ── Reducer – useReducer (syllabus) ──────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { token: action.payload.token, user: action.payload.user, isAuth: true };
    case 'LOGOUT':
      return { token: null, user: null, isAuth: false };
    default:
      return state;
  }
}

// ── Context creation ──────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider component ────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Sync to localStorage whenever auth state changes
  // Covers: useEffect (syllabus)
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('movieManiaToken',  state.token);
      localStorage.setItem('movieManiaUser',   JSON.stringify(state.user));
      localStorage.setItem('movieManiaSignedIn', 'yes');
    } else {
      ['movieManiaToken', 'movieManiaUser', 'movieManiaSignedIn', 'movieManiaEmail']
        .forEach(k => localStorage.removeItem(k));
    }
  }, [state.token, state.user]);

  const login  = (token, user) => dispatch({ type: 'LOGIN',  payload: { token, user } });
  const logout = ()            => dispatch({ type: 'LOGOUT' });

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Custom hook – Custom Hooks (syllabus) ─────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
