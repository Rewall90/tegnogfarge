'use client';

import React from 'react';
import { SubcategoryCard } from '@/components/cards/SubcategoryCard';
import { AboveFoldProvider, useAboveFold } from '@/components/ui/AboveFoldProvider';
import { GRID_LAYOUTS } from '@/utils/viewportDetection';

// Types for better type safety
interface Subcategory {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  icon?: string;
  featuredImage?: { 
    url: string; 
    alt?: string;
  };
  difficulty?: number;
  drawingCount?: number;
  sampleImage?: {
    thumbnailUrl?: string;
    thumbnailAlt?: string;
    imageUrl?: string;
    imageAlt?: string;
  };
}

interface CategoryGridInnerProps {
  subcategories: Subcategory[];
  categorySlug: string;
}

// The inner grid component that consumes the AboveFold context
function CategoryGridInner({ subcategories, categorySlug }: CategoryGridInnerProps) {
  const { isAboveFold } = useAboveFold();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {subcategories.map((subcategory: Subcategory, index: number) => (
        <SubcategoryCard 
          key={subcategory._id}
          subcategory={subcategory} 
          categorySlug={categorySlug} 
          isPriority={isAboveFold(index)} // Use the context to determine priority
        />
      ))}
    </div>
  );
}

// Empty state component
export function EmptyState() {
  return (
    <section className="text-center py-12" aria-labelledby="empty-state-heading">
      <figure className="text-gray-400 mb-4">
        <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </figure>
      <h3 id="empty-state-heading" className="text-lg font-medium text-gray-900 mb-2">Ingen underkategorier ennå</h3>
      <p className="text-gray-500">
        Det er ingen underkategorier tilgjengelig i denne kategorien for øyeblikket.
      </p>
    </section>
  );
}

// Main exported component that wraps the inner grid with the provider
export function CategoryGrid({ 
  subcategories, 
  categorySlug 
}: { 
  subcategories: Subcategory[];
  categorySlug: string; 
}) {
  return (
    <AboveFoldProvider
      rows={2}
      gridLayout={GRID_LAYOUTS.standard}
      defaultCount={8}
    >
      <CategoryGridInner 
        subcategories={subcategories}
        categorySlug={categorySlug}
      />
    </AboveFoldProvider>
  );
} 