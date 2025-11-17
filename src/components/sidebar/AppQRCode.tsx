import React from 'react';
import Image from 'next/image';

interface AppQRCodeProps {
  appStoreUrl: string;
  size?: number;
  ariaLabel: string;
  qrAlt: string;
}

export function AppQRCode({ appStoreUrl, size = 160, ariaLabel, qrAlt }: AppQRCodeProps) {
  return (
    <div className="flex justify-center items-center p-4 bg-white rounded-lg">
      <a
        href={appStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        aria-label={ariaLabel}
      >
        <Image
          src="/images/qr-code-app.webp"
          alt={qrAlt}
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
