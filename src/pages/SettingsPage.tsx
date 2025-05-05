import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTokens } from '../context/TokenContext';
import Button from '../components/ui/Button';
import Particles from '../components/ui/Particles';

const SettingsPage = () => {
  const { user } = useAuth();
  const { tokens, maxTokens } = useTokens();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || 'user');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900">
      <Particles className="z-0" />
      
      <div className="container mx-auto py-12 px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link to="/dashboard" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors">
              <ArrowLeft size={16} className="mr-1" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/60 backdrop-blur-lg rounded-xl p-8 border border-blue-500/20"
          >
            <h1 className="text-2xl font-semibold text-white mb-6">Settings</h1>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-medium text-white mb-4">Profile Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700/60 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700/60 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>
                  
                  <div>
                    <p className="block text-sm font-medium text-gray-300 mb-2">
                      Role
                    </p>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="role"
                          value="user"
                          checked={role === 'user'}
                          onChange={() => setRole('user')}
                          className="mr-2"
                        />
                        <span className="text-gray-300">User</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="role"
                          value="developer"
                          checked={role === 'developer'}
                          onChange={() => setRole('developer')}
                          className="mr-2"
                        />
                        <span className="text-gray-300">Developer</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-medium text-white mb-4">Token Usage</h2>
                
                <div className="bg-gray-700/40 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Tokens Remaining</span>
                    <span className="text-blue-400 font-medium">{tokens}/{maxTokens}</span>
                  </div>
                  
                  <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                      style={{ width: `${(tokens / maxTokens) * 100}%` }}
                    ></div>
                  </div>
                  
                  <Link to="/pricing" className="text-blue-400 hover:text-blue-300 text-sm">
                    Need more tokens? View pricing plans →
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center justify-end">
                {saveSuccess && (
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mr-4 text-green-400"
                  >
                    Settings saved successfully!
                  </motion.p>
                )}
                
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;