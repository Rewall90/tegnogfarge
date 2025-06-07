'use client';

import React, { useEffect, useState } from 'react';
import { DrawingCard } from '@/components/cards/DrawingCard';
import { AboveFoldProvider, useAboveFold } from '@/components/ui/AboveFoldProvider';
import { GRID_LAYOUTS } from '@/utils/viewportDetection';
import { Drawing } from '@/types';
import { SVG_BLUR_PLACEHOLDER, WEBP_PLACEHOLDER_PATH } from '@/lib/utils';

interface DrawingGridProps {
  /**
   * Array of drawings to display in the grid
   */
  drawings: Drawing[];
  
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
function DrawingGridInner({ drawings }: DrawingGridProps) {
  const { isAboveFold } = useAboveFold();
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {drawings.map((drawing, index) => {
        const drawingSlug = drawing.slug || drawing._id;
        const href = `/${drawing.categorySlug}/${drawing.subcategorySlug}/${drawingSlug}`;
        
        // The lqip prop is not available on the global Drawing type, so we use the default
        // This can be improved later by updating the global type and relevant queries
        const lqip = SVG_BLUR_PLACEHOLDER; 
        
        return (
          <DrawingCard 
            key={drawing._id}
            title={drawing.title}
            href={href}
            imageUrl={drawing.thumbnailUrl || drawing.imageUrl || WEBP_PLACEHOLDER_PATH}
            imageAlt={drawing.thumbnailAlt || drawing.imageAlt || drawing.title}
            lqip={lqip}
            difficulty={drawing.difficulty}
            isPriority={isAboveFold(index)}
          />
        );
      })}
    </div>
  );
}

/**
 * Grid to display drawing cards with optimized above-the-fold detection
 * This component wraps DrawingGridInner with AboveFoldProvider
 */
export function DrawingGrid({
  drawings,
  gridLayout = GRID_LAYOUTS.compact,
  aboveFoldRows = 2
}: DrawingGridProps) {
  return (
    <AboveFoldProvider
      rows={aboveFoldRows}
      gridLayout={gridLayout}
      defaultCount={8} // Reasonable default for larger grids
    >
      <DrawingGridInner drawings={drawings} />
    </AboveFoldProvider>
  );
} 