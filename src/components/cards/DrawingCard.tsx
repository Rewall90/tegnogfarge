import React from 'react';
import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { DownloadPdfButton } from '@/components/buttons/DownloadPdfButton';
import { StartColoringButton } from '@/components/buttons/StartColoringButton';
import { Drawing } from '@/types';
import { SVG_BLUR_PLACEHOLDER, WEBP_PLACEHOLDER_PATH } from '@/lib/utils';

interface DrawingCardProps {
  drawing: Drawing;
  asLink?: boolean;
  showButtons?: boolean;
  imageObjectFit?: "cover" | "contain";
  /**
   * Whether this card's image should be loaded with priority
   * Use for above-the-fold images that are critical for LCP
   * @default false
   */
  isPriority?: boolean;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

const difficultyLabels: Record<string, string> = {
  easy: "Enkel",
  medium: "Middels",
  hard: "Vanskelig",
};

export function DrawingCard({ 
  drawing, 
  asLink = false, 
  showButtons = true,
  imageObjectFit = "cover",
  isPriority = false
}: DrawingCardProps) {

  const content = (
    <>
      {/* Image Container */}
      <div className="relative w-full bg-gray-100" style={{ paddingTop: '133.33%' }}> {/* 3:4 ratio (4/3 * 100%) */}
        <OptimizedImage
          src={drawing.thumbnailUrl || drawing.imageUrl || WEBP_PLACEHOLDER_PATH}
          alt={drawing.thumbnailAlt || drawing.imageAlt || drawing.title}
          fill
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 40vw, 25vw"
          className={`${imageObjectFit === "contain" ? "object-contain" : "object-cover"}`}
          isPriority={isPriority}
          rootMargin="300px 0px" // More aggressive preloading for cards
          placeholder="blur"
          blurDataURL={SVG_BLUR_PLACEHOLDER}
          quality={85}
        />
      </div>
      <div className="p-2">
        <h2 className="font-bold text-sm mb-1">{drawing.title}</h2>
        {drawing.description && <p className="text-gray-600 text-xs mb-2">{drawing.description}</p>}
        <div className="flex items-center justify-between text-xs mb-1">
          {drawing.difficulty && (
            <span className={`px-1.5 py-0.5 rounded text-xs ${difficultyColors[drawing.difficulty]}`}>
              {difficultyLabels[drawing.difficulty]}
            </span>
          )}
          {!drawing.difficulty && (
            <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
              {difficultyLabels.medium}
            </span>
          )}
          {drawing.hasDigitalColoring && showButtons && (
            <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-xs ml-1">Digital</span>
          )}
          {!showButtons && (
            <span className="text-gray-500 text-xs">
              Fargeleggingsside
            </span>
          )}
        </div>
        {showButtons && (
          <div className="flex flex-wrap gap-1">
            {drawing.downloadUrl && (
              <DownloadPdfButton
                downloadUrl={drawing.downloadUrl}
                title="Last ned PDF"
                className="bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 transition text-xs"
              />
            )}
            {drawing.hasDigitalColoring && (
              <StartColoringButton
                drawingId={drawing._id}
                title="Online Fargelegging"
                className="bg-purple-600 text-white px-2 py-1 rounded-md hover:bg-purple-700 transition text-xs"
              />
            )}
          </div>
        )}
      </div>
    </>
  );

  if (asLink && drawing.categorySlug && drawing.subcategorySlug) {
    const drawingSlug = drawing.slug || drawing._id;
    return (
      <Link
        href={`/${drawing.categorySlug}/${drawing.subcategorySlug}/${drawingSlug}`}
        className="bg-white border rounded-md overflow-hidden shadow-xs hover:shadow-sm transition-shadow block"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="bg-white border rounded-md overflow-hidden shadow-xs hover:shadow-sm transition-shadow">
      {content}
    </div>
  );
} 