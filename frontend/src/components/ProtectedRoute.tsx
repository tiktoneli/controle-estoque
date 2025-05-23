import React from 'react';
import { Outlet } from 'react-router-dom';

export const ProtectedRoute: React.FC = () => {
  // Temporarily bypass authentication checks
  return <Outlet />;
};