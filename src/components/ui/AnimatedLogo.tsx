import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

interface AnimatedLogoProps {
  onAnimationComplete?: () => void;
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ onAnimationComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Particle settings
    const particlesArray: Particle[] = [];
    const numberOfParticles = 100;
    
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.color = `hsl(${Math.random() * 60 + 200}, 100%, 70%)`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.size > 0.2) this.size -= 0.1;
        
        // Wrap around screen edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      
      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    }
    
    function init() {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }
    
    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      requestAnimationFrame(animate);
    }
    
    init();
    animate();
    
    const timeout = setTimeout(() => {
      onAnimationComplete && onAnimationComplete();
    }, 5000);
    
    // Clean up
    return () => {
      clearTimeout(timeout);
    };
  }, [onAnimationComplete]);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900">
      <canvas ref={canvasRef} className="absolute inset-0"></canvas>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
        className="flex flex-col items-center z-10"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
            transition: { repeat: Infinity, duration: 4 },
          }}
        >
          <Rocket size={64} className="text-blue-500 mb-4" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="text-4xl md:text-6xl font-orbitron font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600"
        >
          DeployNexus AI
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="mt-2 text-xl text-blue-300"
        >
          Launch websites instantly
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AnimatedLogo;