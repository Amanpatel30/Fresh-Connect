import { motion } from 'framer-motion';

export default function VegetableIllustration() {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        <div className="absolute -inset-4 bg-green-500/20 rounded-full blur-3xl" />
        <img 
          src="/vegetables-illustration.svg" // You'll need to add this image
          alt="Fresh Vegetables"
          className="w-full h-auto relative z-10"
        />
      </motion.div>
    </div>
  );
} 