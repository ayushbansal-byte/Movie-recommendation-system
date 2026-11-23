/**
 * HomePage.jsx  –  Landing page
 * Covers (Unit 6): Functional Components · JSX · Conditional Rendering
 * Covers (Unit 7): UX Basics
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-xs font-bold tracking-widest text-brand uppercase mb-4">Welcome to</p>
      <h1 className="text-5xl sm:text-7xl font-black mb-5 leading-tight">
        MOVIE <span className="text-brand">MANIA</span>
      </h1>
      <p className="text-zinc-400 max-w-md mb-10 text-lg">
        Discover, filter and get personalised movie recommendations powered by a full-stack Node.js + React app.
      </p>

      {user ? (
        <button
          onClick={() => navigate('/movies')}
          className="bg-brand hover:bg-brand-dark text-white font-bold px-8 py-4 rounded-xl text-lg transition shadow-lg shadow-brand/30"
        >
          Browse Movies →
        </button>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/login"
            className="bg-brand hover:bg-brand-dark text-white font-bold px-8 py-4 rounded-xl text-lg transition shadow-lg shadow-brand/30"
          >
            Get Started →
          </Link>
          <Link
            to="/movies"
            className="border border-zinc-600 hover:border-zinc-400 text-zinc-300 hover:text-white font-bold px-8 py-4 rounded-xl text-lg transition"
          >
            Browse without signing in
          </Link>
        </div>
      )}

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-3 mt-16">
        {['15+ Movies', 'Genre Filters', 'Search & Sort', 'JWT Auth', 'MongoDB Atlas', 'React + Tailwind'].map(f => (
          <span key={f} className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs px-4 py-2 rounded-full">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
