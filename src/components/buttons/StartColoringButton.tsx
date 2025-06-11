'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Button from '../ui/Button';

interface StartColoringButtonProps {
  drawingId: string;
  title?: string;
  className?: string;
}

export function StartColoringButton({ drawingId, title = 'Start Fargelegging', className }: StartColoringButtonProps) {
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
    <Button
      onClick={handleClick}
      className={className}
      ariaLabel={title}
      variant="outline"
    >
      {title}
    </Button>
  );
} 