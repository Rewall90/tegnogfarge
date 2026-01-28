"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { authStatusTranslations } from '@/i18n/translations/authStatus';
import { headerTranslations } from '@/i18n/translations/header';

interface MobileMenuProps {
  locale?: string;
}

export default function MobileMenu({ locale = 'no' }: MobileMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sessionData = useSession();
  const session = sessionData?.data;
  const t = authStatusTranslations[locale as 'no' | 'sv' | 'de'] || authStatusTranslations.no;
  const ht = headerTranslations[locale as 'no' | 'sv' | 'de'] || headerTranslations.no;

  const mobileLinkClasses = "text-[#264653] hover:text-[#FF6F59] text-lg relative inline-block after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-[#FF6F59] after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100 transition-transform duration-200 hover:-translate-y-[2px]";

  // URL slug mapping for Swedish and German locales
  const urlMapping: Record<string, Record<string, string>> = {
    '/alle-underkategorier': { no: '/alle-underkategorier', sv: '/alla-underkategorier', de: '/alle-unterkategorien' },
    '/hoved-kategori': { no: '/hoved-kategori', sv: '/huvudkategori', de: '/hauptkategorie' },
    '/om-oss': { no: '/om-oss', sv: '/om-oss', de: '/om-oss' },
  };

  // Helper function to create locale-aware hrefs with correct slugs
  const getLocalizedHref = (path: string) => {
    const localizedPath = urlMapping[path]?.[locale] || path;
    return locale === 'no' ? localizedPath : `/${locale}${localizedPath}`;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: getLocalizedHref('/') });
  };

  return (
    <>
      <div className="md:hidden">
        <button 
          type="button" 
          className="text-gray-600 hover:text-gray-900"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? (locale === 'de' ? 'Menü schließen' : locale === 'sv' ? 'Stäng meny' : 'Lukk meny') : (locale === 'de' ? 'Menü öffnen' : locale === 'sv' ? 'Öppna meny' : 'Åpne meny')}
          aria-controls="mobile-menu"
        >
          <svg 
            className="h-8 w-8" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      
      {isMenuOpen && (
        <div id="mobile-menu" className="md:hidden absolute top-24 left-0 right-0 bg-[#FEFAF6] shadow-md z-50">
          <div className="container mx-auto px-4 py-4 border-t">
            <nav className="flex flex-col space-y-4" aria-label={ht.mainNav}>
              <Link href={getLocalizedHref('/alle-underkategorier')} className={mobileLinkClasses}>{ht.coloringPages}</Link>
              {session && (
                <Link href="/dashboard" className={mobileLinkClasses}>Dashboard</Link>
              )}

              <Link href={getLocalizedHref('/hoved-kategori')} className={mobileLinkClasses}>{ht.categories}</Link>
              <Link href={getLocalizedHref('/om-oss')} className={mobileLinkClasses}>{ht.aboutUs}</Link>
              
              <div className="border-t my-4"></div>

              {session && session.user ? (
                <div className="flex flex-col space-y-4">
                  <span className="text-[#264653] text-lg">{t.greeting}, {session.user.name}</span>
                  <button
                    onClick={handleSignOut}
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 w-full text-center text-lg"
                  >
                    {t.logout}
                  </button>
                </div>
              ) : (
                <Link href="/login" className="bg-[#EB7060] text-black px-4 py-2 rounded hover:bg-[#EB7060]/90 inline-block w-full text-center text-lg">
                  {t.loginRegister}
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
} 