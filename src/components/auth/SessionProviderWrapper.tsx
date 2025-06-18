'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

export default function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex flex-col flex-1">{children}</div>
    </SessionProvider>
  );
} 