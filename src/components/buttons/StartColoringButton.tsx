'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface StartColoringButtonProps {
  drawingId: string;
  title?: string;
  className?: string;
}

export function StartColoringButton({ drawingId, title = 'Online Coloring', className }: StartColoringButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();

  function handleClick() {
    if (!session) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

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