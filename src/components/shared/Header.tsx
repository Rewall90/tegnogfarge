"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className="bg-white shadow-sm py-2">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center">
            <Link href="/" className="flex items-center" aria-label="Til forsiden">
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
            <Link href="/coloring" className="text-gray-600 hover:text-gray-900 text-lg">Fargelegging Verktøy</Link>
            {session && (
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-lg">Dashboard</Link>
            )}
            <Link href="/blog" className="text-gray-600 hover:text-gray-900 text-lg">Blogg Artikler</Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 text-lg">Om Oss</Link>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            {session && session.user ? (
              <>
                <span className="text-gray-600 text-lg">Hei, {session.user.name}</span>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900 text-lg"
                >
                  Logg ut
                </button>
              </>
            ) : (
              <Link href="/login" className="bg-black text-white px-5 py-2.5 rounded hover:bg-gray-800 text-lg">
                Logg inn
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
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
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4" aria-label="Mobilnavigasjon">
              <Link href="/coloring" className="text-gray-600 hover:text-gray-900 text-lg">Fargelegging Verktøy</Link>
              {session && (
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-lg">Dashboard</Link>
              )}
              <Link href="/blog" className="text-gray-600 hover:text-gray-900 text-lg">Blogg Artikler</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 text-lg">Om Oss</Link>
              
              {session && session.user ? (
                <>
                  <span className="text-gray-600 text-lg">Hei, {session.user.name}</span>
                  <button
                    onClick={handleSignOut}
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 w-full text-center text-lg"
                  >
                    Logg ut
                  </button>
                </>
              ) : (
                <Link href="/login" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 inline-block w-full text-center text-lg">
                  Logg inn
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 