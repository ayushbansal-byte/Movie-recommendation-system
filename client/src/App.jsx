/**
 * App.jsx  –  Root component with React Router
 *
 * Covers (Unit 6): React Router · Route Params · Nested Routes · JSX · Functional Components
 * Covers (Unit 7): Protected Routes · Role-Based UI · Authentication Flow
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar          from './components/Navbar';
import ProtectedRoute  from './components/ProtectedRoute';

import HomePage        from './pages/HomePage';
import LoginPage       from './pages/LoginPage';
import MoviesPage      from './pages/MoviesPage';
import MovieDetailPage from './pages/MovieDetailPage';
import AdminPage       from './pages/AdminPage';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/"       element={<HomePage />} />
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/movies" element={<MoviesPage />} />

          {/* Route Params – single movie (Unit 6) */}
          <Route path="/movies/:id" element={<MovieDetailPage />} />

          {/* Protected: admin only (Unit 7 – Role-Based UI) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h1 className="text-6xl font-black text-zinc-700 mb-4">404</h1>
                <p className="text-zinc-500 mb-6">Page not found</p>
                <a href="/" className="text-brand hover:underline">Go home</a>
              </div>
            }
          />
        </Routes>
      </main>

      <footer className="text-center py-6 text-zinc-700 text-xs border-t border-zinc-900 mt-16">
        Movie Mania · BEE Project · Node.js + Express + MongoDB + React
      </footer>
    </div>
  );
}
