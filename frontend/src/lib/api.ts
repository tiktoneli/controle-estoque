import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
// import { PageRequest } from '../types/pagination'; // Removed unused import again
import { ErrorResponse } from '../types'; // Import ErrorResponse from shared types

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // You can add any successful response handling here if needed
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const errorResponseData = error.response.data as ErrorResponse;
      
      // If there are validation errors, format them into a readable message
      if (errorResponseData.validationErrors) {
        const validationMessages = Object.entries(errorResponseData.validationErrors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');
        throw new Error(`Validation Failed: ${validationMessages}`);
      }

      // Use the error message from the backend if available
      if (errorResponseData.message) {
        throw new Error(errorResponseData.message);
      }

      // Fallback to status-specific messages
      switch (error.response.status) {
        case 400:
          throw new Error('Invalid request. Please check your input.');
        case 401:
          throw new Error('Please log in to continue.');
        case 403:
          throw new Error('You do not have permission to perform this action.');
        case 404:
          throw new Error('The requested resource was not found.');
        case 409:
          throw new Error('This record already exists.');
        case 500:
          throw new Error('An unexpected error occurred. Please try again later.');
        default:
          throw new Error('An unexpected error occurred.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error: No response received', error.request);
      throw new Error('No response received from server. Please check your connection and try again.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
      throw new Error(`Request failed: ${error.message}`);
    }
  }
);

export { api };