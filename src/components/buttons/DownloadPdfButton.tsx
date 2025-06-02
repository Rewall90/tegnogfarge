import React from 'react';
import Button from '../ui/Button';

interface DownloadPdfButtonProps {
  downloadUrl: string;
  title?: string;
  className?: string;
}

export function DownloadPdfButton({ downloadUrl, title = 'Last ned PDF', className }: DownloadPdfButtonProps) {
  return (
    <Button
      href={downloadUrl}
      variant="primary"
      className={className}
      ariaLabel={title}
      external={false}
    >
      {title}
    </Button>
  );
} 