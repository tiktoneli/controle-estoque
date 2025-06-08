import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  // If still loading, don't render anything yet
  if (loading) {
    return null; // Or a loading spinner component
  }

  if (!user) {
    // Redirect unauthenticated users to the login page
    // return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};