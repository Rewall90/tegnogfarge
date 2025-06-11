'use client';

import React from 'react';
import Button from '../ui/Button'; // Assuming a reusable Button component exists

interface ButtonHeroSectionProps {
  className?: string;
}

export function ButtonHeroSection({ className }: ButtonHeroSectionProps) {
  const handleClick = () => {
    // Link functionality will be added later
    console.log("Button clicked!");
  };

  return (
    <div className={`flex justify-center mt-8 max-w-md mx-auto ${className}`}>
      <Button
        onClick={handleClick}
        variant="hero"
        size="lg"
        ariaLabel="Start Fargelegging"
      >
        Start Fargelegging
      </Button>
    </div>
  );
} 