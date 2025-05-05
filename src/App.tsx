import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import PricingPage from './pages/PricingPage';
import SettingsPage from './pages/SettingsPage';
import { PrivateRoute } from './components/auth/PrivateRoute';

function App() {
  return (
    <div className="font-sans min-h-screen bg-gray-900 text-white">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;