'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';
import { trackStartColoring } from '@/lib/analytics';

interface StartColoringButtonProps {
  drawingId: string;
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

export function StartColoringButton({
  drawingId,
  title = 'Start Fargelegging',
  className,
  analyticsData
}: StartColoringButtonProps) {
  const router = useRouter();

  async function handleClick() {
    const startTime = performance.now();
    console.log('[StartColoringButton] Click handler started', {
      timestamp: new Date().toISOString(),
      hasAnalyticsData: !!analyticsData,
      drawingId
    });

    // Track analytics event
    if (analyticsData) {
      console.log('[StartColoringButton] Starting analytics tracking', {
        imageId: analyticsData.imageId,
        imageTitle: analyticsData.imageTitle,
        elapsed: `${(performance.now() - startTime).toFixed(2)}ms`
      });

      // Fire and forget - don't wait for completion
      trackStartColoring({
        imageId: analyticsData.imageId,
        imageTitle: analyticsData.imageTitle,
        category: analyticsData.category,
        subcategory: analyticsData.subcategory,
      });

      console.log('[StartColoringButton] trackStartColoring called', {
        elapsed: `${(performance.now() - startTime).toFixed(2)}ms`
      });
    } else {
      console.warn('[StartColoringButton] No analytics data provided - skipping tracking');
    }

    // Small delay to allow the tracking request to be sent
    // This ensures the API call isn't cancelled by navigation
    console.log('[StartColoringButton] Waiting 100ms before navigation...', {
      elapsed: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('[StartColoringButton] Delay complete, navigating to coloring app', {
      elapsed: `${(performance.now() - startTime).toFixed(2)}ms`
    });

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('coloringAppImageId', drawingId);
      router.push('/coloring-app');
    }
  }

  return (
    <Button
      onClick={handleClick}
      className={className}
      ariaLabel={title}
      variant="hero"
      size="xl"
    >
      {title}
    </Button>
  );
} 