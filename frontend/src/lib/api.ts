import { PageRequest } from '../types/pagination';

const API_URL = 'http://localhost:8080/api';

export const api = {
  async get<T>(endpoint: string, pageRequest?: PageRequest): Promise<T> {
    const url = new URL(`${API_URL}/${endpoint}`);
    
    if (pageRequest) {
      url.searchParams.append('page', pageRequest.page.toString());
      url.searchParams.append('size', pageRequest.size.toString());
      if (pageRequest.sort) {
        pageRequest.sort.forEach(sort => url.searchParams.append('sort', sort));
      }
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async post<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if there's content to parse
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
    return response.json();
    }
    
    // Return empty object for 201 responses with no content
    if (response.status === 201) {
      return {} as T;
    }

    throw new Error('Unexpected response format');
  },

  async put<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if there's content to parse
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
    return response.json();
    }
    
    // Return empty object for 200/204 responses with no content
    if (response.status === 200 || response.status === 204) {
      return {} as T;
    }

    throw new Error('Unexpected response format');
  },

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};