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
    // Track analytics event
    if (analyticsData) {
      // Fire and forget - don't wait for completion
      trackStartColoring({
        imageId: analyticsData.imageId,
        imageTitle: analyticsData.imageTitle,
        category: analyticsData.category,
        subcategory: analyticsData.subcategory,
      });
    }

    // Small delay to allow the tracking request to be sent
    // This ensures the API call isn't cancelled by navigation
    await new Promise(resolve => setTimeout(resolve, 100));

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