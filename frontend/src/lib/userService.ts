import { UserRole } from '../types';
import { api } from './api'; // Import api from ./api

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'; // Removed unused constant

/**
 * Get the role of a specific user by their ID
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    // api interceptor automatically adds the token if available
    const response = await api.get<UserRole>(`/users/${userId}/role`);

    // Axios handles non-OK responses by throwing errors.
    // Response data is in response.data.
    return response.data || 'visitor'; // Default to 'visitor' if role is null
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'visitor';
  }
}

/**
 * Check if a user's role has sufficient permissions
 * @param userRole - The role of the user
 * @param requiredRoles - Array of roles that are allowed to perform the action
 * @returns boolean indicating if the user has permission
 */
export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  // Define role hierarchy and their specific permissions
  const rolePermissions: Record<UserRole, string[]> = {
    'manager': ['all'], // Superuser with full access
    'admin': ['inventory_management', 'categories', 'attributes', 'locations'],
    'auditor': ['reports', 'queries'],
    'user': ['inventory_movements'],
    'visitor': ['view'] // Limited view-only access
  };

  // If user is manager, they have access to everything
  if (userRole === 'manager') return true;

  // Check if user's role has any of the required permissions
  const userPermissions = rolePermissions[userRole] || [];
  return requiredRoles.some(role => {
    const requiredPermission = rolePermissions[role] || [];
    return requiredPermission.some(permission => 
      userPermissions.includes(permission) || userPermissions.includes('all')
    );
  });
}

/**
 * Get the current user's role from the auth context
 */
export async function getCurrentUserRole(): Promise<UserRole> {
  try {
    // api interceptor automatically adds the token if available
    const response = await api.get<UserRole>('/auth/me');

    // Axios handles non-OK responses by throwing errors.
    // Response data is in response.data.
    return response.data || 'visitor'; // Default to 'visitor' if role is null
  } catch (error) {
    console.error('Error getting current user role:', error);
    return 'visitor';
  }
} 