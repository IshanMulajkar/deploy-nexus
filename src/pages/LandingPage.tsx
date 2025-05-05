import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import AnimatedLogo from '../components/ui/AnimatedLogo';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';

const LandingPage = () => {
  const [showIntro, setShowIntro] = useState(true);
  
  useEffect(() => {
    // Always show intro animation
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      {showIntro ? (
        <AnimatedLogo onAnimationComplete={() => setShowIntro(false)} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-gray-900"
        >
          <Header />
          <Hero />
          <Features />
        </motion.div>
      )}
    </>
  );
};

export default LandingPage;