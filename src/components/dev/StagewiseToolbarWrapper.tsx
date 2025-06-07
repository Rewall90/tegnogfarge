'use client';

import React, { useEffect, useRef } from 'react';

export default function StagewiseToolbarWrapper() {
  // Use a ref to track initialization status
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only initialize in development mode and if not already initialized
    if (process.env.NODE_ENV === 'development' && !isInitialized.current) {
      // Set flag to prevent multiple initializations
      isInitialized.current = true;
      
      // Dynamically import to avoid issues with SSR
      import('@stagewise/toolbar').then(({ initToolbar }) => {
        try {
          const stagewiseConfig = {
            plugins: []
          };
          
          initToolbar(stagewiseConfig);
        } catch (error) {
          // Prevent errors from breaking the app
          console.warn('Stagewise toolbar initialization error:', error);
        }
      });
    }
  }, []);

  // Return null as this component doesn't render anything
  return null;
} 