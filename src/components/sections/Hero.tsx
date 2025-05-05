import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Particles from '../ui/Particles';

const Hero = () => {
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Launch websites instantly 20× faster, zero hassle.';
  const [index, setIndex] = useState(0);
  
  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + fullText.charAt(index));
        setIndex(index + 1);
      }, 50);
      
      return () => clearTimeout(timeout);
    }
  }, [index, fullText]);
  
  return (
    <div className="relative min-h-screen flex items-center overflow-hidden">
      <Particles className="z-0" />
      
      <div className="container mx-auto px-4 py-16 pt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col space-y-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12 }}
              className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold leading-tight"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                Deploy your site
              </span>
              <br />
              <span className="text-white">at light-speed</span>
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.12 }}
              className="h-16 md:h-24"
            >
              <h2 className="text-xl md:text-2xl lg:text-3xl text-blue-300 font-light">
                {displayText}
                <span className="inline-block w-1 h-5 ml-1 bg-blue-400 animate-blink"></span>
              </h2>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/auth">
                <Button variant="primary" size="lg" className="relative overflow-hidden group">
                  <span className="relative z-10">Free Trial</span>
                  <span className="absolute inset-0 translate-y-[100%] bg-gradient-to-r from-blue-600 to-purple-700 group-hover:translate-y-0 transition-transform duration-300"></span>
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="relative overflow-hidden group">
                  <span className="relative z-10">Go Premium</span>
                  <span className="absolute inset-0 translate-y-[100%] bg-blue-500/20 group-hover:translate-y-0 transition-transform duration-300"></span>
                </Button>
              </Link>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative h-80 md:h-96 lg:h-[500px] w-full flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl backdrop-blur-3xl"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 blur-2xl"></div>
            
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotateZ: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-4/5 h-4/5"
              >
                <div className="w-full h-full bg-gray-800/60 backdrop-blur-lg rounded-lg p-6 border border-blue-500/20">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  
                  <div className="text-sm text-blue-300 font-mono space-y-2">
                    <p>$ deploy-nexus init</p>
                    <p className="text-gray-400">Initializing deployment...</p>
                    <p className="text-gray-400">Scanning repository...</p>
                    <p className="text-gray-400">Optimizing assets...</p>
                    <p className="text-green-400">✓ Deployment complete!</p>
                    <p>$ Your site is live at:</p>
                    <p className="text-blue-400 underline">https://your-project.deployai.app</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;