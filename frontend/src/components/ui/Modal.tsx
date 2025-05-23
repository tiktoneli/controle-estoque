import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
  maxHeight?: string; // e.g. '90vh', '80vh', '600px', etc.
  isNested?: boolean; // Whether this modal is nested inside another modal
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
  maxHeight = '90vh',
  isNested = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full',
  };

  // Handle click outside to close
  // const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
  //   if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
  //     onClose();
  //   }
  // };

  return (
    <div
      className={`fixed inset-0 ${isNested ? 'z-[60]' : 'z-50'} bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto`}
      // onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl w-full ${maxWidthClasses[maxWidth]} transform transition-all duration-300 ease-in-out flex flex-col`}
        style={{ maxHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-none flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 rounded-full"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 min-h-[200px] p-4 overflow-y-auto transition-[height] duration-300 ease-in-out">{children}</div>
        {footer && <div className="flex-none p-4 border-t">{footer}</div>}
      </div>
    </div>
  );
};