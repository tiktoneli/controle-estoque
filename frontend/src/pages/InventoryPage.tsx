import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import { FilterBar, FilterConfig } from '../components/common/FilterBar';
import { InventoryForm } from '../components/ui/InventoryForm';
import { useToast } from '../context/ToastContext';

// Temporary mock fetch function (replace with real API calls)
const fetchInventoryMovements = async () => {
    return [
        {
            id: '1',
            date: '2024-06-01',
            product: 'Widget A',
            quantity: 10,
            movementType: 'RECEIVE',
            fromLocation: '',
            toLocation: 'Warehouse 1',
            user: 'Alice',
            notes: 'Initial stock',
        },
        {
            id: '2',
            date: '2024-06-02',
            product: 'Widget A',
            quantity: 2,
            movementType: 'MOVE',
            fromLocation: 'Warehouse 1',
            toLocation: 'Storefront',
            user: 'Bob',
            notes: '',
        },
    ];
};

const filterConfig: FilterConfig[] = [
    { type: 'text', key: 'search', label: 'Search', placeholder: 'Product, user, notes...' },
    {
        type: 'select', key: 'movementType', label: 'Type', options: [
            { value: '', label: 'All Types' },
            { value: 'RECEIVE', label: 'Receive' },
            { value: 'MOVE', label: 'Move' },
            { value: 'ADJUST', label: 'Adjust' },
        ]
    },
    // TODO: Add more filters for location, product, etc.
];

const columns: ColumnDef<any>[] = [
    { header: 'Date', accessorKey: 'date' },
    { header: 'Product', accessorKey: 'product' },
    { header: 'Quantity', accessorKey: 'quantity' },
    { header: 'Type', accessorKey: 'movementType' },
    { header: 'From', accessorKey: 'fromLocation' },
    { header: 'To', accessorKey: 'toLocation' },
    { header: 'User', accessorKey: 'user' },
    { header: 'Notes', accessorKey: 'notes' },
];

const InventoryPage: React.FC = () => {
    const [movements, setMovements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', movementType: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'move' | 'receive' | 'adjust' | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        const loadMovements = async () => {
            setLoading(true);
            const data = await fetchInventoryMovements();
            setMovements(data);
            setLoading(false);
        };
        loadMovements();
    }, []);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        // TODO: Trigger filtered fetch
    };

    const handleOpenModal = (type: 'move' | 'receive' | 'adjust') => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalType(null);
    };

    const handleFormSubmit = async (data: any) => {
        // TODO: Integrate with backend or mock API
        console.log('Submitting form data:', data);
        // For now, just close the modal
        // handleCloseModal(); // Keep modal open to show loading/feedback

        try {
            // Assuming your backend has an endpoint like /api/inventory/movements
            // You might need different endpoints based on the movement type (receive, move, adjust)
            // Let's use a placeholder for now:

            // Placeholder API call - replace with your actual backend call
            // Example: await api.post('/inventory/movements', data);

            // Simulate API call for now
            console.log("Simulating API call...");
             // Check if the API call should succeed or fail for testing (optional)
            // const simulatedError = data.productId === 'error-product'; // Example condition for failure
            // if (simulatedError) {
            //     throw new Error('Simulated API error');
            // }

             // Simulate a delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            addToast({
                title: 'Success',
                message: `${data.type} movement recorded successfully!`,
                type: 'success',
            });

            // TODO: Refresh the inventory movements table after successful submission
            // loadMovements(); // You'll need to make loadMovements accessible or call it here

            // handleCloseModal(); //

        } catch (error) {
            console.error('API submission error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during submission.';
            addToast({
                title: 'Error',
                message: errorMessage,
                type: 'error',
            });
            // Keep modal open on error to allow user to correct input (optional)
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Inventory Movements</h1>
                    <p className="text-gray-600 mt-1">Manage your inventory movements. Search, filter, and record stock changes for better tracking.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="primary" onClick={() => handleOpenModal('move')}>
                        Move Stock
                    </Button>
                    <Button variant="secondary" onClick={() => handleOpenModal('receive')}>
                        Receive Items
                    </Button>
                    <Button variant="outline" onClick={() => handleOpenModal('adjust')}>
                        Adjust Stock
                    </Button>
                </div>
            </div>
            <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                config={filterConfig}
            />
            <DataTable
                data={movements}
                columns={columns}
                isLoading={loading}
                emptyMessage="No inventory movements found."
            />
            {modalType && (
                <InventoryForm
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    type={modalType}
                    onSubmit={handleFormSubmit}
                />
            )}
        </div>
    );
};

export default InventoryPage; 