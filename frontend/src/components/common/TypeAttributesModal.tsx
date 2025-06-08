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

interface TypeAttributesModalProps {
    isOpen: boolean;
    onClose: () => void;
    typeId: string;
    typeName: string;
}

type ModalView = 'list' | 'add' | 'edit';

const DATA_TYPES = [
    { value: 'STRING', label: 'Text' },
    { value: 'NUMBER', label: 'Number' },
    { value: 'BOOLEAN', label: 'Boolean' },
    { value: 'SELECT', label: 'Select from options' },
];

const DefaultValueAndRequiredFields: React.FC<{
    dataType: string;
    options?: string;
    defaultValue: string;
    isRequired: boolean;
    onDefaultValueChange: (value: string) => void;
    onRequiredChange: (checked: boolean) => void;
    disabled?: boolean;
}> = ({ dataType, options, defaultValue, isRequired, onDefaultValueChange, onRequiredChange, disabled }) => (
    <>
        {dataType === 'SELECT' ? (
            <Input
                label="Default Value"
                name="defaultValue"
                value={defaultValue}
                onChange={e => onDefaultValueChange(e.target.value)}
                placeholder={`Enter one of: ${options}`}
                disabled={disabled}
            />
        ) : dataType === 'NUMBER' ? (
            <Input
                type="number"
                label="Default Value"
                name="defaultValue"
                value={defaultValue}
                onChange={e => onDefaultValueChange(e.target.value)}
                placeholder="Enter a number"
                disabled={disabled}
            />
        ) : dataType === 'DATE' ? (
            <Input
                type="date"
                label="Default Value"
                name="defaultValue"
                value={defaultValue}
                onChange={e => onDefaultValueChange(e.target.value)}
                disabled={disabled}
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
                disabled={disabled}
            />
        ) : (
            <Input
                label="Default Value"
                name="defaultValue"
                value={defaultValue}
                onChange={e => onDefaultValueChange(e.target.value)}
                disabled={disabled}
            />
        )}
        <div className="flex items-center gap-2 mt-2">
            <Input
                type="checkbox"
                name="isRequired"
                checked={isRequired}
                onChange={e => onRequiredChange(e.target.checked)}
                id="isRequired"
                className="h-4 w-4 text-[#00859e] focus:ring-[#00859e] border-gray-300 rounded"
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
        isUnique: false,
    });
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            api.get<TypeAttribute[]>(`types/${typeId}/attributes`)
                .then((response) => {
                    console.log('Raw API response:', response);
                    console.log('First item structure:', response.data[0]);
                    setAttributes(response.data);
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
            api.get<Page<Attribute>>('attributes', { params: { page: 0, size: 100 } })
                .then((response) => {
                    setExistingAttributes(response.data.content);
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
        setLoading(true);
        try {
            // Validate default value if we're creating a new attribute
            if (mode === 'new' && form.defaultValue) {
                if (!validateDefaultValue(form.defaultValue, form.dataType, form.options)) {
                    setLoading(false);
                    return;
                }
            }
            // Validate default value if we're linking an existing attribute
            else if (mode === 'existing' && form.defaultValue) {
                const selectedAttr = existingAttributes.find(a => a.id === form.attributeId);
                if (selectedAttr && !validateDefaultValue(form.defaultValue, selectedAttr.dataType, selectedAttr.options)) {
                    setLoading(false);
                    return;
                }
            }

            if (mode === 'new') {
                // Construct payload explicitly to ensure null for empty optional fields
                const payload = {
                    name: form.name,
                    dataType: form.dataType,
                    options: form.options || null, // Send null if options is empty string
                    isRequired: form.isRequired,
                    defaultValue: form.defaultValue || null, // Send null if defaultValue is empty string
                    isUnique: form.isUnique,
                };
                const response = await api.post<TypeAttribute>(`types/${typeId}/attributes`, payload);
                setAttributes(prev => [...prev, response.data]);
            } else {
                // Linking an existing attribute - already sends a constructed object with || null
                const response = await api.post<TypeAttribute>(`types/${typeId}/attributes`, {
                    attributeId: form.attributeId,
                    isRequired: form.isRequired,
                    defaultValue: form.defaultValue || null,
                    isUnique: form.isUnique,
                });
                 setAttributes(prev => [...prev, response.data]);
            }
            setCurrentView('list');
            addToast({
                title: 'Success',
                message: 'Attribute added successfully',
                type: 'success'
            });
        } catch (error) {
            console.error('Error adding attribute:', error);
            addToast({
                title: 'Error',
                message: error instanceof Error ? error.message : 'Failed to add attribute',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAttribute) return;
        setLoading(true);
        try {
            // Validate default value
            if (form.defaultValue && !validateDefaultValue(form.defaultValue, selectedAttribute.dataType, selectedAttribute.options)) {
                setLoading(false);
                return;
            }

            const response = await api.put<TypeAttribute>(`types/${typeId}/attributes/${selectedAttribute.id}`, {
                isRequired: form.isRequired,
                defaultValue: form.defaultValue || null,
                isUnique: form.isUnique,
            });
            setAttributes(prev => prev.map(attr => 
                attr.id === selectedAttribute.id ? response.data : attr
            ));
            setCurrentView('list');
            addToast({
                title: 'Success',
                message: 'Attribute updated successfully',
                type: 'success'
            });
        } catch (error) {
            console.error('Error updating attribute:', error);
            addToast({
                title: 'Error',
                message: error instanceof Error ? error.message : 'Failed to update attribute',
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
            .catch((error) => {
                addToast({ 
                    title: 'Error', 
                    message: error instanceof Error ? error.message : 'Failed to unlink attribute',
                    type: 'error' 
                });
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
                            isUnique: false,
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
                                    isUnique: false,
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
                                                                disabled={form.isUnique}
                                                            />
                                                        );
                                                    })()}
                                                    {form.attributeId && (() => {
                                                        const selectedAttr = existingAttributes.find(a => a.id === form.attributeId);
                                                        if (!selectedAttr) return null;
                                                        return (
                                                            selectedAttr?.dataType !== 'BOOLEAN' && (
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="isUnique"
                                                                        checked={form.isUnique}
                                                                        onChange={(e) => {
                                                                            handleChange(e);
                                                                            if (e.target.checked) {
                                                                                setForm(prev => ({ ...prev, defaultValue: '' }));
                                                                            }
                                                                        }}
                                                                        id="isUniqueExisting"
                                                                    />
                                                                    <label htmlFor="isUniqueExisting">Unique Attribute</label>
                                                                </div>
                                                            )
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
                                        disabled={form.isUnique}
                                    />
                                    {form.dataType !== 'BOOLEAN' && (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="isUnique"
                                                checked={form.isUnique}
                                                onChange={(e) => {
                                                    handleChange(e);
                                                    if (e.target.checked) {
                                                        setForm(prev => ({ ...prev, defaultValue: '' }));
                                                    }
                                                }}
                                                id="isUniqueNew"
                                            />
                                            <label htmlFor="isUniqueNew">Unique Attribute</label>
                                        </div>
                                    )}
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
                        {selectedAttribute?.dataType !== 'BOOLEAN' && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="isUnique"
                                    checked={form.isUnique}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (e.target.checked) {
                                            setForm(prev => ({ ...prev, defaultValue: '' }));
                                        }
                                    }}
                                    id="isUniqueEdit"
                                />
                                <label htmlFor="isUniqueEdit">Unique Attribute</label>
                            </div>
                        )}
                        {selectedAttribute?.dataType === 'SELECT' ? (
                            <Input
                                label="Default Value"
                                name="defaultValue"
                                value={form.defaultValue}
                                onChange={handleChange}
                                placeholder={`Enter one of: ${selectedAttribute.options}`}
                                disabled={form.isUnique}
                            />
                        ) : selectedAttribute?.dataType === 'NUMBER' ? (
                            <Input
                                type="number"
                                label="Default Value"
                                name="defaultValue"
                                value={form.defaultValue}
                                onChange={handleChange}
                                placeholder="Enter a number"
                                disabled={form.isUnique}
                            />
                        ) : selectedAttribute?.dataType === 'DATE' ? (
                            <Input
                                type="date"
                                label="Default Value"
                                name="defaultValue"
                                value={form.defaultValue}
                                onChange={handleChange}
                                disabled={form.isUnique}
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
                                disabled={form.isUnique}
                            />
                        ) : (
                            <Input
                                label="Default Value"
                                name="defaultValue"
                                value={form.defaultValue}
                                onChange={handleChange}
                                disabled={form.isUnique}
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