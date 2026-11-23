/**
 * ProtectedRoute.jsx
 *
 * Covers (Unit 7): Protected Routes · Role-Based UI
 *
 * Usage:
 *   <ProtectedRoute>          – requires login
 *   <ProtectedRoute role="admin"> – requires admin role
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to login, preserving the page they tried to visit
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/movies" replace />;
  }

  return children;
}
