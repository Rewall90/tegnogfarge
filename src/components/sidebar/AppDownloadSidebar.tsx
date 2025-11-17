import React from 'react';
import { AppQRCode } from './AppQRCode';
import { appDownloadTranslations } from '@/i18n/translations/appDownload';
import type { Locale } from '@/i18n';

interface AppDownloadSidebarProps {
  appStoreUrl?: string;
  locale?: Locale;
}

export function AppDownloadSidebar({
  appStoreUrl = 'https://apps.apple.com/no/app/tegn-farge/id6755291484?l=nb',
  locale = 'no',
}: AppDownloadSidebarProps) {
  const t = appDownloadTranslations[locale] || appDownloadTranslations.no;

  return (
    <>
      {/* Header */}
      <div className="mb-6 text-center">
        <h3 className="font-display font-bold text-xl text-[#264653] mb-2">
          {t.header}
        </h3>
        <p className="text-[#264653] text-sm">
          {t.subtitle}
        </p>
      </div>

      {/* QR Code */}
      <div className="mb-6">
        <AppQRCode
          appStoreUrl={appStoreUrl}
          size={160}
          ariaLabel={t.ariaLabel}
          qrAlt={t.qrAlt}
        />
      </div>

      {/* Call to Action List */}
      <div className="mb-6">
        <h4 className="font-display font-bold text-lg text-[#264653] mb-3">
          {t.testHeader}
        </h4>
        <p className="text-[#264653] text-sm mb-3 italic">
          {t.testDescription}
        </p>
        <ul className="space-y-2">
          <li className="flex items-start text-[#264653]">
            <span className="text-[#2EC4B6] mr-2">✓</span>
            <span className="text-sm">{t.features.becomeTester}</span>
          </li>
          <li className="flex items-start text-[#264653]">
            <span className="text-[#2EC4B6] mr-2">✓</span>
            <span className="text-sm">{t.features.giveFeedback}</span>
          </li>
          <li className="flex items-start text-[#264653]">
            <span className="text-[#2EC4B6] mr-2">✓</span>
            <span className="text-sm">{t.features.influenceDevelopment}</span>
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
          {t.button}
        </a>
      </div>
    </>
  );
}
