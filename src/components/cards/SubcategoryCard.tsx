'use client';

import React from 'react';
import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { SVG_BLUR_PLACEHOLDER, WEBP_PLACEHOLDER_PATH } from '@/lib/utils';

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

// Extract this function outside the component for memoization benefits
function getDifficultyLabel(difficulty: number | undefined) {
  if (!difficulty) return 'Ukjent';
  if (difficulty <= 2) return '🟢 Enkel';
  if (difficulty === 3) return '🟡 Middels';
  if (difficulty >= 4) return '🔴 Vanskelig';
  return 'Ukjent';
}

// Subcategory card component for better code organization
export function SubcategoryCard({ 
  subcategory, 
  categorySlug,
  isPriority = false
}: { 
  subcategory: Subcategory; 
  categorySlug: string;
  isPriority?: boolean;
}) {
  const imageUrl = subcategory.featuredImage?.url || subcategory.sampleImage?.thumbnailUrl || subcategory.sampleImage?.imageUrl;

  return (
    <article className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow w-4/5 mx-auto">
      <Link 
        href={`/${categorySlug}/${subcategory.slug}`}
        aria-label={`Gå til ${subcategory.title} fargeleggingsark`}
        className="block"
      >
        {imageUrl && (
          <figure className="relative w-full bg-gray-100" style={{ paddingTop: '133.33%' }}>
            <OptimizedImage 
              src={imageUrl || WEBP_PLACEHOLDER_PATH}
              alt={subcategory.featuredImage?.alt || subcategory.sampleImage?.thumbnailAlt || subcategory.sampleImage?.imageAlt || subcategory.title}
              fill
              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 40vw, 25vw"
              className="object-cover"
              isPriority={isPriority}
              rootMargin="300px 0px"
              placeholder="blur"
              blurDataURL={SVG_BLUR_PLACEHOLDER}
            />
          </figure>
        )}
      </Link>
      <div className="p-4">
        <Link 
          href={`/${categorySlug}/${subcategory.slug}`}
          aria-label={`Gå til ${subcategory.title} fargeleggingsark`}
        >
          <h2 className="font-bold text-lg mb-2">{subcategory.title}</h2>
        </Link>
        {subcategory.description && (
          <p className="text-gray-600 text-sm mb-3">{subcategory.description}</p>
        )}
        <footer className="flex items-center justify-between text-sm">
          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
            {getDifficultyLabel(subcategory.difficulty)}
          </span>
          <span className="text-gray-500">
            {subcategory.drawingCount || 0} tegninger
          </span>
        </footer>
      </div>
    </article>
  );
} 