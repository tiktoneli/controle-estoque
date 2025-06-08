import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './components/Layout/MainLayout';
import { AuthLayout } from './components/Layout/AuthLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductTypesPage } from './pages/ProductTypesPage';
import { LocationsPage } from './pages/LocationsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import InventoryPage from './pages/InventoryPage';
// import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product-types" element={<ProductTypesPage />} />
                <Route path="/locations" element={<LocationsPage />} />
                {/* <Route path="/settings" element={<SettingsPage />} /> */}
              </Route>
            </Route>

            {/* Redirect to dashboard if logged in, otherwise to login */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;