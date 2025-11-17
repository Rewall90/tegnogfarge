'use client';

import React from 'react';
import Button from '../ui/Button';

interface ButtonHeroSectionProps {
  className?: string;
  dailyDrawingUrl?: string;
  locale?: string;
  buttonText?: string;
}

export function ButtonHeroSection({ className, dailyDrawingUrl, locale = 'no', buttonText = 'Fargelegg Dagens Motiv' }: ButtonHeroSectionProps) {
  // Use daily drawing URL if provided, otherwise fallback to default
  const buttonUrl = dailyDrawingUrl || '/dyr/fargelegg-katter/katt-hopper-og-leker-med-ball';

  // Add locale prefix if Swedish
  const localizedUrl = locale === 'no' ? buttonUrl : `/${locale}${buttonUrl}`;

  return (
    <div className={`flex justify-center mt-8 max-w-md mx-auto ${className}`}>
      <Button
        href={localizedUrl}
        variant="hero"
        size="2xl"
        ariaLabel={buttonText}
      >
        {buttonText}
      </Button>
    </div>
  );
} 