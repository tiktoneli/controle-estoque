import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { BarChart, PieChart, Activity, AlertTriangle, Package, Map } from 'lucide-react';
import { BatchInventory } from '../types';

export const DashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [inventorySummary, setInventorySummary] = useState<{
    total_batches: number;
    total_items: number;
    available_items: number;
    low_stock_items: number;
  }>({
    total_batches: 0,
    total_items: 0,
    available_items: 0,
    low_stock_items: 0,
  });
  const [recentBatches, setRecentBatches] = useState<BatchInventory[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch summary data using a single query
        const { data: summaryData, error: summaryError } = await supabase
          .from('batches')
          .select(`
            id,
            name,
            min_stock,
            batch_items (
              id,
              status
            )
          `);

        if (summaryError) throw summaryError;

        // Calculate summary metrics
        const summary = {
          total_batches: summaryData?.length || 0,
          total_items: summaryData?.reduce((sum, batch) => sum + (batch.batch_items?.length || 0), 0) || 0,
          available_items: summaryData?.reduce((sum, batch) => 
            sum + (batch.batch_items?.filter(item => item.status === 'available').length || 0), 0) || 0,
          low_stock_items: summaryData?.filter(batch => {
            const availableItems = batch.batch_items?.filter(item => item.status === 'available').length || 0;
            const totalItems = batch.batch_items?.length || 0;
            return totalItems > 0 && (availableItems / totalItems) < 0.2;
          }).length || 0,
        };

        setInventorySummary(summary);

        // Fetch recent batches with their inventory data
        const { data: batchesData, error: batchesError } = await supabase
          .from('batches')
          .select(`
            id,
            name,
            created_at,
            categories!inner (
              id,
              name
            ),
            batch_items (
              id,
              status
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (batchesError) throw batchesError;

        // Transform the data to match the BatchInventory type
        const transformedBatches: BatchInventory[] = (batchesData || []).map(batch => ({
          batch_id: batch.id,
          batch_name: batch.name,
          category_id: batch.categories.id,
          category_name: batch.categories.name,
          total_items: batch.batch_items?.length || 0,
          available_items: batch.batch_items?.filter(item => item.status === 'available').length || 0,
        }));

        setRecentBatches(transformedBatches);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        addToast({
          title: 'Failed to load dashboard',
          message: 'Could not retrieve dashboard data',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [addToast]);

  // Metric cards for the dashboard
  const metricCards = [
    {
      title: 'Total Batches',
      value: inventorySummary.total_batches,
      icon: <Package className="h-6 w-6 " />,
      color: 'bg-blue-200',
      textColor: 'text-blue-800',
    },
    {
      title: 'Total Items',
      value: inventorySummary.total_items,
      icon: <BarChart className="h-6 w-6 " />,
      color: 'bg-purple-200',
      textColor: 'text-indigo-800',
    },
    {
      title: 'Available Items',
      value: inventorySummary.available_items,
      icon: <PieChart className="h-6 w-6 " />,
      color: 'bg-green-100',
      textColor: 'text-green-800',
    },
    {
      title: 'Low Stock Items',
      value: inventorySummary.low_stock_items,
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'bg-amber-100',
      textColor: 'text-amber-800',
    },
  ];

  return (
    <div className="space-y-8" role="main" aria-label="Dashboard">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your inventory dashboard</p>
      </div>

      {isLoading ? (
        <div 
          className="flex justify-center items-center h-64"
          role="status"
          aria-live="polite"
        >
          <div 
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00859e]"
            aria-label="Loading dashboard data"
          ></div>
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            role="region"
            aria-label="Inventory metrics"
          >
            {metricCards.map((card, index) => (
              <div
                key={index}
                className={`${card.color} p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow`}
                role="article"
                aria-label={`${card.title}: ${card.value}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                  </div>
                  <div className="p-3 rounded-full" aria-hidden="true">{card.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Batches */}
            <div 
              className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6"
              role="region"
              aria-label="Recent batches"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Batches</h2>
                <Activity className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              
              {recentBatches.length > 0 ? (
                <div className="overflow-x-auto">
                  <table 
                    className="min-w-full divide-y divide-gray-200"
                    role="table"
                    aria-label="Recent batches list"
                  >
                    <thead>
                      <tr role="row">
                        <th 
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          role="columnheader"
                        >
                          Batch Name
                        </th>
                        <th 
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          role="columnheader"
                        >
                          Category
                        </th>
                        <th 
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          role="columnheader"
                        >
                          Total Items
                        </th>
                        <th 
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          role="columnheader"
                        >
                          Available
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentBatches.map((batch) => (
                        <tr 
                          key={batch.batch_id} 
                          className="hover:bg-gray-50"
                          role="row"
                        >
                          <td 
                            className="px-4 py-3 text-sm font-medium text-gray-900"
                            role="cell"
                          >
                            {batch.batch_name}
                          </td>
                          <td 
                            className="px-4 py-3 text-sm text-gray-600"
                            role="cell"
                          >
                            {batch.category_name}
                          </td>
                          <td 
                            className="px-4 py-3 text-sm text-gray-600"
                            role="cell"
                          >
                            {batch.total_items}
                          </td>
                          <td 
                            className="px-4 py-3 text-sm"
                            role="cell"
                          >
                            <div className="flex items-center">
                              <span 
                                className={`${
                                  (batch.available_items / batch.total_items) < 0.2
                                    ? 'text-red-600'
                                    : (batch.available_items / batch.total_items) < 0.5
                                    ? 'text-amber-600'
                                    : 'text-green-600'
                                }`}
                                aria-label={`${batch.available_items} items available`}
                              >
                                {batch.available_items}
                              </span>
                              <div 
                                className="ml-2 w-16 bg-gray-200 rounded-full h-2"
                                role="progressbar"
                                aria-valuemin={0}
                                aria-valuemax={batch.total_items}
                                aria-valuenow={batch.available_items}
                                aria-label={`${Math.round((batch.available_items / batch.total_items) * 100)}% available`}
                              >
                                <div
                                  className={`${
                                    (batch.available_items / batch.total_items) < 0.2
                                      ? 'bg-red-600'
                                      : (batch.available_items / batch.total_items) < 0.5
                                      ? 'bg-amber-500'
                                      : 'bg-green-500'
                                  } h-2 rounded-full`}
                                  style={{
                                    width: `${(batch.available_items / batch.total_items) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div 
                  className="text-center py-8"
                  role="status"
                  aria-label="No batches found"
                >
                  <Package className="h-10 w-10 text-gray-400 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-gray-500">No batches found</p>
                  <p className="text-sm text-gray-400">Create your first batch to get started</p>
                </div>
              )}
            </div>

            {/* Quick Actions & Alerts */}
            <div 
              className="bg-white rounded-lg shadow-sm p-6"
              role="region"
              aria-label="Quick actions and alerts"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              
              <div className="space-y-3">
                <a 
                  href="#" 
                  className="block p-4 bg-[#00859e] text-white rounded-lg hover:bg-[#006e84] transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/batches';
                  }}
                >
                  <div className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    <span>Create New Batch</span>
                  </div>
                </a>
                
                <a 
                  href="#" 
                  className="block p-4 bg-[#00859e] text-white rounded-lg hover:bg-[#006e84] transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/categories';
                  }}
                >
                  <div className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2" />
                    <span>Manage Categories</span>
                  </div>
                </a>
                
                <a 
                  href="#" 
                  className="block p-4 bg-[#00859e] text-white rounded-lg hover:bg-[#006e84] transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/locations';
                  }}
                >
                  <div className="flex items-center">
                    <Map className="h-5 w-5 mr-2" />
                    <span>Manage Locations</span>
                  </div>
                </a>
              </div>
              
              {/* Low Stock Alerts */}
              <div className="mt-8">
                <h3 className="text-md font-medium text-gray-900 mb-4">Low Stock Alerts</h3>
                
                {inventorySummary.low_stock_items > 0 ? (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <div className="ml-3">
                        <p className="text-sm text-amber-700">
                          {inventorySummary.low_stock_items} {inventorySummary.low_stock_items === 1 ? 'item' : 'items'} running low on stock
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">All stock levels are good</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};