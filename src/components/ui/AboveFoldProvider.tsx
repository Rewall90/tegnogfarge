'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAboveFoldItems, GRID_LAYOUTS } from '@/utils/viewportDetection';

/**
 * Context for above-the-fold information
 */
interface AboveFoldContextType {
  /**
   * Number of items that should be considered above the fold
   */
  aboveFoldCount: number;
  
  /**
   * Check if an item is above the fold based on its index
   */
  isAboveFold: (index: number) => boolean;
  
  /**
   * Whether the above-fold calculation has been performed
   */
  isCalculated: boolean;
}

const AboveFoldContext = createContext<AboveFoldContextType>({
  aboveFoldCount: 6, // Default fallback
  isAboveFold: (index: number) => index < 6,
  isCalculated: false,
});

/**
 * Hook to access the above-fold context
 */
export function useAboveFold() {
  return useContext(AboveFoldContext);
}

interface AboveFoldProviderProps {
  /**
   * Children to render
   */
  children: ReactNode;
  
  /**
   * Number of rows to consider as "above the fold"
   * @default 2
   */
  rows?: number;
  
  /**
   * Grid layout configuration to use
   * @default GRID_LAYOUTS.standard
   */
  gridLayout?: typeof GRID_LAYOUTS.standard;
  
  /**
   * Default count to use before calculation completes
   * @default 6
   */
  defaultCount?: number;
}

/**
 * Provider component for above-the-fold detection
 * This is a client component that calculates which items should be
 * considered above the fold based on the current viewport.
 */
export function AboveFoldProvider({
  children,
  rows = 2,
  gridLayout = GRID_LAYOUTS.standard,
  defaultCount = 6,
}: AboveFoldProviderProps) {
  const [aboveFoldCount, setAboveFoldCount] = useState(defaultCount);
  const [isCalculated, setIsCalculated] = useState(false);
  
  useEffect(() => {
    // Calculate optimal above-fold count based on viewport and grid layout
    const { count } = getAboveFoldItems({
      windowWidth: window.innerWidth,
      rows,
      gridLayout,
    });
    
    setAboveFoldCount(count);
    setIsCalculated(true);
    
    // Recalculate on resize
    const handleResize = () => {
      const { count: newCount } = getAboveFoldItems({
        windowWidth: window.innerWidth,
        rows,
        gridLayout,
      });
      setAboveFoldCount(newCount);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [rows, gridLayout]);
  
  const isAboveFold = (index: number) => index < aboveFoldCount;
  
  return (
    <AboveFoldContext.Provider value={{ aboveFoldCount, isAboveFold, isCalculated }}>
      {children}
    </AboveFoldContext.Provider>
  );
} 