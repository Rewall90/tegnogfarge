import React from 'react';
import Button from '../ui/Button';

interface StartColoringButtonProps {
  drawingId: string;
  title?: string;
  className?: string;
}

export function StartColoringButton({ drawingId, title = 'Start fargelegging', className }: StartColoringButtonProps) {
  return (
    <Button
      href={`/coloring/${drawingId}`}
      variant="secondary"
      className={className}
      ariaLabel={title}
    >
      {title}
    </Button>
  );
} 