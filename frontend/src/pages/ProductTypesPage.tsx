import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { ProductType } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Tag } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import { FilterBar, FilterConfig } from '../components/common/FilterBar';
import { DeleteConfirmationModal } from '../components/common/DeleteConfirmationModal';
import { api } from '../lib/api';
import { usePagination } from '../hooks/usePagination';
import { PageRequest } from '../types/pagination';
import { TypeAttributesModal } from '../components/common/TypeAttributesModal';
import { Page } from '../types/pagination';
import { Product } from '../types';

export const ProductTypesPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState<ProductType | null>(null);
  const [filters, setFilters] = useState({
    search: '',
  });
  const debouncedSearch = useDebounce(filters.search, 500);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const { addToast } = useToast();
  const [isAttributesModalOpen, setIsAttributesModalOpen] = useState(false);
  const [attributesTypeId, setAttributesTypeId] = useState<string | null>(null);
  const [attributesTypeName, setAttributesTypeName] = useState<string>('');

  const fetchProductTypes = async (pageRequest: PageRequest) => {
    const params = new URLSearchParams();

    if (debouncedSearch) {
      params.append('search', debouncedSearch);
    }

    const endpoint = `types?${params.toString()}`;
    const response = await api.get<Page<ProductType>>(endpoint, { params: pageRequest });
    return response.data;
  };

  const {
    data: productTypesPage,
    loading: isLoading,
    pageInfo,
    currentPage,
    setCurrentPage,
    loadPage
  } = usePagination<ProductType>({
    fetchData: fetchProductTypes,
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
      description: '',
    });
  };

  const handleAddProductType = async () => {
    try {
      if (!formData.name.trim()) {
        addToast({
          title: 'Validation Error',
          message: 'Product type name is required',
          type: 'error'
        });
        return;
      }
      if (formData.name.trim().length < 2 || formData.name.trim().length > 255) {
        addToast({
          title: 'Validation Error',
          message: 'Product type name must be between 2 and 255 characters.',
          type: 'error'
        });
        return;
      }

      await api.post<ProductType>('types', formData);
      loadPage(0); // Refresh first page
      setIsAddModalOpen(false);
      resetForm();
      addToast({
        title: 'Success',
        message: 'Product type created successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error creating product type:', error);
      addToast({
        title: 'Error',
        message: 'Failed to create product type',
        type: 'error'
      });
    }
  };

  const handleEditProductType = async () => {
    try {
      if (!selectedProductType) return;

      if (!formData.name.trim()) {
        addToast({
          title: 'Validation Error',
          message: 'Product type name is required',
          type: 'error'
        });
        return;
      }
      if (formData.name.trim().length < 2 || formData.name.trim().length > 255) {
        addToast({
          title: 'Validation Error',
          message: 'Product type name must be between 2 and 255 characters.',
          type: 'error'
        });
        return;
      }
      console.log(formData);
      await api.put<ProductType>(`types/${selectedProductType.id}`, formData);
      loadPage(currentPage); // Refresh current page
      setIsEditModalOpen(false);
      resetForm();
      addToast({
        title: 'Success',
        message: 'Product type updated successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating product type:', error);
      addToast({
        title: 'Error',
        message: 'Failed to update product type',
        type: 'error'
      });
    }
  };

  const handleDeleteProductType = async () => {
    try {
      if (!selectedProductType) return;

      // Check for existing products
      const response = await api.get<Page<Product>>(`products?typeId=${selectedProductType.id}`);
      const products = response.data;

      if (products.content.length > 0) {
        addToast({
          title: 'Cannot Delete',
          message: 'This product type has associated products. Please delete them first.',
          type: 'error'
        });
        return;
      }

      await api.delete(`types/${selectedProductType.id}`);
      loadPage(currentPage); // Refresh current page
      setIsDeleteModalOpen(false);
      addToast({
        title: 'Success',
        message: 'Product type deleted successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error deleting product type:', error);
      addToast({
        title: 'Error',
        message: 'Failed to delete product type',
        type: 'error'
      });
    }
  };

  const columns: ColumnDef<ProductType>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center">
          <Tag className="h-5 w-5 text-gray-400 mr-2" aria-hidden="true" />
          <span className="text-sm font-medium text-gray-900">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Description',
      accessorKey: 'description',
      className: 'w-1/3 text-center',
      cell: (row) => (
        <span className="text-sm text-gray-500 text-center w-full block">{row.description || '-'}</span>
      ),
    },
  ];

  const filterConfig: FilterConfig[] = [
    {
      type: 'text',
      key: 'search',
      label: 'Search Product Types',
      placeholder: 'Search by name...'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Product Types</h1>
          <p className="text-gray-600 mt-1">Create and manage product categories. Product types help you organize and classify your products into meaningful groups.</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Product Type
        </Button>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        config={filterConfig}
      />

      <DataTable
        data={productTypesPage?.content || []}
        columns={columns}
        isLoading={isLoading}
        onEdit={(productType) => {
          setSelectedProductType(productType);
          setFormData({
            name: productType.name,
            description: productType.description || '',
          });
          setIsEditModalOpen(true);
        }}
        onDelete={(productType) => {
          setSelectedProductType(productType);
          setIsDeleteModalOpen(true);
        }}
        actions={(productType) => (
          <Button size="sm" variant="outline" onClick={() => {
            setAttributesTypeId(productType.id);
            setAttributesTypeName(productType.name);
            setIsAttributesModalOpen(true);
          }}>Manage Attributes</Button>
        )}
        currentPage={currentPage}
        totalPages={pageInfo?.totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Add/Edit Product Type Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          resetForm();
        }}
        title={isEditModalOpen ? 'Edit Product Type' : 'Add New Product Type'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isEditModalOpen) {
              handleEditProductType();
            } else {
              handleAddProductType();
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

      {/* Delete Product Type Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProductType(null);
        }}
        onConfirm={handleDeleteProductType}
        title="Delete Product Type"
        message="Are you sure you want to delete this product type? This action cannot be undone."
        itemName={selectedProductType?.name}
      />

      {attributesTypeId && (
        <TypeAttributesModal
          isOpen={isAttributesModalOpen}
          onClose={() => setIsAttributesModalOpen(false)}
          typeId={attributesTypeId}
          typeName={attributesTypeName}
        />
      )}
    </div>
  );
};