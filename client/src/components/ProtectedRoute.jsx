/**
 * ProtectedRoute.jsx  –  Guards routes from unauthenticated access
 *
 * Covers (syllabus): Protected Routes · React Router · Conditional Rendering
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuth } = useAuth();
  // Redirect to login if not authenticated – Protected Routes (syllabus)
  return isAuth ? children : <Navigate to="/login" replace />;
}
