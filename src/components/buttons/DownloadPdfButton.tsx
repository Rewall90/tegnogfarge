'use client';

import React from 'react';
import Button from '../ui/Button';
// Note: Analytics tracking removed to avoid conflicts with Ezoic rewarded ads
// The Ezoic Page Rules script now handles the download button click interception

interface DownloadPdfButtonProps {
  downloadUrl: string;
  title?: string;
  className?: string;
  // Analytics tracking data (optional) - currently unused
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
  // No custom click handler - let the Ezoic Page Rules script intercept the click
  // The Ezoic script will:
  // 1. Intercept the click on a[title="Last ned Bilde"]
  // 2. Show the Norwegian rewarded ad disclosure modal
  // 3. Display the rewarded ad
  // 4. Open the download after successful ad completion

  return (
    <Button
      href={downloadUrl}
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