import React, { useEffect, useRef } from 'react';

interface ParticlesProps {
  className?: string;
}

const Particles: React.FC<ParticlesProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle class
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
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        
        // Blue to purple color palette
        const hue = Math.random() * 60 + 200; // 200-260 range (blue to purple)
        this.color = `hsla(${hue}, 100%, 70%, ${Math.random() * 0.3 + 0.4})`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }
      
      draw() {
        ctx!.fillStyle = this.color;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
        
        // Add glow effect
        ctx!.shadowColor = this.color;
        ctx!.shadowBlur = 10;
        ctx!.shadowOffsetX = 0;
        ctx!.shadowOffsetY = 0;
      }
    }
    
    // Create particles
    const particlesArray: Particle[] = [];
    const particleCount = Math.min(100, (canvas.width * canvas.height) / 8000);
    
    for (let i = 0; i < particleCount; i++) {
      particlesArray.push(new Particle());
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particlesArray.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      // Connect nearby particles with lines
      connectParticles();
      
      requestAnimationFrame(animate);
    };
    
    const connectParticles = () => {
      const maxDistance = 100;
      
      for (let i = 0; i < particlesArray.length; i++) {
        for (let j = i; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            // Calculate opacity based on distance
            const opacity = 1 - distance / maxDistance;
            
            ctx!.beginPath();
            ctx!.strokeStyle = `rgba(100, 200, 255, ${opacity * 0.2})`;
            ctx!.lineWidth = 0.5;
            ctx!.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx!.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx!.stroke();
          }
        }
      }
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
    />
  );
};

export default Particles;