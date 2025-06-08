import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import { Modal } from './Modal';
import { api } from '../../lib/api';
import { ItemAttributeEditor, ValidationError, ItemAttributeEditorRef } from './ItemAttributeEditor';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../../context/ToastContext';

interface InventoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'move' | 'receive' | 'adjust';
  onSubmit: (data: any) => void;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({ isOpen, onClose, type, onSubmit }) => {
  const [form, setForm] = useState({
    product: '',
    lot: '',
    newLot: '',
    fromLocation: '',
    toLocation: '',
    quantity: 1,
    notes: '',
    selectedItems: [] as string[],
    items: [] as Record<string, string>[],
  });

  // State for product change confirmation
  const [showProductChangeConfirm, setShowProductChangeConfirm] = useState(false);
  const [pendingProductChange, setPendingProductChange] = useState<string | null>(null);

  // Local state for quantity input to debounce updates
  const [localQuantity, setLocalQuantity] = useState(form.quantity);
  const debouncedQuantity = useDebounce(localQuantity, 300);

  // Constants
  const MAX_QUANTITY = 1000;

  // State for attribute customization UI
  const [showAttributeCustomization, setShowAttributeCustomization] = useState(false);
  const [attributeErrors, setAttributeErrors] = useState<ValidationError[]>([]);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const { addToast } = useToast();

  // Ref for ItemAttributeEditor
  const itemAttributeEditorRef = useRef<ItemAttributeEditorRef>(null);

  // Callback for ItemAttributeEditor to update form.items
  const handleItemsChange = useCallback((items: Record<string, string>[]) => {
    setForm(prev => ({ ...prev, items }));
  }, []);

  // API data
  const [products, setProducts] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [typeAttributes, setTypeAttributes] = useState<any[]>([]);

  // Fetch base data on mount
  useEffect(() => {
    if (isOpen) {
      api.get('/products').then(res => setProducts(Array.isArray(res.data) ? res.data : res.data.content || [])).catch(() => setProducts([]));
      api.get('/lots').then(res => setLots(Array.isArray(res.data) ? res.data : res.data.content || [])).catch(() => setLots([]));
      api.get('/locations').then(res => setLocations(Array.isArray(res.data) ? res.data : res.data.content || [])).catch(() => setLocations([]));
      api.get('/items').then(res => setItems(Array.isArray(res.data) ? res.data : res.data.content || [])).catch(() => setItems([]));
    }
  }, [isOpen]);

  // Fetch type attributes when product changes
  useEffect(() => {
    if (!form.product) {
      setTypeAttributes([]);
      return;
    }
    const selectedProduct = products.find(p => p.id === form.product);
    if (!selectedProduct) return;

    api.get(`/types/${selectedProduct.typeId}/attributes`)
      .then(res => {
        const typeAttrsData = Array.isArray(res.data) ? res.data : res.data.content || [];
        setTypeAttributes(typeAttrsData);
      })
      .catch(() => {
        setTypeAttributes([]);
      });
  }, [form.product, products]);

  // Find selected product
  const selectedProduct = useMemo(() => products.find(p => p.id === form.product), [form.product, products]);

  // Find if any attribute is unique
  const hasUniqueAttribute = useMemo(() => {
    return typeAttributes.some(attr => attr.isUnique);
  }, [typeAttributes]);

  // Filter lots by selected product
  const filteredLots = form.product
    ? lots.filter(lot => lot.product_id === form.product).map(lot => ({ value: lot.id, label: lot.lot_number, productId: lot.product_id }))
    : [];

  // Filter items by product, lot, and location
  const filteredItems = useMemo(() => {
    if (!form.product || !form.lot || !(type === 'move' || type === 'adjust')) return [];
    const locationId = type === 'move' ? form.fromLocation : form.toLocation;
    return items.filter(
      item =>
        item.product_id === form.product &&
        item.lot_id === form.lot &&
        item.location_id === locationId
    );
  }, [form.product, form.lot, form.fromLocation, form.toLocation, type, items]);

  const handleScrollToFirstError = useCallback(() => {
    if (itemAttributeEditorRef.current && attributeErrors.length > 0) {
      itemAttributeEditorRef.current.scrollToError(attributeErrors[0]);
    }
  }, [attributeErrors]);

  const handleChange = (name: string, value: string | string[] | number) => {
    if (name === 'product') {
      if (form.product) {
        setPendingProductChange(value as string);
        setShowProductChangeConfirm(true);
      } else {
        setForm(prev => ({ ...prev, product: value as string, lot: '', newLot: '', selectedItems: [], quantity: 1 }));
        setShowAttributeCustomization(false);
      }
    } else if (name === 'quantity') {
      setLocalQuantity(value as number);
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    if (name === 'product') {
      setIsFormSubmitted(false);
    }
  };

  const handleItemSelect = (itemId: string) => {
    setForm(prev => {
      const selected = prev.selectedItems.includes(itemId)
        ? prev.selectedItems.filter(id => id !== itemId)
        : [...prev.selectedItems, itemId];
      return { ...prev, selectedItems: selected };
    });
  };

  const confirmProductChange = () => {
    if (pendingProductChange !== null) {
      setForm(prev => ({ 
        ...prev, 
        product: pendingProductChange, 
        lot: '', 
        newLot: '', 
        selectedItems: [], 
        quantity: 1 
      }));
      setShowAttributeCustomization(false);
    }
    setShowProductChangeConfirm(false);
    setPendingProductChange(null);
  };

  const cancelProductChange = () => {
    setShowProductChangeConfirm(false);
    setPendingProductChange(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitted(true);

    if (attributeErrors.length > 0 && showAttributeCustomization) {
      addToast({
        title: 'Validation Error',
        message: 'Please fix the item attribute errors before submitting.',
        type: 'error',
      });
      handleScrollToFirstError();
      return;
    }

    const baseData = {
      type,
      productId: form.product,
      notes: form.notes,
      lotId: form.lot || null,
      newLotCode: form.newLot || null,
      fromLocation: type === 'move' ? form.fromLocation : (type === 'receive' ? 'Supplier' : null),
      toLocation: (type === 'move' || type === 'receive' || type === 'adjust') ? form.toLocation : null,
    };

    let submissionData;

    if (type === 'receive' && showAttributeCustomization) {
      submissionData = {
        ...baseData,
        items: form.items.map((itemData: Record<string, string>, index: number) => ({
          tempId: `item-${index + 1}`,
          locationId: baseData.toLocation,
          attributeValues: Object.keys(itemData).map(attributeId => ({
            attributeId: attributeId,
            value: itemData[attributeId]
          }))
        })),
        quantity: form.items.length
      };
    } else if (type === 'receive' && !showAttributeCustomization) {
      submissionData = {
        ...baseData,
        quantity: form.quantity,
      };
    } else if (type === 'move' || type === 'adjust') {
      submissionData = {
        ...baseData,
        quantity: form.quantity,
        selectedItems: form.selectedItems,
      };
    }

    onSubmit(submissionData);
  };

  // Map products and locations to Select options
  const productOptions = products.map(p => ({ value: p.id, label: p.name, type_id: p.type_id }));
  const locationOptions = locations.map(l => ({ value: l.id, label: l.name }));

  // Update form.quantity when debouncedQuantity changes
  useEffect(() => {
    if (debouncedQuantity !== form.quantity) {
      setForm(prev => ({ ...prev, quantity: debouncedQuantity }));
    }
  }, [debouncedQuantity, form.quantity]);

  const handleCloseModal = () => {
    onClose();
    setIsFormSubmitted(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title={`${type.charAt(0).toUpperCase() + type.slice(1)} Items`}
      maxWidth={showAttributeCustomization ? '4xl' : 'md'}
      maxHeight="95vh"
    >
      <div className={showAttributeCustomization ? "flex flex-col lg:flex-row gap-6 h-full" : "flex flex-col gap-4"}>
        {/* Left Panel: Main Form Fields */}
        <div className={showAttributeCustomization ? "w-full lg:w-2/5 flex-shrink-0" : "w-full"}>
          <form onSubmit={handleSubmit} className="space-y-4 h-full flex flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto">
              {/* Product Selection */}
              <Select
                label="Product"
                value={form.product}
                onChange={(v) => handleChange('product', v)}
                options={productOptions}
                required
                placeholder="Select a product..."
                fullWidth
              />

              {/* Display Product Type Attributes */}
              {type === 'receive' && selectedProduct && typeAttributes.length > 0 && (
                <div className="border rounded-md p-3 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Product Attributes:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {typeAttributes.map(attr => (
                      <li key={attr.id} className="truncate">
                        <span className="font-semibold">
                          {attr.name}
                          {attr.isRequired && <span className="text-red-500">*</span>}
                          {attr.isUnique && <span className="text-blue-500 ml-1">(Unique)</span>}:
                        </span>
                        <span className="ml-1">{attr.defaultValue || '(No default)'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lot Selection */}
              {type === 'receive' ? (
                <>
                  <Select
                    label="Select Existing Lot (optional)"
                    value={form.lot}
                    onChange={(v) => handleChange('lot', v)}
                    options={filteredLots}
                    disabled={!form.product}
                    placeholder="Select a lot..."
                    fullWidth
                  />
                  <Input
                    type="text"
                    label="Or Enter New Lot Code"
                    value={form.newLot}
                    onChange={(e) => handleChange('newLot', e.target.value)}
                    placeholder="e.g. LOT-123"
                    disabled={!form.product}
                    fullWidth
                  />
                </>
              ) : (
                <Select
                  label="Lot"
                  value={form.lot}
                  onChange={(v) => handleChange('lot', v)}
                  options={filteredLots}
                  required
                  disabled={!form.product}
                  placeholder="Select a lot..."
                  fullWidth
                />
              )}

              {/* Location Selection */}
              {type === 'move' && (
                <>
                  <Select
                    label="From Location"
                    value={form.fromLocation}
                    onChange={(v) => handleChange('fromLocation', v)}
                    options={locationOptions}
                    required
                    placeholder="Select a location..."
                    fullWidth
                  />
                  <Select
                    label="To Location"
                    value={form.toLocation}
                    onChange={(v) => handleChange('toLocation', v)}
                    options={locationOptions}
                    required
                    placeholder="Select a location..."
                    fullWidth
                  />
                </>
              )}
              {(type === 'receive' || type === 'adjust') && (
                <Select
                  label={type === 'receive' ? 'To Location' : 'Location'}
                  value={form.toLocation}
                  onChange={(v) => handleChange('toLocation', v)}
                  options={locationOptions}
                  required
                  placeholder="Select a location..."
                  fullWidth
                />
              )}

              {/* Item selection for serialized products */}
              {(type === 'move' || type === 'adjust') && hasUniqueAttribute && form.product && form.lot && ((type === 'move' && form.fromLocation) || (type === 'adjust' && form.toLocation)) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Items</label>
                  <div className="border rounded p-2 max-h-48 overflow-y-auto">
                    {filteredItems.length === 0 && <div className="text-gray-500 text-sm">No items found for this selection.</div>}
                    {filteredItems.map(item => (
                      <label key={item.id} className="flex items-center gap-2 py-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.selectedItems.includes(item.id)}
                          onChange={() => handleItemSelect(item.id)}
                        />
                        <span className="text-sm truncate">Item {item.id}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity input */}
              <Input
                type="number"
                label="Quantity"
                min="1"
                max={MAX_QUANTITY}
                value={localQuantity}
                onChange={(e) => {
                  const value = Math.min(Math.max(1, parseInt(e.target.value) || 1), MAX_QUANTITY);
                  handleChange('quantity', value);
                }}
                helperText={form.quantity === MAX_QUANTITY ? 'Maximum quantity reached.' : undefined}
                helperTextColor={form.quantity === MAX_QUANTITY ? 'text-red-600' : undefined}
                fullWidth
              />

              {/* Option to Customize Attributes */}
              {type === 'receive' && typeAttributes.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Input
                      type="checkbox"
                      id="customizeAttributesCheckbox"
                      checked={showAttributeCustomization}
                      onChange={(e) => setShowAttributeCustomization(e.target.checked)}
                      className="h-4 w-4 text-[#00859e] focus:ring-[#00859e] border-gray-300 rounded"
                    />
                    <label htmlFor="customizeAttributesCheckbox" className="ml-2 block text-sm text-gray-900">
                      Customize Item Attributes
                    </label>
                  </div>
                  {attributeErrors.length > 0 && (
                    <div
                      className="flex items-center gap-1 text-red-600 cursor-pointer text-xs font-semibold"
                      onClick={handleScrollToFirstError}
                      title={`Click to view ${attributeErrors.length} validation error(s)`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M9.401 3.003c1.155-2.057 4.043-2.057 5.198 0 .584 1.037.584 2.24 0 3.277-1.155 2.057-4.043-2.057-5.198 0-.584-1.037-.584-2.24 0-3.277ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M15.75 1.5A.75.75 0 0 0 15 2.25V5.25A.75.75 0 0 0 15.75 6h.75a.75.75 0 0 0 .75-.75V2.25A.75.75 0 0 0 16.5 1.5h-.75ZM7.5 1.5A.75.75 0 0 0 6.75 2.25V5.25A.75.75 0 0 0 7.5 6h.75A.75.75 0 0 0 9 5.25V2.25A.75.75 0 0 0 8.25 1.5h-.75ZM12 16.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" clipRule="evenodd" />
                        <path d="M8.25 18a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5Z" />
                      </svg>
                      <span className="ml-1">{attributeErrors.length} Error{attributeErrors.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Notes field */}
              <Input
                type="text"
                label="Notes"
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                fullWidth
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {type === 'move' ? 'Move Stock' : type === 'receive' ? 'Receive Items' : 'Adjust Stock'}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Panel: Attribute customization section */}
        {type === 'receive' && showAttributeCustomization && typeAttributes.length > 0 && (
          <div className="w-full lg:w-3/5 flex-1 min-h-0">
            <ItemAttributeEditor
              ref={itemAttributeEditorRef}
              typeAttributes={typeAttributes}
              quantity={form.quantity}
              onItemsChange={handleItemsChange}
              onValidationErrorsChange={setAttributeErrors}
              isFormSubmitted={isFormSubmitted}
            />
          </div>
        )}
      </div>

      {/* Product Change Confirmation Modal */}
      <Modal
        isOpen={showProductChangeConfirm}
        onClose={cancelProductChange}
        title="Confirm Product Change"
        isNested={true}
      >
        <div className="py-4">
          <p className="text-gray-700">
            Changing the product will reset any modifications you have made to this form and item attributes.
          </p>
          <p className="text-red-600 font-semibold mt-2">
            Are you sure you want to proceed?
          </p>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={cancelProductChange}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={confirmProductChange}
          >
            Confirm Change
          </Button>
        </div>
      </Modal>
    </Modal>
  );
};