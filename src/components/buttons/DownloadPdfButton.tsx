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

  const handleRedirect = () => {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
  };

  return (
    <Button
      href={session ? downloadUrl : undefined}
      onClick={!session ? handleRedirect : undefined}
      variant="hero"
      size="xl"
      className={className}
      ariaLabel={title}
      external={false}
    >
      {title}
    </Button>
  );
} 