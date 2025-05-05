import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const headerClasses = `fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
    isScrolled
      ? 'bg-gray-900/90 backdrop-blur-lg border-b border-blue-500/20'
      : 'bg-transparent'
  }`;
  
  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Rocket size={32} className="text-blue-500 mr-2" />
            <span className="text-xl font-orbitron font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              DeployNexus AI
            </span>
          </motion.div>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                location.pathname === '/' ? 'text-blue-500' : 'text-gray-300'
              }`}
            >
              Home
            </Link>
            <Link
              to="/pricing"
              className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                location.pathname === '/pricing' ? 'text-blue-500' : 'text-gray-300'
              }`}
            >
              Pricing
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                    location.pathname === '/dashboard' ? 'text-blue-500' : 'text-gray-300'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                    location.pathname === '/settings' ? 'text-blue-500' : 'text-gray-300'
                  }`}
                >
                  Settings
                </Link>
              </>
            ) : null}
          </nav>
          
          {isAuthenticated ? (
            <Button onClick={logout} variant="secondary" size="sm">
              Logout
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="primary" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
        
        <button
          className="md:hidden text-gray-300 hover:text-white"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="md:hidden bg-gray-900/95 backdrop-blur-lg border-b border-blue-500/20"
        >
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                  location.pathname === '/' ? 'text-blue-500' : 'text-gray-300'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/pricing"
                className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                  location.pathname === '/pricing' ? 'text-blue-500' : 'text-gray-300'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                      location.pathname === '/dashboard' ? 'text-blue-500' : 'text-gray-300'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/settings"
                    className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                      location.pathname === '/settings' ? 'text-blue-500' : 'text-gray-300'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <Button 
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }} 
                    variant="secondary" 
                    size="sm"
                    className="w-full"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Link 
                  to="/auth" 
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button variant="primary" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;