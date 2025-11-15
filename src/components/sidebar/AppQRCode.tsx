import React from 'react';
import Image from 'next/image';

interface AppQRCodeProps {
  appStoreUrl: string;
  size?: number;
}

export function AppQRCode({ appStoreUrl, size = 160 }: AppQRCodeProps) {
  return (
    <div className="flex justify-center items-center p-4 bg-white rounded-lg">
      <a
        href={appStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        aria-label="Last ned Tegn og Farge appen fra App Store - Scan QR kode"
      >
        <Image
          src="/images/qr-code-app.webp"
          alt="QR kode for å laste ned Tegn og Farge app fra App Store - scan med mobilkamera for å åpne appen direkte"
          width={size}
          height={size}
          quality={90}
          priority={false}
          loading="lazy"
          className="w-full h-auto"
        />
      </a>
    </div>
  );
}
