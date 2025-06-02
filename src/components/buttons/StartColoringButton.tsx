'use client'

import React from 'react';
import { useRouter } from 'next/navigation';

interface StartColoringButtonProps {
  drawingId: string;
  title?: string;
  className?: string;
}

export function StartColoringButton({ drawingId, title = 'Online Coloring', className }: StartColoringButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('coloringAppImageId', drawingId);
      router.push('/coloring-app');
    }
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={title}
      onClick={handleClick}
    >
      {title}
    </button>
  );
} 