'use client';

import React from 'react';
import { useCookieConsent } from './useCookieConsent';

export function CookieSettingsButton() {
  const { preferences, openModal } = useCookieConsent();

  // Only show the button if user has already given consent
  if (!preferences || !preferences.consentGiven) return null;

  return (
    <button
      onClick={openModal}
      className="fixed bottom-6 left-6 z-40 p-3 bg-[#FF6F59] text-white rounded-full shadow-lg hover:bg-[#e55a43] hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Åpne cookie-innstillinger"
      title="Cookie-innstillinger"
    >
      <svg 
        className="w-6 h-6" 
        fill="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <circle cx="8" cy="10" r="1.5"/>
        <circle cx="12" cy="8" r="1"/>
        <circle cx="16" cy="10" r="1.5"/>
        <circle cx="15" cy="14" r="1"/>
        <circle cx="9" cy="14" r="1"/>
        <path d="M12 16.5c-1.38 0-2.5-1.12-2.5-2.5h1c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5h1c0 1.38-1.12 2.5-2.5 2.5z"/>
      </svg>
    </button>
  );
}