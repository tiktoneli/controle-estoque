import React, { useState, useEffect, useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Input } from './Input';
import { Select } from './Select';
import { useToast } from '../../context/ToastContext';
import { Modal } from './Modal';
import { Button } from './Button';
import { useDebounce } from '../../hooks/useDebounce';

// New interface for validation errors
export interface ValidationError {
  itemIndex: number;
  attributeId: string;
  message: string;
  type: 'required' | 'unique' | 'dataType';
}

interface TypeAttribute {
  id: string;
  name: string;
  dataType: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'JSON' | 'SELECT';
  isRequired: boolean;
  defaultValue: string | null;
  options?: string;
  isUnique?: boolean;
}

interface ItemAttributeEditorProps {
  quantity: number;
  typeAttributes: TypeAttribute[];
  onItemsChange: (items: Array<Record<string, string>>) => void;
  onValidationErrorsChange?: (errors: ValidationError[]) => void; // New prop
  isFormSubmitted: boolean; // New prop
}

// New interface for the ref handle
export interface ItemAttributeEditorRef {
  scrollToError: (error: ValidationError) => void;
}

interface ItemRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: Array<Record<string, string>>;
    typeAttributes: TypeAttribute[];
    duplicates: Record<number, Record<string, boolean>>;
    onItemChange: (index: number, attributeId: string, value: string) => void;
    renderInput: (attribute: TypeAttribute, value: string, onChange: (value: string) => void, disabled?: boolean) => React.ReactNode;
    highlightedItem: number | null;
    isFormSubmitted: boolean; // New prop
  };
}

const ItemRow: React.FC<ItemRowProps> = ({ index, style, data }) => {
  const { items, typeAttributes, duplicates, onItemChange, renderInput, highlightedItem, isFormSubmitted } = data;
  const item = items[index];

  return (
    <div style={style} className="px-4 py-2">
      <div className={`pl-4 pr-4 border rounded-md bg-white shadow-sm h-full overflow-hidden transition-all duration-300 ${
        highlightedItem === index ? 'bg-blue-50 border-blue-300 shadow-md scale-[1.02]' : ''
      }`}>
        <h4 className="font-medium mb-3 text-base text-gray-900 border-b pb-2 flex-shrink-0">
          Item #{index + 1}
        </h4>
        <div className="grid grid-cols-2 gap-x-4" style={{ height: 'calc(100% - 50px)' }}>
          {typeAttributes.map(attr => {
            const duplicateStatusForThisItem = duplicates[index];
            const isEmpty = !item[attr.id]?.trim();
            const hasDuplicate = duplicateStatusForThisItem && duplicateStatusForThisItem[attr.id];

            return (
              <div key={attr.id} className="flex flex-col min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1 flex-shrink-0">
                  <span className="truncate block" title={attr.name}>
                    {attr.name}
                    {attr.isRequired && <span className="text-red-500 ml-1">*</span>}
                    {attr.isUnique && <span className="text-blue-500 ml-1">(unique)</span>}
                  </span>
                </label>
                <div className="min-w-0 flex-shrink-0">
                  {renderInput(attr, item[attr.id] || '', value =>
                    onItemChange(index, attr.id, value)
                  )}
                </div>
                <div className="flex-shrink-0 min-h-[16px]">
                  {hasDuplicate && (
                    <p className="text-xs text-red-600 mt-1 truncate" title="This value is duplicated in other items">
                      Duplicate value
                    </p>
                  )}
                  {attr.isRequired && isEmpty && isFormSubmitted && !hasDuplicate && (
                    <p className="text-xs text-yellow-600 mt-1 truncate" title="This field is required">
                      Required
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const ItemAttributeEditor = forwardRef<ItemAttributeEditorRef, ItemAttributeEditorProps>(
  ({ quantity, typeAttributes, onItemsChange, onValidationErrorsChange, isFormSubmitted }, ref) => {
    const [items, setItems] = useState<Array<Record<string, string>>>([]);
    const [bulkEditAttribute, setBulkEditAttribute] = useState<string | null>(null);
    const [bulkEditValue, setBulkEditValue] = useState<string>('');
    const [jumpToItem, setJumpToItem] = useState<string>('');
    const [showBulkEditConfirm, setShowBulkEditConfirm] = useState(false);
    const [highlightedItem, setHighlightedItem] = useState<number | null>(null);
    const { addToast } = useToast();
    const listRef = useRef<List>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [listCalculatedHeight, setListCalculatedHeight] = useState(0);

    const debouncedItems = useDebounce(items, 200);

    // Calculate dynamic item height based on number of attributes with proper spacing
    const itemHeight = useMemo(() => {
      const headerHeight = 50; // Item header with title and border
      const containerPadding = 32; // Container padding (16px top + 16px bottom)
      const attributesPerRow = 2; // Fixed to 2 columns
      const rows = Math.ceil(typeAttributes.length / attributesPerRow);

      // Each attribute row needs:
      // - Label: 16px (text-xs line-height)
      // - Input: 32px (standard input height h-8)
      // - Error/validation message: 16px (reserved space)
      // - Gap between rows: 12px (gap-y-3)
      const attributeRowHeight = 16 + 32 + 16 + 12; // 76px per row

      const totalContentHeight = headerHeight + (rows * attributeRowHeight) + containerPadding;

      // Set reasonable minimum height but no maximum cap
      const minHeight = 160; // Minimum for single attribute with proper spacing

      const calculatedHeight = Math.max(minHeight, totalContentHeight);

      console.log(`Height calculation for ${typeAttributes.length} attributes:`, {
        attributes: typeAttributes.length,
        rows,
        headerHeight,
        attributeRowHeight,
        containerPadding,
        totalContentHeight,
        finalHeight: calculatedHeight
      });

      return calculatedHeight;
    }, [typeAttributes.length]);

    useEffect(() => {
      if (containerRef.current) {
        const resizeObserver = new ResizeObserver(entries => {
          for (let entry of entries) {
            if (entry.target === containerRef.current) {
              setListCalculatedHeight(entry.contentRect.height);
            }
          }
        });

        resizeObserver.observe(containerRef.current);

        // Initial measurement
        setListCalculatedHeight(containerRef.current.offsetHeight);

        return () => {
          resizeObserver.disconnect();
        };
      }
    }, []);

    // Initialize items with default values and handle quantity changes
    useEffect(() => {
      setItems(prevItems => {
        const newItems = [...prevItems];

        if (quantity > newItems.length) {
          for (let i = newItems.length; i < quantity; i++) {
            const item: Record<string, string> = {};
            typeAttributes.forEach(attr => {
              item[attr.id] = attr.defaultValue || '';
            });
            newItems.push(item);
          }
        } else if (quantity < newItems.length) {
          newItems.splice(quantity);
        }

        return newItems;
      });
    }, [quantity, typeAttributes]);

    useEffect(() => {
      if (debouncedItems.length > 0) {
        onItemsChange(debouncedItems);
      }
    }, [debouncedItems, onItemsChange]);

    // Expose scrollToError function via imperative handle
    useImperativeHandle(ref, () => ({
      scrollToError: (error: ValidationError) => {
        if (listRef.current) {
          const targetIndex = error.itemIndex;
          const duration = 500; // 500ms duration
          const steps = 20; // Number of steps in the animation
          let currentStep = 0;

          const animateScroll = () => {
            if (currentStep < steps) {
              const progress = currentStep / steps;
              const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
              const easedProgress = easeInOutCubic(progress);
              
              const intermediateIndex = Math.round(targetIndex * easedProgress);
              listRef.current?.scrollToItem(intermediateIndex, 'center');
              
              currentStep++;
              setTimeout(animateScroll, duration / steps);
            } else {
              // Flash the item after scrolling
              setHighlightedItem(targetIndex);
              setTimeout(() => setHighlightedItem(null), 1000); // Remove highlight after 1 second
            }
          };

          animateScroll();
        }
      },
    }));

    const handleJumpToItem = useCallback(() => {
      const itemNumber = parseInt(jumpToItem);
      if (isNaN(itemNumber) || itemNumber < 1 || itemNumber > items.length) {
        addToast({
          title: 'Invalid Item Number',
          message: `Please enter a number between 1 and ${items.length}`,
          type: 'error'
        });
        return;
      }

      if (listRef.current) {
        const targetIndex = itemNumber - 1;
        const duration = 500; // 500ms duration
        const steps = 20; // Number of steps in the animation
        let currentStep = 0;

        const animateScroll = () => {
          if (currentStep < steps) {
            const progress = currentStep / steps;
            // Easing function for smooth acceleration and deceleration
            const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            const easedProgress = easeInOutCubic(progress);
            
            // Calculate intermediate index
            const intermediateIndex = Math.round(targetIndex * easedProgress);
            listRef.current?.scrollToItem(intermediateIndex, 'center');
            
            currentStep++;
            setTimeout(animateScroll, duration / steps);
          } else {
            // Animation complete, flash the item
            setHighlightedItem(targetIndex);
            setTimeout(() => setHighlightedItem(null), 1000); // Remove highlight after 1 second
          }
        };

        animateScroll();

        addToast({
          title: 'Jumped to Item',
          message: `Scrolled to item #${itemNumber}`,
          type: 'success'
        });
      }
      setJumpToItem('');
    }, [jumpToItem, items.length, addToast]);

    const getDuplicateValues = useCallback((attributeId: string, allItems: Array<Record<string, string>>) => {
      const valueCounts: Record<string, number[]> = {};
      allItems.forEach((item, index) => {
        const value = item[attributeId]?.trim();
        if (value) {
          if (!valueCounts[value]) {
            valueCounts[value] = [];
          }
          valueCounts[value].push(index);
        }
      });
      return Object.entries(valueCounts)
        .filter(([_, indices]) => indices.length > 1)
        .reduce((acc, [value, indices]) => {
          indices.forEach(index => {
            if (!acc[index]) acc[index] = [];
            acc[index].push(value);
          });
          return acc;
        }, {} as Record<number, string[]>);
    }, []);

    const duplicates = useMemo(() => {
      const allDuplicates: Record<number, Record<string, boolean>> = {};
      typeAttributes.forEach(attr => {
        if (attr.isUnique) {
          const attrSpecificDuplicates = getDuplicateValues(attr.id, items);

          Object.entries(attrSpecificDuplicates).forEach(([itemIndexStr, duplicatedValues]) => {
            const itemIndex = parseInt(itemIndexStr);
            const itemValueForAttr = items[itemIndex]?.[attr.id];

            if (itemValueForAttr && duplicatedValues.includes(itemValueForAttr)) {
              if (!allDuplicates[itemIndex]) {
                allDuplicates[itemIndex] = {};
              }
              allDuplicates[itemIndex][attr.id] = true;
            }
          });
        }
      });
      return allDuplicates;
    }, [items, typeAttributes, getDuplicateValues]);

    // New useMemo to collect all validation errors
    const allValidationErrors = useMemo(() => {
      const errors: ValidationError[] = [];

      items.forEach((item, itemIndex) => {
        typeAttributes.forEach(attr => {
          const value = item[attr.id]?.trim();

          // 1. Required field validation (only if form has been submitted)
          if (attr.isRequired && !value && isFormSubmitted) {
            errors.push({
              itemIndex,
              attributeId: attr.id,
              message: `${attr.name} is required.`, // Adjusted message
              type: 'required',
            });
          }

          // 2. Unique field validation
          if (attr.isUnique) {
            const duplicateStatusForThisItem = duplicates[itemIndex];
            if (duplicateStatusForThisItem && duplicateStatusForThisItem[attr.id]) {
              errors.push({
                itemIndex,
                attributeId: attr.id,
                message: `${attr.name} has a duplicate value.`, // Adjusted message
                type: 'unique',
              });
            }
          }

          // 3. Data type validation (only if value is not empty and not already a required error)
          // Also, if required and not submitted, don't show data type error yet for empty fields
          if (value && ((attr.isRequired && isFormSubmitted) || !attr.isRequired)) {
            let isValidDataType = true;
            let dataTypeErrorMessage = '';

            switch (attr.dataType) {
              case 'NUMBER':
                if (isNaN(Number(value))) {
                  isValidDataType = false;
                  dataTypeErrorMessage = `${attr.name} must be a valid number.`;
                }
                break;
              case 'DATE':
                if (isNaN(new Date(value).getTime())) {
                  isValidDataType = false;
                  dataTypeErrorMessage = `${attr.name} must be a valid date.`;
                }
                break;
              case 'SELECT':
                if (attr.options && !attr.options.split(',').map(opt => opt.trim()).includes(value)) {
                  isValidDataType = false;
                  dataTypeErrorMessage = `Invalid selection for ${attr.name}.`;
                }
                break;
              // STRING and BOOLEAN handled by other checks or are flexible
            }

            if (!isValidDataType) {
              errors.push({
                itemIndex,
                attributeId: attr.id,
                message: dataTypeErrorMessage,
                type: 'dataType',
              });
            }
          }
        });
      });

      return errors;
    }, [items, typeAttributes, duplicates, isFormSubmitted]);

    // Effect to notify parent about validation errors
    useEffect(() => {
      if (onValidationErrorsChange) {
        onValidationErrorsChange(allValidationErrors);
      }
    }, [allValidationErrors, onValidationErrorsChange]);

    const handleItemChange = useCallback((index: number, attributeId: string, value: string) => {
      // Removed validateValue here to centralize validation in allValidationErrors useMemo
      setItems(prevItems => {
        const newItems = [...prevItems];
        newItems[index] = { ...newItems[index], [attributeId]: value };
        return newItems;
      });
    }, []); // Dependencies adjusted

    const handleBulkEdit = useCallback(() => {
      if (!bulkEditAttribute) return;

      const attribute = typeAttributes.find(attr => attr.id === bulkEditAttribute);
      if (!attribute) return;

      // Removed validateValue here, handled by allValidationErrors
      setShowBulkEditConfirm(true);
    }, [bulkEditAttribute, bulkEditValue, typeAttributes]); // Dependencies adjusted

    const confirmBulkEdit = useCallback(() => {
      setItems(prevItems =>
        prevItems.map(item => ({
          ...item,
          [bulkEditAttribute!]: bulkEditValue
        }))
      );
      setBulkEditValue('');
      setShowBulkEditConfirm(false);
      addToast({
        title: 'Success',
        message: `Attribute '${typeAttributes.find(attr => attr.id === bulkEditAttribute)?.name}' bulk updated successfully.`,
        type: 'success'
      });
    }, [bulkEditAttribute, bulkEditValue, typeAttributes, addToast]);

    const renderInput = useCallback((attribute: TypeAttribute, value: string, onChange: (value: string) => void, disabled?: boolean) => {
      const commonProps = {
        value,
        onChange,
        className: "w-full text-xs h-8", // Fixed height for consistency
        disabled
      };

      switch (attribute.dataType) {
        case 'NUMBER':
          return (
            <Input
              type="number"
              {...commonProps}
              onChange={e => onChange(e.target.value)}
            />
          );
        case 'DATE':
          return (
            <Input
              type="date"
              {...commonProps}
              onChange={e => onChange(e.target.value)}
            />
          );
        case 'BOOLEAN':
          return (
            <Select
              {...commonProps}
              options={[
                { value: '', label: 'Select...' },
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' }
              ]}
            />
          );
        case 'SELECT':
          return (
            <Select
              {...commonProps}
              options={[
                { value: '', label: 'Select...' },
                ...(attribute.options?.split(',').map(opt => ({
                  value: opt.trim(),
                  label: opt.trim()
                })) || [])
              ]}
            />
          );
        default:
          return (
            <Input
              type="text"
              {...commonProps}
              onChange={e => onChange(e.target.value)}
            />
          );
      }
    }, []);

    const listData = useMemo(() => ({
      items,
      typeAttributes,
      duplicates,
      onItemChange: handleItemChange,
      renderInput,
      highlightedItem,
      isFormSubmitted
    }), [items, typeAttributes, duplicates, handleItemChange, renderInput, highlightedItem, isFormSubmitted]);

    return (
      <div className="relative h-full flex flex-col">
        <div className="flex-shrink-0 space-y-3 mb-4">
          {/* Bulk Edit Controls */}
          <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
              <div>
                <Select
                  label="Bulk Edit Attribute"
                  value={bulkEditAttribute || ''}
                  onChange={value => {
                    setBulkEditAttribute(value);
                    setBulkEditValue('');
                  }}
                  options={[
                    { value: '', label: 'Select attribute...' },
                    ...typeAttributes.map(attr => ({
                      value: attr.id,
                      label: attr.name
                    }))
                  ]}
                />
              </div>
              {bulkEditAttribute && (
                <>
                  <div>
                    {renderInput(
                      typeAttributes.find(attr => attr.id === bulkEditAttribute)!,
                      bulkEditValue,
                      setBulkEditValue,
                      typeAttributes.find(attr => attr.id === bulkEditAttribute)?.isUnique
                    )}
                  </div>
                  <Button
                    onClick={handleBulkEdit}
                    type="button"
                    size="sm"
                    disabled={typeAttributes.find(attr => attr.id === bulkEditAttribute)?.isUnique}
                  >
                    Apply to All
                  </Button>
                </>
              )}
            </div>
            {bulkEditAttribute && typeAttributes.find(attr => attr.id === bulkEditAttribute)?.isUnique && (
              <p className="text-xs text-yellow-600">This attribute is unique and cannot be bulk modified.</p>
            )}
          </div>

          {/* Jump to Item */}
          <div className="flex gap-2 items-end p-3 bg-gray-50 rounded-md">
            <div className="flex-1">
              <Input
                type="number"
                label="Jump to Item"
                value={jumpToItem}
                onChange={e => setJumpToItem(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleJumpToItem();
                  }
                }}
                placeholder={`1-${items.length}`}
                min={1}
                max={items.length}
              />
            </div>
            <Button
              onClick={handleJumpToItem}
              type="button"
              size="sm"
            >
              Go
            </Button>
          </div>
        </div>

        {/* Virtualized Items List */}
        <div className="flex-1 border rounded-md bg-white flex flex-col">
          <div className="p-3 border-b bg-gray-50 flex-shrink-0">
            <h3 className="font-medium text-gray-900 text-sm">
              Items ({items.length} total) - {typeAttributes.length} attributes in 2 columns
            </h3>

          </div>
          <div className="flex-1 min-h-0" ref={containerRef}>
            <List
              ref={listRef}
              height={listCalculatedHeight}
              width="100%"
              itemCount={items.length}
              itemSize={itemHeight}
              itemData={listData}
              className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              overscanCount={2}
            >
              {ItemRow}
            </List>
          </div>
        </div>

        {/* Bulk Edit Confirmation Modal */}
        <Modal
          isOpen={showBulkEditConfirm}
          onClose={() => setShowBulkEditConfirm(false)}
          title="Confirm Bulk Edit"
          isNested={true}
        >
          <div className="py-4">
            <p className="text-gray-700">
              You are about to overwrite the <strong>'{typeAttributes.find(attr => attr.id === bulkEditAttribute)?.name}'</strong> attribute for all {quantity} items with the value <strong>'{bulkEditValue}'</strong>.
            </p>
            <p className="text-red-600 font-semibold mt-2">
              This action cannot be undone. Are you sure you want to proceed?
            </p>
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowBulkEditConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={confirmBulkEdit}
            >
              Confirm Overwrite
            </Button>
          </div>
        </Modal>
      </div>
    );
  }
);