import React from 'react';
import { Button } from '../ui/Button';
import { Edit, Trash2 } from 'lucide-react';
import { Pagination } from './Pagination';

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  isLoading = false,
  onEdit,
  onDelete,
  actions,
  emptyMessage = 'No data found',
  className = '',
  currentPage,
  totalPages,
  onPageChange,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div 
        className="flex justify-center items-center h-64"
        role="status"
        aria-live="polite"
      >
        <div 
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00859e]"
          aria-label="Loading data"
        ></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div 
        className="text-center py-8 text-gray-500"
        role="status"
        aria-label="No data found"
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`bg-white shadow rounded-lg overflow-hidden ${className}`}>
      <div className="hidden md:block">
        <table 
          className="min-w-full divide-y divide-gray-200"
          role="table"
          aria-label="Data table"
        >
          <thead className="bg-gray-50">
            <tr role="row">
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope="col"
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                  role="columnheader"
                >
                  {column.header}
                </th>
              ))}
              {(onEdit || onDelete || actions) && (
                <th
                  scope="col"
                  className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  role="columnheader"
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr 
                key={item.id} 
                role="row"
                className="hover:bg-gray-50"
              >
                {columns.map((column) => (
                  <td 
                    key={`${item.id}-${String(column.accessorKey)}`}
                    className={`px-6 py-4 whitespace-nowrap ${column.accessorKey === 'description' ? 'max-w-xs truncate' : ''}`}
                    role="cell"
                    title={column.accessorKey === 'description' ? String(item[column.accessorKey]) : undefined}
                  >
                    {column.cell ? column.cell(item) : String(item[column.accessorKey])}
                  </td>
                ))}
                {(onEdit || onDelete || actions) && (
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                    role="cell"
                  >
                    <div className="flex justify-end space-x-2">
                      {actions && actions(item)}
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(item)}
                          aria-label={`Edit ${item.id}`}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onDelete(item)}
                          aria-label={`Delete ${item.id}`}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid grid-cols-1 gap-4 p-4">
        {data.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow rounded-lg p-4"
            role="article"
            aria-label={`Item ${item.id}`}
          >
            <div className="space-y-2">
              {columns.map((column) => (
                <div key={`${item.id}-${String(column.accessorKey)}`}>
                  <div className="text-sm font-medium text-gray-500">{column.header}</div>
                  <div className="mt-1">
                    {column.cell ? column.cell(item) : String(item[column.accessorKey])}
                  </div>
                </div>
              ))}
            </div>
            {(onEdit || onDelete || actions) && (
              <div className="mt-4 flex justify-end space-x-2">
                {actions && actions(item)}
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item)}
                    aria-label={`Edit ${item.id}`}
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" aria-hidden="true" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(item)}
                    aria-label={`Delete ${item.id}`}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages && totalPages > 1 && onPageChange && (
        <div className="border-t border-gray-200 px-4 py-3">
          <Pagination
            currentPage={currentPage || 0}
            totalPages={totalPages}
            onPageChange={onPageChange}
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
}