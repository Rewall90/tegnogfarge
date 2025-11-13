'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import AuthStatus from '../auth/AuthStatus';
import MobileMenu from './MobileMenu';

interface HeaderProps {
  locale?: string;
}

export default function Header({ locale = 'no' }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  // Main categories
  const mainCategories = [
    { name: 'Dyr', slug: 'dyr' },
    { name: 'Natur', slug: 'natur' },
    { name: 'Superhelter', slug: 'superhelter' },
    { name: 'Kjøretøy', slug: 'kjoretoy' },
    { name: 'Vitenskap', slug: 'vitenskap' }
  ];

  const navLinkClasses = "text-[#264653] hover:text-[#FF6F59] text-lg relative after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[3px] after:bg-[#FF6F59] after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100 transition-transform duration-200 hover:-translate-y-[2px]";

  // Helper function to create locale-aware hrefs
  const getLocalizedHref = (path: string) => {
    return locale === 'no' ? path : `/${locale}${path}`;
  };

  return (
    <header className="bg-[#FEFAF6] shadow-sm py-2 relative">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center">
            <Link href={getLocalizedHref('/')} className="flex items-center" aria-label="Til forsiden">
              <Image
                src="/images/logo/tegnogfarge-logo.svg"
                alt="TegnOgFarge.no Logo"
                width={200}
                height={90}
                priority
                className="h-20 w-auto"
              />
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8" aria-label="Hovednavigasjon">
            <Link href={getLocalizedHref('/alle-underkategorier')} className={navLinkClasses}>Fargeleggingsark</Link>
            <Link href={getLocalizedHref('/hoved-kategori')} className={navLinkClasses}>Kategorier</Link>
            <Link href={getLocalizedHref('/om-oss')} className={navLinkClasses}>Om Oss</Link>
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