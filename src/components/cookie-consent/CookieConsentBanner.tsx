'use client';

import React from 'react';
import { useCookieConsent } from './useCookieConsent';

export function CookieConsentBanner() {
  const { showBanner, acceptAll, rejectAll, openModal } = useCookieConsent();

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 p-4 bg-white border border-gray-200 shadow-xl rounded-lg max-w-sm sm:max-w-md animate-slide-up">
      <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#264653] mb-2">
              Vi respekterer personvernet ditt
            </h2>
            <p className="text-sm text-gray-600">
              Vi bruker informasjonskapsler for å forbedre nettleseropplevelsen din, vise personlig tilpassede 
              annonser eller innhold, og analysere trafikken vår. Ved å klikke på "Godta alle", samtykker du 
              til vår bruk av informasjonskapsler.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={acceptAll}
              className="px-4 py-2 text-sm font-medium text-white bg-[#FF6F59] rounded-md hover:bg-[#e55a43] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              aria-label="Aksepter alle informasjonskapsler"
            >
              Aksepter alt
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={openModal}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                aria-label="Tilpass samtykkepreferanser"
              >
                Tilpass
              </button>
              
              <button
                onClick={rejectAll}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                aria-label="Avvis alle informasjonskapsler"
              >
                Avvis
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}