import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

const FoodParticles = () => {
  const particles = useMemo(() => {
    return [...Array(25)].map((_, index) => {
      const randomX = Math.random() * 100;
      const randomY = Math.random() * 100;
      const randomDelay = Math.random() * 4;
      const randomDuration = 20 + Math.random() * 10;
      const randomSize = 24 + Math.random() * 16;
      const randomRotation = Math.random() * 360;

      return {
        id: index,
        x: randomX,
        y: randomY,
        delay: randomDelay,
        duration: randomDuration,
        size: randomSize,
        rotation: randomRotation
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-950"></div>
      
      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          initial={{
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
            scale: 0
          }}
          animate={{
            scale: [0, 1, 1, 0],
            rotate: [0, particle.rotation],
            opacity: [0, 0.7, 0.7, 0]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Leaf 
            className="text-green-500" 
            style={{ 
              width: particle.size,
              height: particle.size,
              filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))'
            }}
          />
        </motion.div>
      ))}

      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-900/30 to-gray-950/50"></div>
    </div>
  );
};

export default FoodParticles;