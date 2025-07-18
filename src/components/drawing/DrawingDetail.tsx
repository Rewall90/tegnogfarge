import React from 'react';
import Image from 'next/image';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import { DownloadPdfButton } from '@/components/buttons/DownloadPdfButton';
import { StartColoringButton } from '@/components/buttons/StartColoringButton';
import { WEBP_PLACEHOLDER_PATH, formatDate } from '@/lib/utils';
import type { Drawing } from '@/types';

interface DrawingDetailProps {
  drawing: Drawing;
  difficultyColors: Record<string, string>;
  difficultyLabels: Record<string, string>;
  ageRangeLabels: Record<string, string>;
  customComponents: PortableTextComponents;
}

export function DrawingDetail({
  drawing,
  difficultyColors,
  difficultyLabels,
  ageRangeLabels,
  customComponents,
}: DrawingDetailProps) {
  // Helper function to get difficulty key safely
  const getDifficultyKey = (value: string | undefined): 'easy' | 'medium' | 'hard' => {
    if (value === 'easy' || value === 'medium' || value === 'hard') return value;
    return 'medium';
  };
  
  return (
    <div className="flex-grow md:w-3/4 lg:w-3/4">
      <div className="flex flex-col md:flex-row">
        {/* Left: Image */}
        <div className="md:w-1/2 flex justify-center items-center">
          {(drawing.imageUrl || drawing.fallbackImageUrl) && (
            <div className="relative w-full max-w-[450px] min-h-[600px]">
              <Image
                src={drawing.imageUrl || drawing.fallbackImageUrl || WEBP_PLACEHOLDER_PATH}
                alt={drawing.title}
                priority
                fill
                style={{ objectFit: 'contain' }}
                className="rounded-xl"
                sizes="(max-width: 768px) 85vw, (max-width: 1024px) 40vw, 33vw"
                placeholder="blur"
                blurDataURL={drawing.imageLqip || drawing.fallbackImageLqip}
              />
            </div>
          )}
        </div>
        {/* Right: Info */}
        <div className="md:w-1/2 md:pl-8 mt-8 md:mt-0 flex flex-col">
          <h1 className="font-display font-bold text-4xl text-navy mb-4">{drawing.title}</h1>
          <div className="mb-4">
            <p className="text-lg text-gray-600">
              {formatDate(drawing.publishedDate || drawing._createdAt || new Date().toISOString())}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {drawing.difficulty && (
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${difficultyColors[getDifficultyKey(drawing.difficulty)]}`}>
                {difficultyLabels[getDifficultyKey(drawing.difficulty)]}
              </span>
            )}
            {drawing.recommendedAgeRange && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                {ageRangeLabels[drawing.recommendedAgeRange] || drawing.recommendedAgeRange}
              </span>
            )}
          </div>
          
          <p className="text-navy text-base">{drawing.description}</p>
        </div>
      </div>
      
      {/* New Button Section */}
      <div className="my-8 flex justify-center items-center flex-col sm:flex-row gap-10">
        {drawing.downloadUrl && (
          <DownloadPdfButton
            downloadUrl={drawing.downloadUrl}
            title="Last ned Bilde"
          />
        )}
        {drawing.hasDigitalColoring && drawing._id && (
          <StartColoringButton
            drawingId={drawing._id}
            title="Start Fargelegging"
          />
        )}
      </div>

      {/* Rich Text Content */}
      {drawing.contextContent && (
        <div className="mt-8">
          <PortableText value={drawing.contextContent} components={customComponents} />
        </div>
      )}
    </div>
  );
} 