import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface TokenContextType {
  tokens: number;
  maxTokens: number;
  decrementToken: () => void;
  addTokens: (count: number) => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [tokens, setTokens] = useState(3); // Free tier starts with 3 tokens
  const [maxTokens, setMaxTokens] = useState(3); // Default max for free tier
  
  useEffect(() => {
    // Load token data from localStorage if available
    if (isAuthenticated) {
      const storedTokens = localStorage.getItem('tokens');
      const storedMaxTokens = localStorage.getItem('maxTokens');
      
      if (storedTokens) {
        setTokens(parseInt(storedTokens));
      }
      
      if (storedMaxTokens) {
        setMaxTokens(parseInt(storedMaxTokens));
      }
    }
  }, [isAuthenticated]);
  
  // Save token data to localStorage whenever they change
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('tokens', tokens.toString());
      localStorage.setItem('maxTokens', maxTokens.toString());
    }
  }, [tokens, maxTokens, isAuthenticated]);
  
  const decrementToken = () => {
    if (tokens > 0) {
      setTokens(tokens - 1);
    }
  };
  
  const addTokens = (count: number) => {
    setTokens(prev => prev + count);
    setMaxTokens(prev => prev + count);
  };
  
  return (
    <TokenContext.Provider
      value={{
        tokens,
        maxTokens,
        decrementToken,
        addTokens,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

export const useTokens = () => {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useTokens must be used within a TokenProvider');
  }
  return context;
};