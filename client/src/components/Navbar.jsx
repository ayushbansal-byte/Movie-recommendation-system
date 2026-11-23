/**
 * Navbar.jsx
 *
 * Covers (Unit 6): Functional Components · Props · Conditional Rendering
 * Covers (Unit 7): Role-Based UI · Login/Logout
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Brand */}
        <Link to="/" className="text-white font-black text-xl tracking-widest uppercase">
          MOVIE <span className="text-brand">MANIA</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-4">
          <Link to="/movies" className="text-zinc-400 hover:text-white text-sm transition">
            Browse
          </Link>

          {/* Role-based UI – admin-only link (Unit 7) */}
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-brand hover:text-brand-dark text-sm transition font-semibold">
              Admin
            </Link>
          )}

          {user ? (
            <>
              <span className="text-zinc-500 text-xs hidden sm:inline">{user.email}</span>
              <button
                onClick={handleLogout}
                className="border border-zinc-600 hover:border-zinc-400 text-zinc-300 hover:text-white px-3 py-1 rounded text-sm transition"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-brand hover:bg-brand-dark text-white px-4 py-1.5 rounded text-sm font-semibold transition"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
