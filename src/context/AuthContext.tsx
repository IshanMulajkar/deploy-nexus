// AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

// API URL using Vite's environment variable approach
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
interface User {
  id?: string;
  _id?: string; // Handle both formats
  username: string;
  email: string;
  role: 'user' | 'developer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string, role: 'user' | 'developer') => Promise<void>;
  logout: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to process user data which might come in different formats
const processUserData = (userData: any): User => {
  if (!userData) return null;
  
  return {
    id: userData.id || userData._id || userData.userId,
    _id: userData._id || userData.id || userData.userId,
    username: userData.username || userData.name,
    email: userData.email,
    role: userData.role || 'user'
  };
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      authAxios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete authAxios.defaults.headers.common['Authorization'];
      delete authAxios.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  // Load user from token
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await authAxios.get('/user');
          const userData = processUserData(res.data.user || res.data);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error loading user:', error);
          
          // Only clear token if it's an auth error
          if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, [token]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      // Clear any previous auth state
      localStorage.removeItem('token');
      setToken(null);
      
      console.log('Attempting login with:', { email });
      
      // Make login request without auth headers
      const res = await axios.post(`${API_URL}/login`, { email, password }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Login response received:', res.data);
      
      // Check for token in various possible locations in the response
      const authToken = res.data.token || res.data.accessToken || res.data.authToken;
      
      if (!authToken) {
        console.error('No token found in response:', res.data);
        throw new Error('No authentication token received');
      }
      
      // Save token and set auth state
      localStorage.setItem('token', authToken);
      setToken(authToken);
      
      // Process user data from response
      let userData = null;
      if (res.data.user) {
        userData = processUserData(res.data.user);
      } else if (res.data.userData) {
        userData = processUserData(res.data.userData);
      } else {
        // If no user data in response, try to fetch it
        try {
          const userRes = await axios.get(`${API_URL}/user`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'x-auth-token': authToken
            }
          });
          userData = processUserData(userRes.data.user || userRes.data);
        } catch (userError) {
          console.warn('Could not fetch user data after login:', userError);
          // Continue anyway as we at least have a token
        }
      }
      
      setUser(userData);
      setIsAuthenticated(true);
      return res.data;
    } catch (error) {
      console.error('Login error:', error);
      
      // Enhanced error reporting
      if (error.response) {
        console.error('Server responded with error:', {
          status: error.response.status,
          data: error.response.data
        });
        
        // Check for specific error messages
        const errorMsg = error.response.data?.message || error.response.data?.error;
        if (errorMsg) {
          throw new Error(errorMsg);
        }
      }
      
      throw error;
    }
  };

  // Signup function
  const signup = async (email: string, username: string, password: string, role: 'user' | 'developer') => {
    try {
      // Clear any previous auth state
      localStorage.removeItem('token');
      setToken(null);
      
      console.log('Attempting signup with:', { email, username, role });
      
      // Make registration request without auth headers
      const res = await axios.post(`${API_URL}/register`, {
        email,
        username,
        password,
        role,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Signup response received:', res.data);
      
      // Check for token in various possible locations in the response
      const authToken = res.data.token || res.data.accessToken || res.data.authToken;
      
      // UPDATED: Handle case where signup succeeds but no token is returned
      if (!authToken) {
        console.warn('No token found in signup response. Attempting to log in with the new credentials:', res.data);
        
        // If registration was successful but didn't return a token, try to login immediately
        try {
          return await login(email, password);
        } catch (loginError) {
          console.error('Auto-login after registration failed:', loginError);
          throw new Error('Registration successful but could not log in automatically. Please try logging in.');
        }
      }
      
      // Save token
      localStorage.setItem('token', authToken);
      setToken(authToken);
      
      // Process user data from response
      let userData = null;
      if (res.data.user) {
        userData = processUserData(res.data.user);
      } else if (res.data.userData) {
        userData = processUserData(res.data.userData);
      } else if (res.data.newUser) {
        userData = processUserData(res.data.newUser);
      } else {
        // If we have user fields directly in the response
        if (res.data.email && (res.data.username || res.data.name)) {
          userData = processUserData(res.data);
        } else {
          // If no user data in response, try to fetch it
          try {
            const userRes = await axios.get(`${API_URL}/user`, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'x-auth-token': authToken
              }
            });
            userData = processUserData(userRes.data.user || userRes.data);
          } catch (userError) {
            console.warn('Could not fetch user data after signup:', userError);
            // Create a minimal user object from the registration data
            userData = {
              id: 'pending',
              username,
              email,
              role
            };
          }
        }
      }
      
      setUser(userData);
      setIsAuthenticated(true);
      return res.data;
    } catch (error) {
      console.error('Signup error:', error);
      
      // Enhanced error reporting
      if (error.response) {
        console.error('Server responded with error:', {
          status: error.response.status,
          data: error.response.data
        });
        
        // Check for specific error messages
        const errorMsg = error.response.data?.message || error.response.data?.error;
        if (errorMsg) {
          throw new Error(errorMsg);
        }
      }
      
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token, 
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};