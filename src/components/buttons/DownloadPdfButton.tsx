'use client';

import React from 'react';
import Button from '../ui/Button';
import { trackPdfDownload } from '@/lib/analytics';

interface DownloadPdfButtonProps {
  downloadUrl: string;
  title?: string;
  className?: string;
  // Analytics tracking data (optional)
  analyticsData?: {
    imageId: string;
    imageTitle: string;
    category: string;
    subcategory: string;
  };
}

export function DownloadPdfButton({
  downloadUrl,
  title = 'Last ned PDF',
  className,
  analyticsData
}: DownloadPdfButtonProps) {
  const handleDownload = () => {
    // Track download event if analytics data is provided
    if (analyticsData) {
      trackPdfDownload({
        imageId: analyticsData.imageId,
        imageTitle: analyticsData.imageTitle,
        category: analyticsData.category,
        subcategory: analyticsData.subcategory,
      });
    }
  };

  return (
    <Button
      href={downloadUrl}
      onClick={handleDownload}
      variant="hero"
      size="xl"
      className={className}
      ariaLabel={title}
      external={false}
    >
      {title}
    </Button>
  );
} 