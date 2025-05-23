import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Search } from 'lucide-react';
import { Button } from '../ui/Button';

export interface FilterConfig {
    type: 'text' | 'select' | 'number';
    key: string;
    label: string;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    className?: string;
    isLoading?: boolean;
}

interface FilterBarProps {
    filters: Record<string, string>;
    onFilterChange: (key: string, value: string) => void;
    config: FilterConfig[];
    className?: string;
}

export function FilterBar({ filters, onFilterChange, config, className = '' }: FilterBarProps) {
    function renderFilter(filter: FilterConfig) {
        if (filter.type === 'text') {
            return (
                <div className="relative">
                    <div className="absolute  inset-y-0 left-0 flex items-center pt-5 pl-2.5">
                        <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </div>
                    <Input
                        type="text"
                        label={filter.label}
                        placeholder={filter.placeholder}
                        value={filters[filter.key] || ''}
                        onChange={(e) => onFilterChange(filter.key, e.target.value)}
                        className={`pl-8 text-sm ${filter.className || ''}`}
                        aria-label={`Search by ${filter.label.toLowerCase()}`}
                    />
                </div>
            );
        }
    
        if (filter.type === 'select') {
            return (
                <div className={filter.className}>
                    <Select
                        label={filter.label}
                        value={filters[filter.key] || ''}
                        onChange={(value) => onFilterChange(filter.key, value)}
                        options={filter.options || []}
                        className="text-sm"
                        aria-label={`Filter by ${filter.label.toLowerCase()}`}
                    />
                </div>
            );
        }
    
        if (filter.type === 'number') {
            return (
                <div className={filter.className}>
                    <Input
                        type="number"
                        label={filter.label}
                        placeholder={filter.placeholder}
                        value={filters[filter.key] || ''}
                        onChange={(e) => onFilterChange(filter.key, e.target.value)}
                        className={`text-sm ${filter.className || ''}`}
                        aria-label={`Filter by ${filter.label.toLowerCase()}`}
                        step="0.01"
                        min="0"
                    />
                </div>
            );
        }
    
        return null;
    }
    return (
        <div className="flex flex-row items-end gap-2 mb-6">
            {config.map((filter) => (
                <div key={filter.key}>
                    {renderFilter(filter)}
                </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => {
                config.forEach(f => onFilterChange(f.key, ''));
            }}>Clear</Button>
        </div>
    );
} 