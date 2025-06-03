'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';

interface DownloadPdfButtonProps {
  downloadUrl: string;
  title?: string;
  className?: string;
}

export function DownloadPdfButton({ downloadUrl, title = 'Last ned PDF', className }: DownloadPdfButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault(); // Stopp standard lenke-oppførsel
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return false;
    }
  };

  // Bruk en vanlig knapp i stedet for Button-komponenten når brukeren ikke er logget inn
  if (!session) {
    return (
      <button
        onClick={handleClick}
        className={className}
        aria-label={title}
      >
        {title}
      </button>
    );
  }

  // Bruker har en aktiv sesjon, så vi kan vise den normale nedlastingslenken
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