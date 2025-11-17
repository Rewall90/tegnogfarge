'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import AuthStatus from '../auth/AuthStatus';
import MobileMenu from './MobileMenu';
import { headerTranslations } from '@/i18n/translations/header';
import type { Locale } from '@/i18n';

interface HeaderProps {
  locale?: string;
}

export default function Header({ locale: localeProp }: HeaderProps = {}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const params = useParams();
  const locale = (localeProp || (params?.locale as string) || 'no') as Locale;
  const t = headerTranslations[locale] || headerTranslations.no;

  // Main categories
  const mainCategories = [
    { name: 'Dyr', slug: 'dyr' },
    { name: 'Natur', slug: 'natur' },
    { name: 'Superhelter', slug: 'superhelter' },
    { name: 'Kjøretøy', slug: 'kjoretoy' },
    { name: 'Vitenskap', slug: 'vitenskap' }
  ];

  const navLinkClasses = "text-[#264653] hover:text-[#FF6F59] text-lg relative after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[3px] after:bg-[#FF6F59] after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100 transition-transform duration-200 hover:-translate-y-[2px]";

  // URL slug mapping for Swedish locale
  const urlMapping: Record<string, Record<string, string>> = {
    '/alle-underkategorier': { no: '/alle-underkategorier', sv: '/alla-underkategorier' },
    '/hoved-kategori': { no: '/hoved-kategori', sv: '/huvudkategori' },
    '/om-oss': { no: '/om-oss', sv: '/om-oss' },
  };

  // Helper function to create locale-aware hrefs with correct slugs
  const getLocalizedHref = (path: string) => {
    const localizedPath = urlMapping[path]?.[locale] || path;
    return locale === 'no' ? localizedPath : `/${locale}${localizedPath}`;
  };

  return (
    <header className="bg-[#FEFAF6] shadow-sm py-2 relative">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center">
            <Link href={getLocalizedHref('/')} className="flex items-center" aria-label={t.toHomepage}>
              <Image
                src="/images/logo/tegnogfarge-logo.svg"
                alt={t.logoAlt}
                width={200}
                height={90}
                priority
                className="h-20 w-auto"
              />
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8" aria-label={t.mainNav}>
            <Link href={getLocalizedHref('/alle-underkategorier')} className={navLinkClasses}>{t.coloringPages}</Link>
            <Link href={getLocalizedHref('/hoved-kategori')} className={navLinkClasses}>{t.categories}</Link>
            <Link href={getLocalizedHref('/om-oss')} className={navLinkClasses}>{t.aboutUs}</Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <AuthStatus />
          </div>

          {/* Mobile menu button */}
          <MobileMenu locale={locale} />
        </div>
      </div>
    </header>
  );
} 