import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useTokens } from '../context/TokenContext';
import Particles from '../components/ui/Particles';

interface PricingPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  tokens: number;
  features: string[];
}

const PricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { addTokens } = useTokens();
  const navigate = useNavigate();
  
  const plans: PricingPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      duration: '3 months',
      price: 9.99,
      tokens: 15,
      features: [
        '15 deployment tokens',
        'Basic analytics',
        'Email support',
        'Free SSL certificates',
        'Custom domains',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      duration: '6 months',
      price: 19.99,
      tokens: 40,
      features: [
        '40 deployment tokens',
        'Advanced analytics',
        'Priority email support',
        'Free SSL certificates',
        'Custom domains',
        'Staging environments',
        'Automated backups',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      duration: '12 months',
      price: 39.99,
      tokens: 100,
      features: [
        '100 deployment tokens',
        'Enterprise analytics',
        '24/7 phone & email support',
        'Free SSL certificates',
        'Custom domains',
        'Staging environments',
        'Automated backups',
        'Dedicated resources',
        'SLA guarantees',
      ],
    },
  ];
  
  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
  };
  
  const handlePurchase = () => {
    if (!selectedPlan) return;
    
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;
    
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    // Simulate purchase
    addTokens(plan.tokens);
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gray-900">
      <Particles className="z-0" />
      <Header />
      
      <div className="container mx-auto py-16 px-4 pt-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Choose Your Plan
            </span>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Select the perfect plan for your needs. All plans include our core features
            with different token allowances for deployments.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-gray-800/60 backdrop-blur-lg rounded-xl p-6 border transition-all duration-300 ${
                selectedPlan === plan.id
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'border-blue-500/20 hover:border-blue-500/40'
              }`}
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                <p className="text-gray-400 mt-1">{plan.duration}</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400 ml-1">/ {plan.duration}</span>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Check size={16} className="text-blue-500" />
                    </div>
                    <p className="ml-2 text-gray-300">{feature}</p>
                  </div>
                ))}
              </div>
              
              <Button
                variant={selectedPlan === plan.id ? 'primary' : 'outline'}
                onClick={() => handlePlanSelection(plan.id)}
                className="w-full"
              >
                {selectedPlan === plan.id ? 'Selected' : 'Select'}
              </Button>
            </motion.div>
          ))}
        </div>
        
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mt-10"
          >
            <Button variant="primary" size="lg" onClick={handlePurchase}>
              {isAuthenticated ? 'Purchase Plan' : 'Sign In to Continue'}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PricingPage;