'use client';

import React from 'react';
import Button from '../ui/Button';

interface ButtonHeroSectionProps {
  className?: string;
  dailyDrawingUrl?: string;
}

export function ButtonHeroSection({ className, dailyDrawingUrl }: ButtonHeroSectionProps) {
  // Use daily drawing URL if provided, otherwise fallback to default
  const buttonUrl = dailyDrawingUrl || '/dyr/fargelegg-katter/katt-hopper-og-leker-med-ball';

  return (
    <div className={`flex justify-center mt-8 max-w-md mx-auto ${className}`}>
      <Button
        href={buttonUrl}
        variant="hero"
        size="2xl"
        ariaLabel="Fargelegg Dagens Motiv"
      >
        Fargelegg Dagens Motiv
      </Button>
    </div>
  );
} 