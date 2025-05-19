import React, { useState, useEffect, useRef } from 'react';
import './Tooltip.css';

const Tooltip = ({ children, content, position = 'right', className = '' }) => {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);
  const containerRef = useRef(null);

  const updatePosition = () => {
    if (!containerRef.current || !tooltipRef.current || !isVisible) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = containerRect.top + scrollY - tooltipRect.height - 10;
        left = containerRect.left + scrollX + (containerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = containerRect.bottom + scrollY + 10;
        left = containerRect.left + scrollX + (containerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = containerRect.top + scrollY + (containerRect.height / 2) - (tooltipRect.height / 2);
        left = containerRect.left + scrollX - tooltipRect.width - 10;
        break;
      case 'right':
      default:
        top = containerRect.top + scrollY + (containerRect.height / 2) - (tooltipRect.height / 2);
        left = containerRect.right + scrollX + 10;
        break;
    }

    // Prevent tooltip from going off screen
    const padding = 10;
    const maxLeft = window.innerWidth - tooltipRect.width - padding;
    const maxTop = window.innerHeight - tooltipRect.height - padding;

    left = Math.max(padding, Math.min(left, maxLeft));
    top = Math.max(padding, Math.min(top, maxTop));

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible]);

  return (
    <div 
      className={`tooltip-container ${className}`}
      ref={containerRef}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`tooltip-text tooltip-${position}`}
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip; 