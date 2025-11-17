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
  downloadCount?: number;
  completionCount?: number;
}

export function DrawingDetail({
  drawing,
  difficultyColors,
  difficultyLabels,
  ageRangeLabels,
  customComponents,
  downloadCount = 0,
  completionCount = 0,
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
                alt={drawing.imageAlt || drawing.fallbackImageAlt || drawing.title}
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

          {/* Engagement Funnel - Real-time from database */}
          {(downloadCount > 0 || completionCount > 0) && (
            <div className="mt-4 space-y-2">
              {/* PDF Download Counter (Offline/Physical Coloring) */}
              {downloadCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span className="font-medium">
                    📄 {downloadCount.toLocaleString('nb-NO')} {downloadCount === 1 ? 'person' : 'personer'} har lastet ned PDF
                  </span>
                </div>
              )}

              {/* Online Coloring Completion Counter */}
              {completionCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    />
                  </svg>
                  <span className="font-medium">
                    🎨 {completionCount.toLocaleString('nb-NO')} {completionCount === 1 ? 'person' : 'personer'} har fargelagt online
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Button Section */}
      <div className="my-8 flex justify-center items-center flex-col sm:flex-row gap-10">
        {drawing.downloadUrl && (
          <DownloadPdfButton
            downloadUrl={drawing.downloadUrl}
            title="Last ned Bilde"
            analyticsData={{
              imageId: drawing._id,
              imageTitle: drawing.title,
              category: drawing.category?.title || 'Ukjent',
              subcategory: drawing.subcategory?.title || 'Ukjent',
            }}
          />
        )}
        {drawing.hasDigitalColoring && drawing._id && (
          <StartColoringButton
            drawingId={drawing._id}
            title="Start Fargelegging"
            analyticsData={{
              imageId: drawing._id,
              imageTitle: drawing.title,
              category: drawing.category?.title || 'Ukjent',
              subcategory: drawing.subcategory?.title || 'Ukjent',
            }}
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