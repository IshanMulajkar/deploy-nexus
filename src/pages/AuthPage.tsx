import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Github, Mail } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import Particles from '../components/ui/Particles';

interface SignUpFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'developer';
}

interface SignInFormData {
  email: string;
  password: string;
}

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  
  const signInForm = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const signUpForm = useForm<SignUpFormData>({
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: 'user',
    },
  });
  
  const toggleForm = () => {
    setIsSignIn(!isSignIn);
  };
  
  const onSignInSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSignUpSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      await signup(data.email, data.username, data.password, data.role);
      navigate('/dashboard');
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 relative">
      <Particles className="z-0" />
      <Header />
      
      <div className="container mx-auto py-16 px-4 pt-32 relative z-10">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/60 backdrop-blur-lg rounded-xl p-8 border border-blue-500/20"
          >
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-orbitron font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                {isSignIn ? 'Sign In' : 'Create Account'}
              </h1>
              <p className="text-gray-300 mt-2">
                {isSignIn
                  ? 'Welcome back! Sign in to continue.'
                  : 'Join DeployNexus AI to start deploying.'}
              </p>
            </div>
            
            <div className="flex flex-col gap-4 mb-6">
              <Button variant="secondary" className="flex items-center justify-center gap-2">
                <Github size={18} />
                <span>{isSignIn ? 'Sign in' : 'Sign up'} with GitHub</span>
              </Button>
              <Button variant="secondary" className="flex items-center justify-center gap-2">
                <Mail size={18} />
                <span>{isSignIn ? 'Sign in' : 'Sign up'} with Google</span>
              </Button>
            </div>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="flex-shrink mx-3 text-gray-400">or</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>
            
            {isSignIn ? (
              <form onSubmit={signInForm.handleSubmit(onSignInSubmit)} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...signInForm.register('email', { required: true })}
                    className="w-full px-4 py-2 bg-gray-700/60 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    {...signInForm.register('password', { required: true })}
                    className="w-full px-4 py-2 bg-gray-700/60 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="Enter your password"
                  />
                  <div className="text-right mt-1">
                    <a href="#" className="text-sm text-blue-400 hover:text-blue-300">
                      Forgot password?
                    </a>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...signUpForm.register('email', { required: true })}
                    className="w-full px-4 py-2 bg-gray-700/60 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    {...signUpForm.register('username', { required: true })}
                    className="w-full px-4 py-2 bg-gray-700/60 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="Choose a username"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    {...signUpForm.register('password', { required: true })}
                    className="w-full px-4 py-2 bg-gray-700/60 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="Create a password"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    {...signUpForm.register('confirmPassword', { required: true })}
                    className="w-full px-4 py-2 bg-gray-700/60 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="Confirm your password"
                  />
                </div>
                
                <div>
                  <p className="block text-sm font-medium text-gray-300 mb-2">
                    I am a:
                  </p>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="user"
                        {...signUpForm.register('role')}
                        className="mr-2"
                        defaultChecked
                      />
                      <span className="text-gray-300">User</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="developer"
                        {...signUpForm.register('role')}
                        className="mr-2"
                      />
                      <span className="text-gray-300">Developer</span>
                    </label>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            )}
            
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                {isSignIn ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={toggleForm}
                  className="ml-1 text-blue-400 hover:text-blue-300 focus:outline-none"
                >
                  {isSignIn ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;