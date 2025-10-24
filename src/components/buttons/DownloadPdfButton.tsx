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
  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent default navigation
    e.preventDefault();

    // Track download event if analytics data is provided
    if (analyticsData) {
      // Fire and forget - don't wait for completion
      trackPdfDownload({
        imageId: analyticsData.imageId,
        imageTitle: analyticsData.imageTitle,
        category: analyticsData.category,
        subcategory: analyticsData.subcategory,
      });
    }

    // Small delay to allow the tracking request to be sent
    // This ensures the API call isn't cancelled by navigation
    await new Promise(resolve => setTimeout(resolve, 100));

    // Now navigate to the download URL
    window.location.href = downloadUrl;
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