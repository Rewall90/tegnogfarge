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
    const startTime = performance.now();
    console.log('[DownloadButton] Click handler started', {
      timestamp: new Date().toISOString(),
      hasAnalyticsData: !!analyticsData,
      downloadUrl
    });

    // Prevent default navigation
    e.preventDefault();
    console.log('[DownloadButton] Default prevented', {
      elapsed: `${(performance.now() - startTime).toFixed(2)}ms`
    });

    // Track download event if analytics data is provided
    if (analyticsData) {
      console.log('[DownloadButton] Starting analytics tracking', {
        imageId: analyticsData.imageId,
        imageTitle: analyticsData.imageTitle,
        elapsed: `${(performance.now() - startTime).toFixed(2)}ms`
      });

      // Fire and forget - don't wait for completion
      trackPdfDownload({
        imageId: analyticsData.imageId,
        imageTitle: analyticsData.imageTitle,
        category: analyticsData.category,
        subcategory: analyticsData.subcategory,
      });

      console.log('[DownloadButton] trackPdfDownload called', {
        elapsed: `${(performance.now() - startTime).toFixed(2)}ms`
      });
    } else {
      console.warn('[DownloadButton] No analytics data provided - skipping tracking');
    }

    // Small delay to allow the tracking request to be sent
    // This ensures the API call isn't cancelled by navigation
    console.log('[DownloadButton] Waiting 100ms before navigation...', {
      elapsed: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('[DownloadButton] Delay complete, navigating to PDF', {
      elapsed: `${(performance.now() - startTime).toFixed(2)}ms`,
      url: downloadUrl
    });

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