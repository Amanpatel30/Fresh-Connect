import React, { useEffect, useRef, useState } from 'react';
import { Leaf } from 'lucide-react';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const cursorSize = 40;
  const [isClicking, setIsClicking] = useState(false);
  const [isRightClicking, setIsRightClicking] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    let requestId;
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    // Set initial opacity to 1
    if (cursor) {
      cursor.style.opacity = 1;
    }

    const animate = () => {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      
      cursorX += dx * 0.15; // Slightly reduced speed
      cursorY += dy * 0.15;

      if (cursor) {
        cursor.style.transform = `translate3d(${cursorX - cursorSize/2}px, ${cursorY - cursorSize/2}px, 0)`;
      }

      requestId = requestAnimationFrame(animate);
    };

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Show cursor when mouse moves
      cursor.style.opacity = 1;

      if (!requestId) {
        requestId = requestAnimationFrame(animate);
      }
    };

    const onMouseDown = (e) => {
      // Check if it's right click
      if (e.button === 2) {
        setIsRightClicking(true);
      } else {
        setIsClicking(true);
      }
    };

    const onMouseUp = (e) => {
      if (e.button === 2) {
        setIsRightClicking(false);
      } else {
        setIsClicking(false);
      }
    };

    const onMouseOver = (e) => {
      if (e.target.closest('button, a, input, [role="button"], .clickable')) {
        cursor.classList.add('cursor-hover');
      } else {
        cursor.classList.remove('cursor-hover');
      }
    };

    // Prevent context menu
    const onContextMenu = (e) => {
      e.preventDefault();
    };

    // Add event listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('contextmenu', onContextMenu);

    // Start animation
    requestId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('contextmenu', onContextMenu);
      cancelAnimationFrame(requestId);
    };
  }, []);

  return (
    <div 
      ref={cursorRef}
      className={`custom-cursor ${isClicking ? 'clicking' : ''} ${isRightClicking ? 'right-clicking' : ''}`}
    >
      <Leaf 
        className={`w-5 h-5 text-white transition-transform duration-150 ${
          isClicking ? 'scale-75' : isRightClicking ? 'scale-50 rotate-180' : 'scale-100'
        }`} 
      />
    </div>
  );
};

export default CustomCursor; 