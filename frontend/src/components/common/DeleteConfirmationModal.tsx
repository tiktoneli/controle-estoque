import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  itemName
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <form onSubmit={handleSubmit}>
        <div className="py-4">
          <p className="text-gray-600">
            {message}
            {itemName && (
              <span className="font-semibold"> {itemName}</span>
            )}
          </p>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
          >
            Delete
          </Button>
        </div>
      </form>
    </Modal>
  );
}; 