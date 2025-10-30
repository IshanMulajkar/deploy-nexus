// TokenContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// API URL using Vite's environment variable approach
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface TokenContextType {
  tokens: number;
  maxTokens: number;
  isLoading: boolean;
  error: string | null;
  decrementToken: () => Promise<void>;
  incrementToken: (amount: number) => Promise<void>;
  fetchTokens: () => Promise<void>;
}

// Create context
const TokenContext = createContext<TokenContextType | undefined>(undefined);

// Provider component
interface TokenProviderProps {
  children: ReactNode;
}

export const TokenProvider = ({ children }: TokenProviderProps) => {
  const [tokens, setTokens] = useState(0);
  const [maxTokens, setMaxTokens] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuth();

  // Setup axios instance with auth header
  const authAxios = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Update auth header when token changes
  useEffect(() => {
    if (token) {
      authAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Also include x-auth-token for compatibility with some backend implementations
      authAxios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete authAxios.defaults.headers.common['Authorization'];
      delete authAxios.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  // Fetch tokens when auth state changes
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchTokens();
      // Add this to your frontend for debugging (remove in production)
console.log('JWT Decoded:', JSON.parse(atob(token.split('.')[1]))); // added for testing auth response 
    } else {
      // Reset tokens when not authenticated
      setTokens(0);
      setMaxTokens(0);
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  const fetchTokens = async () => {
    if (!token) {
      setError("Authentication token not available");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Debug the request headers
      console.log('Auth headers being sent:', {
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token
      });
      
      const response = await authAxios.get('/tokens/info');
      console.log('Token info response:', response.data);
      
      // Handle different response formats
      if (response.data && typeof response.data === 'object') {
        // Extract tokens from response - handle various possible response structures
        const tokenData = response.data.tokens || response.data;
        
        if (typeof tokenData.current === 'number') {
          setTokens(tokenData.current);
        } else if (typeof tokenData.available === 'number') {
          setTokens(tokenData.available);
        } else if (typeof tokenData.count === 'number') {
          setTokens(tokenData.count);
        } else if (typeof tokenData.remaining === 'number') {
          setTokens(tokenData.remaining);
        } else if (typeof tokenData === 'number') {
          setTokens(tokenData);
        } else {
          // Default to 0 if we can't find a valid token count
          console.warn('Could not determine token count from response:', tokenData);
          setTokens(0);
        }
        
        // Extract max tokens if available
        if (typeof tokenData.max === 'number') {
          setMaxTokens(tokenData.max);
        } else if (typeof tokenData.limit === 'number') {
          setMaxTokens(tokenData.limit);
        } else if (typeof tokenData.total === 'number') {
          setMaxTokens(tokenData.total);
        } else if (response.data.maxTokens) {
          setMaxTokens(response.data.maxTokens);
        } else {
          // Default max tokens if not found
          setMaxTokens(tokens > 0 ? Math.max(tokens, 10) : 10);
        }
      } else {
        // Fallback for unexpected response format
        console.warn('Unexpected token info response format:', response.data);
        setTokens(0);
        setMaxTokens(10);
      }
    } catch (error) {
      console.error('Error fetching token info:', error);
      
      // Be specific about 401/403 auth errors vs. server errors
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          setError("Authentication error. Please log in again.");
        } else if (error.response.status === 404) {
          // If endpoint doesn't exist, use fallback values
          console.warn("Tokens endpoint not found. Using default values.");
          setTokens(5); // Default value
          setMaxTokens(10); // Default value
          setError(null); // Clear error since we're using defaults
        } else if (error.response.status === 500) {
          setError("Server error. The tokens service may be temporarily unavailable.");
          
          // TEMPORARY FIX: Set default values for development/testing
          setTokens(5); 
          setMaxTokens(10);
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const decrementToken = async () => {
    if (tokens <= 0) {
      setError("No tokens available");
      return;
    }

    try {
      // Try to update on server first
      if (token) {
        await authAxios.post('/tokens/use', { amount: 1 });
      }
      
      // Update local state
      setTokens(prevTokens => Math.max(0, prevTokens - 1));
      setError(null);
    } catch (error) {
      console.error('Error decrementing token:', error);
      
      // Update local state anyway for better UX
      setTokens(prevTokens => Math.max(0, prevTokens - 1));
      
      // But set an error message
      if (error.response && error.response.status === 500) {
        setError("Token was used but not recorded on server.");
      } else {
        setError("Error updating tokens.");
      }
    }
  };

  const incrementToken = async (amount: number) => {
    if (amount <= 0) return;

    try {
      // Try to update on server first
      if (token) {
        await authAxios.post('/tokens/add', { amount });
      }
      
      // Update local state
      setTokens(prevTokens => prevTokens + amount);
      setError(null);
    } catch (error) {
      console.error('Error incrementing tokens:', error);
      setError("Error adding tokens.");
    }
  };

  return (
    <TokenContext.Provider
      value={{
        tokens,
        maxTokens,
        isLoading,
        error,
        decrementToken,
        incrementToken,
        fetchTokens
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

// Custom hook to use token context
export const useTokens = () => {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useTokens must be used within a TokenProvider');
  }
  return context;
};