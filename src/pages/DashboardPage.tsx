import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Rocket, Menu, X, Server, FileText, Settings, BarChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTokens } from '../context/TokenContext';
import Button from '../components/ui/Button';
import Particles from '../components/ui/Particles';

const DashboardPage = () => {
  const { user } = useAuth();
  const { tokens, maxTokens, decrementToken } = useTokens();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState('');
  
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };
  
  const handleDeploy = async () => {
    if (!repoUrl || tokens <= 0) return;
    
    setIsDeploying(true);
    
    try {
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 9000));
      
      // Generate a random subdomain
      const randomStr = Math.random().toString(36).substring(2, 8);
      const liveUrl = `https://${randomStr}.deploynexus.app`;
      
      setDeployedUrl(liveUrl);
      decrementToken();
    } catch (error) {
      console.error('Deployment error:', error);
    } finally {
      setIsDeploying(false);
    }
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-gray-900">
      <Particles className="z-0" />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-gray-900/90 backdrop-blur-lg border-b border-blue-500/20 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="mr-4 text-gray-300 hover:text-blue-400 transition-colors"
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="flex items-center">
              <Rocket size={24} className="text-blue-500 mr-2" />
              <span className="text-lg font-orbitron font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                DeployNexus AI
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/settings">
              <Button variant="ghost" size="sm">
                <Settings size={18} className="mr-1" />
                <span>Settings</span>
              </Button>
            </Link>
            
            <div className="flex items-center ml-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-semibold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-gray-800/90 backdrop-blur-lg w-64 border-r border-blue-500/20 transform transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-blue-500/20">
          <div className="flex items-center">
            <Rocket size={24} className="text-blue-500 mr-2" />
            <span className="text-lg font-orbitron font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              DeployNexus
            </span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="text-gray-300 hover:text-blue-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Tokens Remaining</span>
            <span className="text-sm font-medium text-blue-400">{tokens}/{maxTokens}</span>
          </div>
          
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              style={{ width: `${(tokens / maxTokens) * 100}%` }}
            ></div>
          </div>
          
          {tokens < 1 && (
            <Link to="/pricing" className="w-full block mt-3">
              <Button variant="primary" size="sm" className="w-full">
                Get More Tokens
              </Button>
            </Link>
          )}
        </div>
        
        <nav className="p-4 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400"
          >
            <Server size={18} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="#"
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
          >
            <BarChart size={18} />
            <span>Analytics</span>
          </Link>
          <Link
            to="#"
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
          >
            <FileText size={18} />
            <span>Deployment Logs</span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="min-h-screen pt-20 pb-12 px-4 relative z-10">
        <div className="container mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20"
          >
            <h1 className="text-2xl font-semibold text-white">
              Good {getTimeOfDay()}, {user?.username || 'User'}!
            </h1>
            <p className="text-gray-300 mt-1">
              You have {tokens} deployment tokens remaining. Deploy your projects instantly.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-800/60 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Deploy a Project</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="repo-url" className="block text-sm font-medium text-gray-300 mb-1">
                  GitHub Repository URL
                </label>
                <input
                  id="repo-url"
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full px-4 py-2 bg-gray-700/60 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  disabled={isDeploying || tokens <= 0}
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleDeploy}
                  disabled={isDeploying || !repoUrl || tokens <= 0}
                >
                  {isDeploying ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Deploying...</span>
                    </div>
                  ) : (
                    <span className="flex items-center">
                      <Rocket size={16} className="mr-2" />
                      Deploy Project
                    </span>
                  )}
                </Button>
              </div>
              
              {deployedUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
                >
                  <p className="text-white font-medium">Deployment successful! 🚀</p>
                  <p className="text-gray-300 mt-1">
                    Your site is live at:{" "}
                    <a
                      href="#"
                      className="text-blue-400 hover:underline break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {deployedUrl}
                    </a>
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-800/60 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Recent Deployments</h2>
            
            {deployedUrl ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/60 border border-gray-600">
                  <div>
                    <p className="text-white font-medium">{repoUrl.split('/').pop()}</p>
                    <p className="text-gray-400 text-sm">Deployed 1 minute ago</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      Live
                    </span>
                    <a
                      href="#"
                      className="text-blue-400 hover:text-blue-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-6">No deployments yet. Deploy your first project above!</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;