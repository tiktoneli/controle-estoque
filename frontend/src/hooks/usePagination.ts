import { useState, useCallback } from 'react';
import { PageRequest, Page, createPageRequest } from '../types/pagination';

interface UsePaginationProps<T> {
  fetchData: (pageRequest: PageRequest) => Promise<Page<T>>;
  initialPageSize?: number;
}

export function usePagination<T>({ fetchData, initialPageSize = 10 }: UsePaginationProps<T>) {
  const [data, setData] = useState<Page<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(initialPageSize);

  const loadPage = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const pageRequest = createPageRequest(page, pageSize);
      const response = await fetchData(pageRequest);
      setData(response);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  }, [fetchData, pageSize]);

  return {
    data,
    loading,
    error,
    pageInfo: data ? {
      totalPages: data.totalPages,
      totalElements: data.totalElements,
      size: data.size,
      number: data.number,
      first: data.first,
      last: data.last,
      empty: data.empty
    } : null,
    currentPage,
    loadPage,
    setCurrentPage: (page: number) => {
      if (page >= 0 && (!data || page < data.totalPages)) {
        loadPage(page);
      }
    },
  };
}