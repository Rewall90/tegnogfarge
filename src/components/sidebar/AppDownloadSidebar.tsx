import React from 'react';
import { AppQRCode } from './AppQRCode';

interface AppDownloadSidebarProps {
  appStoreUrl?: string;
}

export function AppDownloadSidebar({
  appStoreUrl = 'https://apps.apple.com/no/app/tegn-farge/id6755291484?l=nb',
}: AppDownloadSidebarProps) {
  return (
    <aside className="w-full md:w-1/4 lg:w-1/4 md:pl-8 mt-8 md:mt-0">
      <div className="sticky top-24">
        <div className="bg-[#FDF2EC] border border-[#2EC4B6]/20 rounded-lg p-6 shadow-sm">
          {/* Header */}
          <div className="mb-6 text-center">
            <h3 className="font-display font-bold text-xl text-[#264653] mb-2">
              Prøv appen vår!
            </h3>
            <p className="text-[#264653] text-sm">
              Scan QR-koden for å laste ned appen
            </p>
          </div>

          {/* QR Code */}
          <div className="mb-6">
            <AppQRCode appStoreUrl={appStoreUrl} size={160} />
          </div>

          {/* Call to Action List */}
          <div className="mb-6">
            <h4 className="font-display font-bold text-lg text-[#264653] mb-3">
              Hjelp oss teste!
            </h4>
            <p className="text-[#264653] text-sm mb-3 italic">
              Vi utvikler appen sammen med deg
            </p>
            <ul className="space-y-2">
              <li className="flex items-start text-[#264653]">
                <span className="text-[#2EC4B6] mr-2">✓</span>
                <span className="text-sm">Bli testbruker</span>
              </li>
              <li className="flex items-start text-[#264653]">
                <span className="text-[#2EC4B6] mr-2">✓</span>
                <span className="text-sm">Gi tilbakemelding</span>
              </li>
              <li className="flex items-start text-[#264653]">
                <span className="text-[#2EC4B6] mr-2">✓</span>
                <span className="text-sm">Påvirk utviklingen</span>
              </li>
            </ul>
          </div>

          {/* App Store Button (for desktop users) */}
          <div className="text-center">
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#FF6F59] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#FF6F59]/90 transition-colors text-sm"
            >
              Besøk App Store
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
