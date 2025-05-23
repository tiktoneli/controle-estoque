import { UserRole } from '../types';
import { supabase } from './supabase';

/**
 * Get the role of a specific user by their ID
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data.role as UserRole || 'visitor'; // Default to 'visitor' if role is null
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'visitor';

    return await getUserRole(user.id);
  } catch (error) {
    console.error('Error getting current user role:', error);
    return 'visitor';
  }
} 