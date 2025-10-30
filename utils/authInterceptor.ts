// import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import axios from 'axios';

// API URL using Vite's environment variable approach
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to headers
    if (token) {
      // Add token to headers (using both formats for compatibility)
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token // Include this if your backend also checks for it
      };
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized errors globally
    if (error.response && error.response.status === 401) {
      console.log('Authentication error detected');
      
      // Clear token from localStorage and potentially redirect to login
      localStorage.removeItem('token');
      
      // You could dispatch an event or call a global function to handle logout
      // Example: window.dispatchEvent(new Event('auth:logout'));
    }
    
    return Promise.reject(error);
  }
);

export default api;