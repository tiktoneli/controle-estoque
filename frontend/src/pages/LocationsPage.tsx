import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { Location } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, MapPin } from 'lucide-react';
import { FilterBar, FilterConfig } from '../components/common/FilterBar';
import { useDebounce } from '../hooks/useDebounce';
import { DeleteConfirmationModal } from '../components/common/DeleteConfirmationModal';
import { api } from '../lib/api';
import { usePagination } from '../hooks/usePagination';
import { PageRequest, Page } from '../types/pagination';
import { DataTable, ColumnDef } from '../components/common/DataTable';

export const LocationsPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [filters, setFilters] = useState({
    search: ''
  });
  const debouncedSearch = useDebounce(filters.search, 500);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const { addToast } = useToast();

  const fetchLocations = async (pageRequest: PageRequest) => {
    const params = new URLSearchParams();
    
    if (debouncedSearch) {
      params.append('search', debouncedSearch);
    }
    
    const endpoint = `locations?${params.toString()}`;
    return api.get<Page<Location>>(endpoint, pageRequest);
  };

  const {
    data: locationsPage,
    loading: isLoading,
    pageInfo,
    currentPage,
    setCurrentPage,
    loadPage
  } = usePagination<Location>({
    fetchData: fetchLocations,
    initialPageSize: 10
  });

  useEffect(() => {
    loadPage(0);
  }, []);

  useEffect(() => {
    loadPage(0);
  }, [debouncedSearch]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
  };

  const handleAddLocation = async () => {
    try {
      if (!formData.name.trim()) {
        addToast({
          title: 'Validation Error',
          message: 'Location name is required',
          type: 'error',
        });
        return;
      }

      await api.post<Location>('locations', formData);
      loadPage(0); // Refresh first page
      setIsAddModalOpen(false);
      resetForm();
      addToast({
        title: 'Success',
        message: 'Location created successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error creating location:', error);
      addToast({
        title: 'Error',
        message: 'Failed to create location',
        type: 'error'
      });
    }
  };

  const handleEditLocation = async () => {
    try {
      if (!selectedLocation) return;

      if (!formData.name.trim()) {
        addToast({
          title: 'Validation Error',
          message: 'Location name is required',
          type: 'error',
        });
        return;
      }

      await api.put<Location>(`locations/${selectedLocation.id}`, formData);
      loadPage(currentPage); // Refresh current page
      setIsEditModalOpen(false);
      resetForm();
      addToast({
        title: 'Success',
        message: 'Location updated successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating location:', error);
      addToast({
        title: 'Error',
        message: 'Failed to update location',
        type: 'error'
      });
    }
  };

  const handleDeleteLocation = async () => {
    try {
      if (!selectedLocation) return;

      // Check for items in the location
      // const items = await api.get<{ content: { id: string }[] }>(`batch-items?locationId=${selectedLocation.id}`);
      
      // if (items.content.length > 0) {
      //   addToast({
      //     title: 'Cannot Delete',
      //     message: 'This location has items. Please move or delete them first.',
      //     type: 'error'
      //   });
      //   return;
      // }

      await api.delete(`locations/${selectedLocation.id}`);
      loadPage(currentPage); // Refresh current page
      setIsDeleteModalOpen(false);
      addToast({
        title: 'Success',
        message: 'Location deleted successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error deleting location:', error);
      addToast({
        title: 'Error',
        message: 'Failed to delete location',
        type: 'error'
      });
    }
  };

  const columns: ColumnDef<Location>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-gray-400 mr-2" aria-hidden="true" />
          <span className="text-sm font-medium text-gray-900">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (row) => (
        <span className="text-sm text-gray-500">{row.description || '-'}</span>
      ),
    }
  ];

  const filterConfig: FilterConfig[] = [
    {
      type: 'text',
      key: 'search',
      label: 'Search Locations',
      placeholder: 'Search by name...'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Locations</h1>
          <p className="text-gray-600 mt-1">Manage physical storage locations where items are stored. Add, edit, or remove locations to organize your inventory.</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Location
        </Button>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        config={filterConfig}
      />

      <DataTable
        data={locationsPage?.content || []}
        columns={columns}
        isLoading={isLoading}
        onEdit={(location) => {
          setSelectedLocation(location);
          setFormData({
            name: location.name,
            description: location.description || ''
          });
          setIsEditModalOpen(true);
        }}
        onDelete={(location) => {
          setSelectedLocation(location);
          setIsDeleteModalOpen(true);
        }}
        currentPage={currentPage}
        totalPages={pageInfo?.totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Add/Edit Location Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          resetForm();
        }}
        title={isEditModalOpen ? 'Edit Location' : 'Add New Location'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isEditModalOpen) {
              handleEditLocation();
            } else {
              handleAddLocation();
            }
          }}
          className="space-y-4"
        >
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            required
          />
          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
          />
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditModalOpen ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Location Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedLocation(null);
        }}
        onConfirm={handleDeleteLocation}
        title="Delete Location"
        message="Are you sure you want to delete this location? This action cannot be undone."
        itemName={selectedLocation?.name}
      />
    </div>
  );
};