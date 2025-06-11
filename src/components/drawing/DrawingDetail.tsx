import React from 'react';
import Image from 'next/image';
import { DownloadPdfButton } from '../buttons/DownloadPdfButton';
import { StartColoringButton } from '../buttons/StartColoringButton';

interface DrawingDetailProps {
  title: string;
  date?: string;
  badge?: string;
  description?: string;
  imageUrl: string;
  downloadUrl?: string;
  drawingId: string;
  hasDigitalColoring?: boolean;
  className?: string;
}

export function DrawingDetail({
  title,
  date,
  badge,
  description,
  imageUrl,
  downloadUrl,
  drawingId,
  hasDigitalColoring,
  className = '',
}: DrawingDetailProps) {
  return (
    <section className={`bg-white rounded-xl shadow-md p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start ${className}`}>
      {/* Bilde */}
      <div className="flex-shrink-0 w-full md:w-[350px] lg:w-[400px] xl:w-[450px] mx-auto">
        <div className="relative w-full aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden border">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 40vw, 25vw"
            priority
          />
        </div>
      </div>
      {/* Info og knapper */}
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-heading mb-2">{title}</h1>
        <div className="text-xs text-gray-400 mb-2 break-all">ID: {drawingId}</div>
        {date && <div className="text-gray-500 text-sm mb-2">{date} update</div>}
        {badge && <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded mb-3">{badge}</span>}
        {description && <p className="text-body mb-6 max-w-xl text-gray-700">{description}</p>}
        <div className="flex flex-wrap gap-4 mt-2">
          {downloadUrl && (
            <DownloadPdfButton downloadUrl={downloadUrl} title="Download PDF" className="bg-orange-500 hover:bg-orange-600 text-white text-button px-6 py-3 rounded transition" />
          )}
          <StartColoringButton drawingId={drawingId} title="Online Coloring" className="bg-orange-500 hover:bg-orange-600 text-white text-button px-6 py-3 rounded transition" />
        </div>
      </div>
    </section>
  );
} 