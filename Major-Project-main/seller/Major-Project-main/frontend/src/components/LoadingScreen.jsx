import React from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

const LoadingScreen = ({ message = 'Loading your experience...' }) => {
  return (
    <div className="fixed inset-0 bg-[#f0fdf4] flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <motion.div 
          className="flex items-center justify-center gap-2 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <span className="text-3xl font-bold text-gray-800">
            FreshConnect
          </span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{ 
                rotate: 360,
                transition: { 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "linear" 
                }
              }}
              className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full"
            />
          </div>
          <p className="text-gray-600 font-medium">{message}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen; 