import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { DataTable, ColumnDef } from './DataTable';
import { Attribute, TypeAttribute } from '../../types';
import { api } from '../../lib/api';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useToast } from '../../context/ToastContext';
import { Page } from '../../types/pagination';
import { AxiosError } from 'axios';

interface TypeAttributesModalProps {
    isOpen: boolean;
    onClose: () => void;
    typeId: string;
    typeName: string;
}

type ModalView = 'list' | 'add' | 'edit';

interface AttributePayload {
    attributeId?: string;
    name?: string;
    dataType?: string;
    options?: string;
    isRequired: boolean;
    defaultValue?: string;
    [key: string]: unknown;
}

const DATA_TYPES = [
    { value: 'STRING', label: 'String' },
    { value: 'NUMBER', label: 'Number' },
    { value: 'DATE', label: 'Date' },
    { value: 'BOOLEAN', label: 'Boolean' },
    { value: 'SELECT', label: 'Select (Dropdown)' },
];

const DefaultValueAndRequiredFields: React.FC<{
    dataType: string;
    options?: string;
    defaultValue: string;
    isRequired: boolean;
    onDefaultValueChange: (value: string) => void;
    onRequiredChange: (checked: boolean) => void;
}> = ({ dataType, options, defaultValue, isRequired, onDefaultValueChange, onRequiredChange }) => (
    <>
        {dataType === 'SELECT' ? (
            <Input
                label="Default Value"
                name="defaultValue"
                value={defaultValue}
                onChange={e => onDefaultValueChange(e.target.value)}
                placeholder={`Enter one of: ${options}`}
            />
        ) : dataType === 'NUMBER' ? (
            <Input
                type="number"
                label="Default Value"
                name="defaultValue"
                value={defaultValue}
                onChange={e => onDefaultValueChange(e.target.value)}
                placeholder="Enter a number"
            />
        ) : dataType === 'DATE' ? (
            <Input
                type="date"
                label="Default Value"
                name="defaultValue"
                value={defaultValue}
                onChange={e => onDefaultValueChange(e.target.value)}
            />
        ) : dataType === 'BOOLEAN' ? (
            <Select
                label="Default Value"
                name="defaultValue"
                options={[
                    { value: '', label: 'Select a value...' },
                    { value: 'true', label: 'True' },
                    { value: 'false', label: 'False' }
                ]}
                value={defaultValue}
                onChange={onDefaultValueChange}
            />
        ) : (
            <Input
                label="Default Value"
                name="defaultValue"
                value={defaultValue}
                onChange={e => onDefaultValueChange(e.target.value)}
            />
        )}
        <div className="flex items-center gap-2 mt-2">
            <input
                type="checkbox"
                name="isRequired"
                checked={isRequired}
                onChange={e => onRequiredChange(e.target.checked)}
                id="isRequired"
            />
            <label htmlFor="isRequired">Required</label>
        </div>
    </>
);

export const TypeAttributesModal: React.FC<TypeAttributesModalProps> = ({ isOpen, onClose, typeId, typeName }) => {
    const [attributes, setAttributes] = useState<TypeAttribute[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentView, setCurrentView] = useState<ModalView>('list');
    const [selectedAttribute, setSelectedAttribute] = useState<TypeAttribute | null>(null);
    const [mode, setMode] = useState<'existing' | 'new'>('new');
    const [existingAttributes, setExistingAttributes] = useState<Attribute[]>([]);
    const [form, setForm] = useState({
        attributeId: '',
        name: '',
        dataType: 'STRING',
        options: '',
        isRequired: false,
        defaultValue: '',
    });
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            api.get<TypeAttribute[]>(`types/${typeId}/attributes`)
                .then((data) => {
                    console.log('Raw API response:', data);
                    console.log('First item structure:', data[0]);
                    setAttributes(data);
                })
                .catch((error) => {
                    console.error('Error fetching attributes:', error);
                    setAttributes([]);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [isOpen, typeId]);

    useEffect(() => {
        console.log('Attributes state updated:', attributes);
    }, [attributes]);

    useEffect(() => {
        if (currentView === 'add' && mode === 'existing') {
            setLoading(true);
            api.get<Page<Attribute>>('attributes', { page: 0, size: 100 })
                .then((data) => {
                    setExistingAttributes(data.content);
                })
                .catch((error) => {
                    console.error('Error fetching existing attributes:', error);
                    setExistingAttributes([]);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [currentView, mode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let fieldValue: string | boolean = value;
        if (type === 'checkbox') {
            fieldValue = (e.target as HTMLInputElement).checked;
        }
        setForm((prev) => ({
            ...prev,
            [name]: fieldValue,
        }));
    };

    const validateDefaultValue = (value: string, dataType: string, options?: string): boolean => {
        if (!value.trim()) return true; // Empty values are allowed

        // Only validate SELECT type, others use HTML5 input types
        if (dataType === 'SELECT' && options && !options.split(',').map(opt => opt.trim()).includes(value.trim())) {
            addToast({
                title: 'Invalid Default Value',
                message: `Please select one of the available options: ${options}`,
                type: 'error'
            });
            return false;
        }
        return true;
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate default value if we're creating a new attribute
        if (mode === 'new' && form.defaultValue) {
            if (!validateDefaultValue(form.defaultValue, form.dataType, form.options)) {
                return;
            }
        }
        // Validate default value if we're linking an existing attribute
        else if (mode === 'existing' && form.defaultValue) {
            const selectedAttr = existingAttributes.find(a => a.id === form.attributeId);
            if (selectedAttr && !validateDefaultValue(form.defaultValue, selectedAttr.dataType, selectedAttr.options)) {
                return;
            }
        }

        setLoading(true);
        const payload: AttributePayload = {
            isRequired: form.isRequired,
            defaultValue: form.defaultValue,
        };
        if (mode === 'existing') {
            payload.attributeId = form.attributeId;
        } else {
            payload.name = form.name;
            payload.dataType = form.dataType;
            payload.options = form.dataType === 'SELECT' ? form.options : undefined;
        }
        try {
            const newAttribute = await api.post<TypeAttribute>(`types/${typeId}/attributes`, payload);
            setAttributes(prev => [...prev, newAttribute]);
            setCurrentView('list');
            addToast({ 
                title: 'Success', 
                message: mode === 'existing' ? 'Attribute linked successfully' : 'Attribute created and added successfully', 
                type: 'success' 
            });
        } catch (error: unknown) {
            console.error('Error adding/linking attribute:', error);
            const errorMessage = error instanceof AxiosError 
                ? error.response?.data?.message || 'Failed to add/link attribute'
                : 'Failed to add/link attribute';
            addToast({ 
                title: 'Error', 
                message: errorMessage,
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAttribute) return;

        // Validate default value
        if (form.defaultValue && !validateDefaultValue(form.defaultValue, selectedAttribute.dataType, selectedAttribute.options)) {
            return;
        }

        setLoading(true);
        try {
            const updatedAttribute = await api.put<TypeAttribute>(`types/${typeId}/attributes/${selectedAttribute.id}`, {
                isRequired: form.isRequired,
                defaultValue: form.defaultValue,
            });
            setAttributes(prev => prev.map(a => a.id === selectedAttribute.id ? updatedAttribute : a));
            setCurrentView('list');
            addToast({ title: 'Success', message: 'Attribute settings updated successfully', type: 'success' });
        } catch (error: unknown) {
            console.error('Error updating attribute settings:', error);
            const errorMessage = error instanceof AxiosError
                ? error.response?.data?.message || 'Failed to update attribute settings'
                : 'Failed to update attribute settings';
            addToast({ 
                title: 'Error', 
                message: errorMessage,
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUnlinkAttribute = (attr: TypeAttribute) => {
        setLoading(true);
        api.delete(`types/${typeId}/attributes/${attr.id}`)
            .then(() => {
                setAttributes((prev) => prev.filter((a) => a.id !== attr.id));
                addToast({ title: 'Success', message: 'Attribute unlinked successfully', type: 'success' });
            })
            .catch(() => {
                addToast({ title: 'Error', message: 'Failed to unlink attribute', type: 'error' });
            })
            .finally(() => setLoading(false));
    };

    const columns: ColumnDef<TypeAttribute>[] = [
        {
            header: 'Name',
            accessorKey: 'name',
            cell: (row) => row.name,
        },
        {
            header: 'Data Type',
            accessorKey: 'dataType',
            cell: (row) => row.dataType,
        },
        {
            header: 'Required',
            accessorKey: 'isRequired',
            cell: (row) => (row.isRequired ? 'Yes' : 'No'),
        },
        {
            header: 'Default Value',
            accessorKey: 'defaultValue',
            cell: (row) => row.defaultValue || '-',
        },
        {
            header: 'Options',
            accessorKey: 'options',
            cell: (row) => row.options || '-',
        },
        {
            header: 'Actions',
            accessorKey: 'id',
            cell: (row) => (
                <div className="flex gap-2">
                    <Button size="sm" onClick={() => {
                        setSelectedAttribute(row);
                        setForm({
                            attributeId: '',
                            name: '',
                            dataType: 'STRING',
                            options: '',
                            isRequired: row.isRequired,
                            defaultValue: row.defaultValue || '',
                        });
                        setCurrentView('edit');
                    }}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => handleUnlinkAttribute(row)}>Unlink</Button>
                </div>
            ),
        },
    ];

    const renderContent = () => {
        switch (currentView) {
            case 'list':
                return (
                    <>
                        <div className="mb-4 flex justify-end">
                            <Button onClick={() => {
                                setCurrentView('add');
                                setMode('new');
                                setForm({
                                    attributeId: '',
                                    name: '',
                                    dataType: 'STRING',
                                    options: '',
                                    isRequired: false,
                                    defaultValue: '',
                                });
                            }}>Add/Link Attribute</Button>
                        </div>
                        <div className="w-full overflow-x-auto">
                            <DataTable columns={columns} data={attributes} isLoading={loading} />
                        </div>
                    </>
                );
            case 'add':
                return (
                    <form onSubmit={handleAddSubmit} className="space-y-4 w-full">
                        <div className="mb-4 flex gap-2">
                            <Button
                                variant={mode === 'new' ? 'primary' : 'outline'}
                                onClick={() => setMode('new')}
                                type="button"
                                className="flex-1"
                            >
                                New Attribute
                            </Button>
                            <Button
                                variant={mode === 'existing' ? 'primary' : 'outline'}
                                onClick={() => setMode('existing')}
                                type="button"
                                className="flex-1"
                            >
                                Link Existing
                            </Button>
                        </div>
                        <div className="min-h-[200px]">
                            {mode === 'existing' ? (
                                <div className="space-y-4">
                                    {existingAttributes.filter(attr => !attributes.some(linkedAttr => linkedAttr.id === attr.id)).length === 0 ? (
                                        <div className="text-center text-gray-500 py-2 text-sm">
                                            No available attributes found.
                                        </div>
                                    ) : (
                                        <>
                                            <Select
                                                label="Select Attribute"
                                                name="attributeId"
                                                options={[
                                                    { value: '', label: 'Select an attribute...' },
                                                    ...existingAttributes
                                                        .filter(attr => !attributes.some(linkedAttr => linkedAttr.id === attr.id))
                                                        .map(a => ({ 
                                                            value: a.id, 
                                                            label: `${a.name} (${a.dataType}${a.options ? ` - Options: ${a.options}` : ''})` 
                                                        }))
                                                ]}
                                                value={form.attributeId}
                                                onChange={val => {
                                                    setForm(prev => ({ 
                                                        ...prev, 
                                                        attributeId: val,
                                                        defaultValue: '' // Reset default value when changing attribute
                                                    }));
                                                }}
                                                required
                                            />
                                                    {form.attributeId && (
                                                        <div className="bg-gray-50 p-4 rounded-md text-sm">
                                                            <h4 className="font-medium mb-2">Attribute Details</h4>
                                                            {(() => {
                                                                const selectedAttr = existingAttributes.find(a => a.id === form.attributeId);
                                                                if (!selectedAttr) return null;
                                                                return (
                                                                    <div className="space-y-1">
                                                                        <p><span className="font-medium">Data Type:</span> {selectedAttr.dataType}</p>
                                                                        {selectedAttr.options && (
                                                                            <p><span className="font-medium">Options:</span> {selectedAttr.options}</p>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}
                                                    {form.attributeId && (() => {
                                                        const selectedAttr = existingAttributes.find(a => a.id === form.attributeId);
                                                        if (!selectedAttr) return null;
                                                        return (
                                                            <DefaultValueAndRequiredFields
                                                                dataType={selectedAttr.dataType}
                                                                options={selectedAttr.options}
                                                                defaultValue={form.defaultValue}
                                                                isRequired={form.isRequired}
                                                                onDefaultValueChange={val => setForm(prev => ({ ...prev, defaultValue: val }))}
                                                                onRequiredChange={checked => setForm(prev => ({ ...prev, isRequired: checked }))}
                                                            />
                                                        );
                                                    })()}
                                        </>
                                    )}
                                    <div className="h-[120px]" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
                                    <Select
                                        label="Data Type"
                                        name="dataType"
                                        options={DATA_TYPES}
                                        value={form.dataType}
                                        onChange={val => setForm(prev => ({ ...prev, dataType: val }))}
                                        required
                                    />
                                    {form.dataType === 'SELECT' && (
                                        <Input
                                            label="Options (comma-separated)"
                                            name="options"
                                            value={form.options}
                                            onChange={handleChange}
                                            required
                                        />
                                    )}
                                    <DefaultValueAndRequiredFields
                                        dataType={form.dataType}
                                        options={form.options}
                                        defaultValue={form.defaultValue}
                                        isRequired={form.isRequired}
                                        onDefaultValueChange={val => setForm(prev => ({ ...prev, defaultValue: val }))}
                                        onRequiredChange={checked => setForm(prev => ({ ...prev, isRequired: checked }))}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCurrentView('list')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={loading}
                                disabled={loading}
                            >
                                Add
                            </Button>
                        </div>
                    </form>
                );
            case 'edit':
                return (
                    <form onSubmit={handleEditSubmit} className="space-y-4 w-full">
                        <div className="bg-gray-50 p-4 rounded-md text-sm mb-4">
                            <h4 className="font-medium mb-2">Attribute Details</h4>
                            <div className="space-y-1">
                                <p><span className="font-medium">Name:</span> {selectedAttribute?.name}</p>
                                <p><span className="font-medium">Data Type:</span> {selectedAttribute?.dataType}</p>
                                {selectedAttribute?.options && (
                                    <p><span className="font-medium">Options:</span> {selectedAttribute.options}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="isRequired"
                                checked={form.isRequired}
                                onChange={handleChange}
                                id="isRequired"
                            />
                            <label htmlFor="isRequired">Required</label>
                        </div>
                        {selectedAttribute?.dataType === 'SELECT' ? (
                            <Input
                                label="Default Value"
                                name="defaultValue"
                                value={form.defaultValue}
                                onChange={handleChange}
                                placeholder={`Enter one of: ${selectedAttribute.options}`}
                            />
                        ) : selectedAttribute?.dataType === 'NUMBER' ? (
                            <Input
                                type="number"
                                label="Default Value"
                                name="defaultValue"
                                value={form.defaultValue}
                                onChange={handleChange}
                                placeholder="Enter a number"
                            />
                        ) : selectedAttribute?.dataType === 'DATE' ? (
                            <Input
                                type="date"
                                label="Default Value"
                                name="defaultValue"
                                value={form.defaultValue}
                                onChange={handleChange}
                            />
                        ) : selectedAttribute?.dataType === 'BOOLEAN' ? (
                            <Select
                                label="Default Value"
                                name="defaultValue"
                                options={[
                                    { value: '', label: 'Select a value...' },
                                    { value: 'true', label: 'True' },
                                    { value: 'false', label: 'False' }
                                ]}
                                value={form.defaultValue}
                                onChange={val => setForm(prev => ({ ...prev, defaultValue: val }))}
                            />
                        ) : (
                            <Input
                                label="Default Value"
                                name="defaultValue"
                                value={form.defaultValue}
                                onChange={handleChange}
                            />
                        )}
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCurrentView('list')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={loading}
                                disabled={loading}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                );
        }
    };

    const getModalTitle = () => {
        switch (currentView) {
            case 'list':
                return `Manage Attributes - ${typeName}`;
            case 'add':
                return `Add or Link Attribute - ${typeName}`;
            case 'edit':
                return `Edit Attribute Settings - ${typeName}`;
        }
    };

    return (
        <Modal
            maxHeight="90vh"
            maxWidth={currentView === 'list' ? '4xl' : 'md'}
            isOpen={isOpen}
            onClose={() => {
                setCurrentView('list');
                onClose();
            }}
            title={getModalTitle()}
        >
            {renderContent()}
        </Modal>
    );
}; 