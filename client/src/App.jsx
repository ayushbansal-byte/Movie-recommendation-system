import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login   from './pages/Login';
import Movies  from './pages/Movies';
import Likes   from './pages/Likes';

export default function App() {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <Routes>
          <Route path="/"       element={<Landing />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/movies" element={<ProtectedRoute><Movies /></ProtectedRoute>} />
          <Route path="/likes"  element={<ProtectedRoute><Likes /></ProtectedRoute>} />
          <Route path="*"       element={<Navigate to="/" replace />} />
        </Routes>
      </WatchlistProvider>
    </AuthProvider>
  );
}
