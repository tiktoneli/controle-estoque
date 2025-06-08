export interface Product {
  id: string;
  name: string;
  typeId: string;
  description?: string;
}

export interface ProductType {
  id: string;
  name: string;
  description?: string;
}

export interface Batch {
  id: string;
  name: string;
  typeId: string;
  description?: string;
  isActive?: boolean;
  sku?: string;
  minStock?: number;
  prefix?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BatchFilters {
  search?: string;
  typeId?: string;
  status?: 'active' | 'inactive';
}

export interface BatchInventory {
  id: string;
  batchId: string;
  locationId: string;
  quantity: number;
  status: 'available' | 'reserved' | 'in_transit';
  createdAt?: string;
  updatedAt?: string;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  children?: NavigationItem[];
}

export interface User {
  id: string;
  email: string;
  display_name?: string;
  role?: UserRole;
  avatar_url?: string;
}

export type UserRole = 'manager' | 'admin' | 'auditor' | 'user' | 'visitor';

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface Attribute {
  id: string;
  name: string;
  description?: string;
  dataType: string;
  options?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TypeAttribute {
  id: string;
  name: string;
  description?: string;
  dataType: string;
  options?: string;
  isRequired: boolean;
  defaultValue?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ErrorResponse {
  status: number;
  title: string;
  message: string;
  timestamp: string; // Assuming backend LocalDateTime is sent as string
  path?: string; // Optional field
  validationErrors?: { [key: string]: string }; // Optional field for validation errors
}