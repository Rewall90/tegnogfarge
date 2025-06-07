'use client';

import React, { useEffect, useState } from 'react';
import { DrawingCard } from '@/components/cards/DrawingCard';
import { AboveFoldProvider, useAboveFold } from '@/components/ui/AboveFoldProvider';
import { GRID_LAYOUTS } from '@/utils/viewportDetection';
import { Drawing } from '@/types';

interface DrawingGridProps {
  /**
   * Array of drawings to display in the grid
   */
  drawings: Drawing[];
  
  /**
   * Whether to show buttons on the cards
   * @default true
   */
  showButtons?: boolean;
  
  /**
   * Object fit mode for the images
   * @default "cover"
   */
  imageObjectFit?: "cover" | "contain";
  
  /**
   * Grid layout configuration to use
   * @default GRID_LAYOUTS.compact
   */
  gridLayout?: typeof GRID_LAYOUTS.standard;
  
  /**
   * Number of rows to consider as "above the fold"
   * @default 2
   */
  aboveFoldRows?: number;
}

/**
 * Grid to display drawing cards with optimized above-the-fold detection
 */
function DrawingGridInner({
  drawings,
  showButtons = true,
  imageObjectFit = "cover"
}: DrawingGridProps) {
  const { isAboveFold } = useAboveFold();
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {drawings.map((drawing, index) => (
        <DrawingCard 
          key={drawing._id}
          drawing={drawing}
          asLink={true}
          showButtons={showButtons}
          imageObjectFit={imageObjectFit}
          isPriority={isAboveFold(index)}
        />
      ))}
    </div>
  );
}

/**
 * Grid to display drawing cards with optimized above-the-fold detection
 * This component wraps DrawingGridInner with AboveFoldProvider
 */
export function DrawingGrid({
  drawings,
  showButtons = true,
  imageObjectFit = "cover",
  gridLayout = GRID_LAYOUTS.compact,
  aboveFoldRows = 2
}: DrawingGridProps) {
  return (
    <AboveFoldProvider
      rows={aboveFoldRows}
      gridLayout={gridLayout}
      defaultCount={8} // Reasonable default for larger grids
    >
      <DrawingGridInner 
        drawings={drawings}
        showButtons={showButtons}
        imageObjectFit={imageObjectFit}
      />
    </AboveFoldProvider>
  );
} 