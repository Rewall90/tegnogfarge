"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function MobileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  const mobileLinkClasses = "text-[#264653] hover:text-[#FF6F59] text-lg relative inline-block after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-[#FF6F59] after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100 transition-transform duration-200 hover:-translate-y-[2px]";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <>
      <div className="md:hidden">
        <button 
          type="button" 
          className="text-gray-600 hover:text-gray-900"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Lukk meny" : "Åpne meny"}
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
            <nav className="flex flex-col space-y-4" aria-label="Mobilnavigasjon">
              <Link href="/alle-underkategorier" className={mobileLinkClasses}>Fargeleggingsark</Link>
              {session && (
                <Link href="/dashboard" className={mobileLinkClasses}>Dashboard</Link>
              )}
              
              <Link href="/hoved-kategori" className={mobileLinkClasses}>Kategorier</Link>
              <Link href="/om-oss" className={mobileLinkClasses}>Om Oss</Link>
              
              <div className="border-t my-4"></div>

              {session && session.user ? (
                <div className="flex flex-col space-y-4">
                  <span className="text-[#264653] text-lg">Hei, {session.user.name}</span>
                  <button
                    onClick={handleSignOut}
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 w-full text-center text-lg"
                  >
                    Logg ut
                  </button>
                </div>
              ) : (
                <Link href="/login" className="bg-[#EB7060] text-black px-4 py-2 rounded hover:bg-[#EB7060]/90 inline-block w-full text-center text-lg">
                  Logg inn/Registrer
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
} 