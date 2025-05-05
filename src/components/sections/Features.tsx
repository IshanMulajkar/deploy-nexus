import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Zap, Globe, Shield, BarChart, Code } from 'lucide-react';
import Button from '../ui/Button';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
    >
      <div className="flex flex-col h-full">
        <div className="p-3 rounded-lg bg-blue-500/10 w-fit mb-4">
          {icon}
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-300 mb-6 flex-grow">{description}</p>
        
        <Button variant="ghost" size="sm" className="group w-fit mt-auto">
          <span>Try it</span>
          <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
        </Button>
      </div>
    </motion.div>
  );
};

const Features = () => {
  const featuresData = [
    {
      icon: <Zap size={24} className="text-blue-500" />,
      title: "Instant Deployment",
      description: "Deploy your project in seconds, not hours. Our AI optimizes your build for maximum speed.",
    },
    {
      icon: <Globe size={24} className="text-blue-500" />,
      title: "Global CDN",
      description: "Your site is automatically distributed to our worldwide network for lightning-fast load times.",
    },
    {
      icon: <Shield size={24} className="text-blue-500" />,
      title: "Advanced Security",
      description: "Built-in SSL, DDoS protection, and continuous security scanning keep your projects safe.",
    },
    {
      icon: <BarChart size={24} className="text-blue-500" />,
      title: "Analytics Dashboard",
      description: "Real-time insights into traffic, performance metrics, and user behavior.",
    },
    {
      icon: <Code size={24} className="text-blue-500" />,
      title: "CI/CD Integration",
      description: "Seamlessly connect with GitHub, GitLab, or Bitbucket for automated deployments.",
    },
  ];
  
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px 0px" });
  
  return (
    <section className="py-24 relative overflow-hidden" id="features">
      <div 
        className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-600/5 z-0"
        style={{
          backgroundImage: "radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent 70%)",
        }}
      ></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Supercharge Your Workflow
            </span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Our platform is packed with powerful features to make deployment faster, 
            easier, and more reliable than ever before.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;