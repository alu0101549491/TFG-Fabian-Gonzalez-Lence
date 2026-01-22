// ============================================
// FILE: src/views/components/tooltip/Tooltip.tsx
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import './Tooltip.css';

/**
 * Interface for Tooltip component props.
 */
interface TooltipProps {
  /** Content to show in the tooltip */
  content: React.ReactNode;
  /** Children elements that trigger the tooltip on hover */
  children: React.ReactNode;
  /** Optional delay before showing tooltip (in ms) */
  delay?: number;
}

/**
 * Reusable tooltip component that shows information on hover.
 * Automatically positions itself to stay within viewport.
 */
export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  delay = 200 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  /**
   * Calculates optimal tooltip position to stay within viewport.
   */
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = triggerRect.bottom + 8; // 8px gap below trigger
    let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);

    // Adjust if tooltip goes off right edge
    if (left + tooltipRect.width > viewportWidth - 8) {
      left = viewportWidth - tooltipRect.width - 8;
    }

    // Adjust if tooltip goes off left edge
    if (left < 8) {
      left = 8;
    }

    // If tooltip goes off bottom, show above instead
    if (top + tooltipRect.height > viewportHeight - 8) {
      top = triggerRect.top - tooltipRect.height - 8;
    }

    setPosition({ top, left });
  };

  /**
   * Shows tooltip after delay.
   */
  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  /**
   * Hides tooltip immediately.
   */
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
    setPosition(null);
  };

  /**
   * Recalculate position when tooltip becomes visible.
   */
  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible]);

  /**
   * Cleanup timeout on unmount.
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        className="tooltip-trigger"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="tooltip"
          style={position ? { top: `${position.top}px`, left: `${position.left}px` } : undefined}
        >
          {content}
        </div>
      )}
    </>
  );
};
