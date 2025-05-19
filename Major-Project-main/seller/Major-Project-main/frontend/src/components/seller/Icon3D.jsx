import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const Icon3D = ({ icon: IconComponent, color, isActive, onClick }) => {
  // Memoize the variants to prevent recalculation on every render
  const iconVariants = useMemo(() => ({
    idle: { 
      scale: 1,
      y: 0 
    },
    hover: { 
      scale: 1.08,
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    tap: { 
      scale: 0.95,
      y: 2
    },
    active: { 
      scale: 1.12,
      y: -5 
    }
  }), []);

  // Memoize the styles to prevent object recreation on every render
  const containerStyle = useMemo(() => ({
    backgroundColor: color,
    width: '56px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '18px',
    color: 'white',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    boxShadow: isActive 
      ? `0 12px 20px rgba(0, 0, 0, 0.2), 0 6px 6px rgba(0, 0, 0, 0.1), 0 -2px 0px rgba(255, 255, 255, 0.5) inset`
      : `0 8px 16px rgba(0, 0, 0, 0.15), 0 4px 4px rgba(0, 0, 0, 0.08), 0 -2px 0px rgba(255, 255, 255, 0.5) inset`,
    position: 'relative',
    overflow: 'hidden',
    willChange: 'transform, box-shadow',
    transform: 'translateZ(0)'
  }), [color, isActive]);

  const iconStyle = useMemo(() => ({
    fontSize: '26px',
    position: 'relative',
    zIndex: 2,
    filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2))'
  }), []);

  // Create a highlight effect at the top of the icon
  const highlightStyle = useMemo(() => ({
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '100%',
    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 60%)',
    transform: 'rotate(35deg)',
    zIndex: 1
  }), []);

  // Create a subtle pattern overlay
  const patternStyle = useMemo(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 2px, transparent 2px)',
    backgroundSize: '15px 15px',
    opacity: 0.5,
    zIndex: 1
  }), []);

  return (
    <motion.div
      style={containerStyle}
      onClick={onClick}
      initial="idle"
      animate={isActive ? "active" : "idle"}
      whileHover="hover"
      whileTap="tap"
      variants={iconVariants}
    >
      <div style={highlightStyle} />
      <div style={patternStyle} />
      <div style={iconStyle}>
        <IconComponent />
      </div>
    </motion.div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(Icon3D); 