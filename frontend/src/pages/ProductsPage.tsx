import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { Product, ProductType } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Plus, Package } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import { FilterBar, FilterConfig } from '../components/common/FilterBar';
import { DeleteConfirmationModal } from '../components/common/DeleteConfirmationModal';
import { api } from '../lib/api';
import { usePagination } from '../hooks/usePagination';
import { PageRequest } from '../types/pagination';

export const ProductsPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    typeId: ''
  });
  const debouncedSearch = useDebounce(filters.search, 500);
  const debouncedTypeId = useDebounce(filters.typeId, 500);
  const [formData, setFormData] = useState({
    name: '',
    typeId: '',
    description: '',
  });
  const { addToast } = useToast();

  const fetchProducts = async (pageRequest: PageRequest) => {
    const params = new URLSearchParams();
    
    if (debouncedSearch) {
      params.append('search', debouncedSearch);
    }
    if (debouncedTypeId) {
      params.append('typeId', debouncedTypeId);
    }
    
    const endpoint = `products?${params.toString()}`;
    return api.get<Product>(endpoint, pageRequest);
  };

  const fetchProductTypes = async () => {
    const response = await api.get<ProductType>('types');
    setProductTypes(response.content);
  };

  const {
    data: productsPage,
    loading: isLoading,
    pageInfo,
    currentPage,
    setCurrentPage,
    loadPage
  } = usePagination<Product>({
    fetchData: fetchProducts,
    initialPageSize: 10
  });

  useEffect(() => {
    loadPage(0);
    fetchProductTypes();
  }, []);

  useEffect(() => {
    loadPage(0);
  }, [debouncedSearch, debouncedTypeId]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      typeId: '',
      description: '',
    });
  };

  const handleAddProduct = async () => {
    try {
      if (!formData.name.trim() || !formData.typeId) {
        addToast({
          title: 'Validation Error',
          message: 'Please fill in all required fields',
          type: 'error'
        });
        return;
      }
      await api.post<Product>('products', {
        ...formData,
        description: formData.description ?? ''
      });
      loadPage(0); // Refresh first page
      setIsAddModalOpen(false);
      resetForm();
      addToast({
        title: 'Success',
        message: 'Product created successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error creating product:', error);
      addToast({
        title: 'Error',
        message: 'Failed to create product',
        type: 'error'
      });
    }
  };

  const handleEditProduct = async () => {
    try {
      if (!selectedProduct) return;
      if (!formData.name.trim() || !formData.typeId) {
        addToast({
          title: 'Validation Error',
          message: 'Please fill in all required fields',
          type: 'error'
        });
        return;
      }
      await api.put<Product>(`products/${selectedProduct.id}`, {
        ...formData,
        description: formData.description ?? ''
      });
      loadPage(currentPage); // Refresh current page
      setIsEditModalOpen(false);
      resetForm();
      addToast({
        title: 'Success',
        message: 'Product updated successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating product:', error);
      addToast({
        title: 'Error',
        message: 'Failed to update product',
        type: 'error'
      });
    }
  };

  const handleDeleteProduct = async () => {
    try {
      if (!selectedProduct) return;

      await api.delete(`products/${selectedProduct.id}`);
      loadPage(currentPage); // Refresh current page
      setIsDeleteModalOpen(false);
      addToast({
        title: 'Success',
        message: 'Product deleted successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      addToast({
        title: 'Error',
        message: 'Failed to delete product',
        type: 'error'
      });
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center">
          <Package className="h-5 w-5 text-gray-400 mr-2" aria-hidden="true" />
          <span className="text-sm font-medium text-gray-900">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      accessorKey: 'typeId',
      cell: (row) => {
        const type = productTypes.find(t => t.id === row.typeId);
        return type ? type.name : '-';
      }
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (row) => (
        <span className="text-sm text-gray-500">{row.description || '-'}</span>
      ),
    },
  ];

  const filterConfig: FilterConfig[] = [
    {
      type: 'text',
      key: 'search',
      label: 'Search Products',
      placeholder: 'Search by name...'
    },
    {
      type: 'select',
      key: 'typeId',
      label: 'Product Type',
      placeholder: 'Select a type...',
      options: [
        { value: '', label: 'All Types' },
        ...productTypes.map(type => ({
          value: type.id,
          label: type.name
        }))
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog. Create, update, or remove products and assign them to specific product types for better organization.</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Product
        </Button>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        config={filterConfig}
      />

      <DataTable
        data={productsPage?.content || []}
        columns={columns}
        isLoading={isLoading}
        onEdit={(product) => {
          setSelectedProduct(product);
          setFormData({
            name: product.name,
            typeId: product.typeId,
            description: product.description || '',
          });
          setIsEditModalOpen(true);
        }}
        onDelete={(product) => {
          setSelectedProduct(product);
          setIsDeleteModalOpen(true);
        }}
        currentPage={currentPage}
        totalPages={pageInfo?.totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          resetForm();
        }}
        title={isEditModalOpen ? 'Edit Product' : 'Add New Product'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isEditModalOpen) {
              handleEditProduct();
            } else {
              handleAddProduct();
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
          <Select
            label="Product Type"
            name="typeId"
            value={formData.typeId}
            onChange={(value) => handleSelectChange('typeId', value)}
            options={[
              { value: '', label: 'Select a type...' },
              ...productTypes.map(type => ({
                value: type.id,
                label: type.name
              }))
            ]}
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

      {/* Delete Product Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        itemName={selectedProduct?.name}
      />
    </div>
  );
};