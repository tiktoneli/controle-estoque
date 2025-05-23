// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// These should be stored in environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define the roles available in your application
export enum UserRole {
  MANAGER = 'manager',
  ADMIN = 'admin',
  AUDITOR = 'auditor',
  VISITOR = 'visitor',
  USER = 'user'
}

// User type based on Supabase User with additional fields
export type AppUser = {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}
export async function signIn(email: string, password: string) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	return { data, error };
}

export async function signOut() {
	const { error } = await supabase.auth.signOut();
	return { error };
}

export async function getCurrentUser() {
	const { data } = await supabase.auth.getUser();
	return data?.user;
}


// Function to check if current user is a manager
export const isManager = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  // Fetch user's role from profiles table
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (error || !data) return false;
  
  return data.role === UserRole.MANAGER;
};