import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i);
  
  // Show at most 5 page numbers, centered around current page
  const getVisiblePages = () => {
    if (totalPages <= 5) return pages;
    
    let start = Math.max(0, currentPage - 2);
    let end = Math.min(totalPages - 1, start + 4);
    
    if (end - start < 4) {
      start = Math.max(0, end - 4);
    }
    
    return pages.slice(start, end + 1);
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0 || disabled}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {getVisiblePages().map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "primary" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          disabled={disabled}
          aria-label={`Page ${page + 1}`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page + 1}
        </Button>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1 || disabled}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};