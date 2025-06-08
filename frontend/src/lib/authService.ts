import { User, UserRole } from "../types";
import { api } from "./api";
import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"; // Removed unused constant

interface LoginResponse {
	token: string;
	type: string;
	email: string;
	displayName: string;
	role: UserRole;
	id: string;
}

interface UserInfoResponse {
	id: string;
	email: string;
	displayName: string;
	role: UserRole;
	isActive: boolean;
	createdAt: string;
}

// ErrorResponse interface is now defined in ../types and used in api.ts

export async function login(
	email: string,
	password: string
): Promise<{ data: LoginResponse | null; error: Error | null }> {
	try {
		const response = await api.post<LoginResponse>("/auth/login", { email, password });

		// Store the token in localStorage. Axios handles non-OK responses by throwing errors,
		// so we don't need the !response.ok check here.
		localStorage.setItem("token", response.data.token);
		return { data: response.data, error: null };
	} catch (error) {
		console.error("Login error:", error);
		// The api interceptor should have already thrown a standard Error with a helpful message
		return { 
			data: null, 
			error: error instanceof Error ? error : new Error("An unexpected error occurred during login") 
		};
	}
}

export async function logout(): Promise<void> {
	localStorage.removeItem("token");
}

export async function getCurrentUser(): Promise<User | null> {
	try {
		// api interceptor automatically adds the token if available
		const response = await api.get<UserInfoResponse>("/auth/me");

		const userData = response.data; // Axios puts response data in .data
		return {
			id: userData.id,
			email: userData.email,
			display_name: userData.displayName,
			role: userData.role,
		};
	} catch (error) {
		console.error("Get current user error:", error);
		// If the api call failed (e.g., 401), the interceptor will throw an error.
		// If the error is due to a 401 and we couldn't get user info, clear the token.
		// Note: The api interceptor could potentially handle token expiration and clearing automatically.
		// For now, we'll add a check here as a fallback.
		if (axios.isAxiosError(error) && error.response?.status === 401) {
			localStorage.removeItem("token");
		}
		return null;
	}
}

export function getAuthToken(): string | null {
	return localStorage.getItem("token");
}

export function isAuthenticated(): boolean {
	return !!getAuthToken();
}
