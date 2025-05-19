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
      scale: 1.03,
      y: -2,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: { 
      scale: 0.97,
      y: 1
    },
    active: { 
      scale: 1.05,
      y: -2 
    }
  }), []);

  // Memoize the styles to prevent object recreation on every render
  const containerStyle = useMemo(() => ({
    backgroundColor: color,
    width: '64px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '18px',
    color: 'white',
    transition: 'all 0.25s ease',
    boxShadow: isActive 
      ? '0 8px 16px rgba(0, 0, 0, 0.15)'
      : '0 6px 12px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    willChange: 'transform, box-shadow',
    transform: 'translateZ(0)'
  }), [color, isActive]);

  const iconStyle = useMemo(() => ({
    fontSize: '28px',
    color: 'white',
    filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.15))'
  }), []);

  const topReflectionStyle = useMemo(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0))',
    borderRadius: '18px 18px 0 0',
    zIndex: 1,
  }), []);

  const bottomShadowStyle = useMemo(() => ({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '25%',
    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0))',
    borderRadius: '0 0 18px 18px',
    zIndex: 1,
  }), []);

  return (
    <motion.div
      onClick={onClick}
      variants={iconVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      animate={isActive ? "active" : "idle"}
      className="icon-3d-wrapper"
      style={{
        cursor: 'pointer',
        position: 'relative',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        className={`icon-container ${isActive ? 'icon-active' : ''}`}
        style={containerStyle}
      >
        {/* Icon */}
        <div style={{ 
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <IconComponent style={iconStyle} />
        </div>
        
        {/* Top light reflection */}
        <div style={topReflectionStyle} />
        
        {/* Bottom subtle shadow */}
        <div style={bottomShadowStyle} />
      </div>
    </motion.div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(Icon3D); 