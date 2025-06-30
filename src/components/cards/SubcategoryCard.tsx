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

// Helper to get difficulty label and className
function getDifficultyProps(difficulty: number | undefined): { label: string; className: string } {
  if (difficulty === undefined) {
    return { label: 'Ukjent', className: 'bg-gray-100 text-gray-800' };
  }
  if (difficulty <= 2) {
    return { label: 'Enkel', className: 'bg-green-100 text-green-800' };
  }
  if (difficulty === 3) {
    return { label: 'Middels', className: 'bg-yellow-100 text-yellow-800' };
  }
  if (difficulty >= 4) {
    return { label: 'Vanskelig', className: 'bg-red-100 text-red-800' };
  }
  return { label: 'Ukjent', className: 'bg-gray-100 text-gray-800' };
}

// Subcategory card component for better code organization
export function SubcategoryCard({ 
  subcategory, 
  categorySlug,
  isPriority = false,
  titleClassName = ''
}: { 
  subcategory: Subcategory; 
  categorySlug: string;
  isPriority?: boolean;
  titleClassName?: string;
}) {
  const imageUrl = subcategory.featuredImage?.url || subcategory.sampleImage?.thumbnailUrl || subcategory.sampleImage?.imageUrl;
  const difficultyProps = getDifficultyProps(subcategory.difficulty);

  return (
    <article className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
          <h2 className={`font-display font-bold text-lg mb-2 text-navy ${titleClassName}`}>{subcategory.title}</h2>
        </Link>
        <footer className="flex flex-col items-start gap-2 text-sm">
          <span className={`px-2 py-1 rounded text-xs ${difficultyProps.className}`}>
            {difficultyProps.label}
          </span>
          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
            {subcategory.drawingCount || 0} tegninger
          </span>
        </footer>
      </div>
    </article>
  );
} 