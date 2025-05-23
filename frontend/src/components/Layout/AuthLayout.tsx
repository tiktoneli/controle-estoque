import React from 'react';
import { Outlet } from 'react-router-dom';
import { Database } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Image/Branding */}
      <div className="hidden md:flex md:w-1/2 bg-[#00859e] text-white items-center justify-center">
        <div className="max-w-md p-8">
          <div className="mb-6 flex items-center">
            <Database className="h-10 w-10 mr-2" />
            <h1 className="text-3xl font-bold">Inventory Control</h1>
          </div>
          <h2 className="text-2xl font-semibold mb-4">Manage your inventory with ease</h2>
          <p className="text-lg text-gray-100">
            Track batches, categorize items, and monitor stock levels all in one place. Our system
            helps you maintain optimal inventory levels and streamline your operations.
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center md:hidden">
            <div className="inline-flex items-center justify-center mb-4">
              <Database className="h-8 w-8 mr-2 text-[#00859e]" />
              <h1 className="text-2xl font-bold text-gray-900">Inventory Control</h1>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};