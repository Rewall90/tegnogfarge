'use client';

import React from 'react';
import Button from '../ui/Button';

interface ButtonHeroSectionProps {
  className?: string;
}

export function ButtonHeroSection({ className }: ButtonHeroSectionProps) {
  return (
    <div className={`flex justify-center mt-8 max-w-md mx-auto ${className}`}>
      <Button
        href="/natur/fargelegg-hostens-motiver/barn-plukker-epler-sammen"
        variant="hero"
        size="2xl"
        ariaLabel="Fargelegg Dagens Motiv"
      >
        Fargelegg Dagens Motiv
      </Button>
    </div>
  );
} 