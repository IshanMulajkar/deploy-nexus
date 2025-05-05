import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { TokenProvider } from './context/TokenContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TokenProvider>
          <App />
        </TokenProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);