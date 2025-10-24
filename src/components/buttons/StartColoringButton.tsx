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

  function handleClick() {
    // Track analytics event
    if (analyticsData) {
      trackStartColoring({
        imageId: analyticsData.imageId,
        imageTitle: analyticsData.imageTitle,
        category: analyticsData.category,
        subcategory: analyticsData.subcategory,
      });
    }

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