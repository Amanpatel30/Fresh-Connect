import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, XCircle, Leaf } from 'lucide-react';

const Notification = ({ message, type, isVisible, onClose }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 left-1/2 z-40 w-full max-w-md"
        >
          <motion.div
            className={`relative flex items-center gap-4 p-6 rounded-2xl shadow-lg border backdrop-blur-lg mx-auto
              ${type === 'error' 
                ? 'bg-red-50/90 border-red-200' 
                : 'bg-green-50/90 border-green-200'
              }`}
            whileHover={{ scale: 1.02 }}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <motion.div
                className={`absolute inset-0 opacity-10 ${
                  type === 'error' ? 'bg-red-600' : 'bg-green-600'
                }`}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                  opacity: [0.1, 0.15, 0.1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent" />
            </div>

            {/* Icon */}
            <div className={`relative p-3 rounded-xl ${
              type === 'error' ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {type === 'error' ? (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </motion.div>
            </div>

            {/* Content */}
            <div className="relative">
              <h3 className={`font-semibold mb-1 ${
                type === 'error' ? 'text-red-800' : 'text-green-800'
              }`}>
                {type === 'error' ? 'Access Denied' : 'Welcome Back!'}
              </h3>
              <p className={`text-sm ${
                type === 'error' ? 'text-red-600' : 'text-green-600'
              }`}>
                {message}
              </p>
            </div>

            {/* Logo decoration */}
            <div className="absolute -top-3 -right-3">
              <div className={`p-2 rounded-full ${
                type === 'error' ? 'bg-red-100' : 'bg-green-100'
              }`}>
                <Leaf className={`w-4 h-4 ${
                  type === 'error' ? 'text-red-400' : 'text-green-400'
                }`} />
              </div>
            </div>

            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute -top-2 -right-2 p-1 rounded-full bg-white shadow-md"
            >
              <XCircle className={`w-4 h-4 ${
                type === 'error' ? 'text-red-400' : 'text-green-400'
              }`} />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification; 