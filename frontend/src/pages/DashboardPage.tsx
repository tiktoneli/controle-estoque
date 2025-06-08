import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { usePagination } from '../hooks/usePagination';
import { PageRequest, Page } from '../types/pagination';

interface DashboardSummary {
  totalBatches: number;
  lowStockBatches: number;
  activeBatches: number;
  totalProducts: number;
}

interface BatchSummary {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
}

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const { addToast } = useToast();

  const fetchDashboardSummary = async () => {
    try {
      setIsLoadingSummary(true);
      const summaryResponse = await api.get<DashboardSummary>('/dashboard/summary');
      setSummary(summaryResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      addToast({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to load dashboard summary',
        type: 'error',
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const fetchLowStockBatches = async (pageRequest: PageRequest): Promise<Page<BatchSummary>> => {
    const response = await api.get<Page<BatchSummary>>('/dashboard/low-stock', { params: pageRequest });
    return response.data;
  };

  const {
    data: lowStockBatchesPage,
    loading: isLoadingBatches,
    loadPage
  } = usePagination<BatchSummary>({
    fetchData: fetchLowStockBatches,
    initialPageSize: 5
  });

  useEffect(() => {
    fetchDashboardSummary();
    loadPage(0);
  }, [addToast]);

  const isLoading = isLoadingSummary || isLoadingBatches;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00859e]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary?.totalBatches || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{summary?.lowStockBatches || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{summary?.activeBatches || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary?.totalProducts || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Low Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockBatchesPage?.content.length === 0 ? (
            <p className="text-gray-500">No low stock alerts</p>
          ) : (
            <div className="space-y-4">
              {lowStockBatchesPage?.content.map((batch) => (
                <div
                  key={batch.id}
                  className="flex items-center justify-between p-4 bg-red-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{batch.name}</h3>
                    <p className="text-sm text-gray-600">
                      Current Stock: {batch.currentStock} | Minimum Stock: {batch.minStock}
                    </p>
                  </div>
                  <div className="text-red-600 font-medium">
                    {((batch.currentStock / batch.minStock) * 100).toFixed(1)}% of minimum
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};