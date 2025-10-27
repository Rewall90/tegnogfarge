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

      // Dispatch custom event for lead popup system (includes downloadUrl)
      window.dispatchEvent(
        new CustomEvent('pdf_downloaded', {
          detail: {
            imageId: analyticsData.imageId,
            imageTitle: analyticsData.imageTitle,
            downloadUrl: downloadUrl, // Pass URL so popup can handle download
          },
        })
      );

      console.log('[DownloadButton] pdf_downloaded event dispatched (popup will handle download)', {
        elapsed: `${(performance.now() - startTime).toFixed(2)}ms`,
        downloadUrl
      });
    } else {
      console.warn('[DownloadButton] No analytics data provided - skipping tracking');

      // If no analytics, open PDF directly (no popup gate)
      window.open(downloadUrl, '_blank');
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