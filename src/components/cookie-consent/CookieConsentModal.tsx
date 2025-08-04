'use client';

import React, { useState, useEffect } from 'react';
import { useCookieConsent } from './useCookieConsent';
import { COOKIE_CATEGORIES, CookieConsent } from './types';

export function CookieConsentModal() {
  const { showModal, closeModal, updateConsent, preferences, rejectAll, acceptAll } = useCookieConsent();
  const [selectedCategories, setSelectedCategories] = useState<CookieConsent>({
    necessary: true,
    functional: false,
    analytics: false,
    performance: false,
    advertising: false,
  });
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  // Update local state when preferences change
  useEffect(() => {
    if (preferences) {
      setSelectedCategories(preferences.categories);
    }
  }, [preferences]);

  if (!showModal) return null;

  const handleCategoryToggle = (categoryId: keyof CookieConsent) => {
    if (categoryId === 'necessary') return; // Can't toggle necessary cookies
    
    setSelectedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleSavePreferences = () => {
    updateConsent(selectedCategories);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="cookie-modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-200">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl leading-6 font-semibold text-[#264653]" id="cookie-modal-title">
                    Tilpass samtykkepreferanser
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 hover:bg-gray-100 transition-colors duration-200"
                    aria-label="Lukk modal"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-4">
                    Vi bruker informasjonskapsler for å hjelpe deg med å navigere effektivt og utføre visse funksjoner. 
                    Du finner detaljert informasjon om alle informasjonskapsler under hver samtykkekategori nedenfor. 
                    Informasjonskapslene som er kategorisert som "Nødvendige" lagres i nettleseren din da de er avgjørende 
                    for å aktivere de grunnleggende funksjonene til nettstedet.
                    {showMoreInfo && (
                      <span>
                        <br /><br />
                        Vi bruker også tredjeparts informasjonskapsler som hjelper oss med å analysere hvordan du bruker denne nettsiden, 
                        lagrer innstillingene dine og angir innhold og annonser som er relevante for deg. Disse informasjonskapslene vil kun 
                        bli lagret i nettleseren din med ditt forhåndssamtykke.
                        <br /><br />
                        Du kan velge å aktivere eller deaktivere noen eller alle disse informasjonskapslene, men deaktivering av noen av dem 
                        kan påvirke nettleseropplevelsen din.
                      </span>
                    )}
                  </p>
                  
                  <button
                    onClick={() => setShowMoreInfo(!showMoreInfo)}
                    className="text-sm text-blue-600 hover:text-blue-800 mb-4 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-blue-500 px-2 py-1 rounded transition-colors duration-200"
                  >
                    {showMoreInfo ? 'Vis mindre' : 'Vis mer'}
                  </button>

                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {COOKIE_CATEGORIES.map((category) => (
                      <div key={category.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-base font-medium text-[#264653] flex items-center gap-2">
                              <span>{category.name}</span>
                            </h4>
                          </div>
                          <div className="ml-3">
                            {category.required ? (
                              <span className="text-sm text-green-700 font-medium bg-green-100 px-2 py-1 rounded-full">Alltid aktiv</span>
                            ) : (
                              <button
                                type="button"
                                className={`${
                                  selectedCategories[category.id as keyof CookieConsent]
                                    ? 'bg-blue-600'
                                    : 'bg-gray-200'
                                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                role="switch"
                                aria-checked={selectedCategories[category.id as keyof CookieConsent]}
                                onClick={() => handleCategoryToggle(category.id as keyof CookieConsent)}
                              >
                                <span
                                  aria-hidden="true"
                                  className={`${
                                    selectedCategories[category.id as keyof CookieConsent]
                                      ? 'translate-x-5'
                                      : 'translate-x-0'
                                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                />
                              </button>
                            )}
                          </div>
                        </div>
                        <details className="mt-2">
                          <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors duration-200 font-medium">
                            Les mer om denne kategorien
                          </summary>
                          <div className="mt-2 text-sm text-gray-600">
                            <p className="mb-3">{category.description}</p>
                            {category.cookies && category.cookies.length > 0 && (
                              <div className="space-y-3">
                                {category.cookies.map((cookie, index) => (
                                  <div key={index} className="bg-white p-3 rounded border border-gray-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                      <div>
                                        <span className="font-medium text-gray-700">Informasjonskapsel:</span>
                                        <div className="text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded mt-1">{cookie.name}</div>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">Varighet:</span>
                                        <div className="text-gray-600">{cookie.duration}</div>
                                      </div>
                                      {cookie.provider && (
                                        <div>
                                          <span className="font-medium text-gray-700">Leverandør:</span>
                                          <div className="text-gray-600">{cookie.provider}</div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="mt-2">
                                      <span className="font-medium text-gray-700">Beskrivelse:</span>
                                      <div className="text-gray-600 mt-1">{cookie.description}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="button"
              onClick={acceptAll}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#FF6F59] text-base font-medium text-white hover:bg-[#e55a43] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
            >
              Aksepter alt
            </button>
            <button
              type="button"
              onClick={handleSavePreferences}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
            >
              Lagre mine preferanser
            </button>
            <button
              type="button"
              onClick={rejectAll}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
            >
              Avvis
            </button>
          </div>
          
          <div className="bg-white px-4 pb-4 sm:px-6 sm:pb-6 text-center">
            <p className="text-xs text-gray-500">
              Utviklet av{' '}
              <a 
                href="https://tegnogfarge.no" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-[#264653] hover:text-[#2EC4B6]"
              >
                TegnOgFarge
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}