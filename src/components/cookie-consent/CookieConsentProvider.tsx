'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CookieConsentContextType, CookiePreferences, CookieConsent } from './types';
import { cookieManager } from './cookieManager';

export const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

interface CookieConsentProviderProps {
  children: ReactNode;
}

export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize preferences on mount
  useEffect(() => {
    const storedPreferences = cookieManager.getPreferences();

    if (storedPreferences) {
      setPreferences(storedPreferences);
      setShowBanner(false);
    } else {
      // Don't show banner in development (auto-accepted)
      const isDev = process.env.NODE_ENV === 'development';
      setShowBanner(!isDev);
    }

    // Initialize Google consent mode
    cookieManager.initializeGoogleConsent();

    setIsLoading(false);
  }, []);

  const hasConsent = useCallback((category: keyof CookieConsent): boolean => {
    if (!preferences) return false;
    return preferences.categories[category];
  }, [preferences]);

  const updateConsent = useCallback((categories: Partial<CookieConsent>) => {
    const newPreferences = cookieManager.savePreferences(categories);
    setPreferences(newPreferences);
    setShowBanner(false);
    setShowModal(false);
  }, []);

  const acceptAll = useCallback(() => {
    updateConsent({
      functional: true,
      analytics: true,
      performance: true,
      advertising: true,
    });
  }, [updateConsent]);

  const rejectAll = useCallback(() => {
    updateConsent({
      functional: false,
      analytics: false,
      performance: false,
      advertising: false,
    });
  }, [updateConsent]);

  const openModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const contextValue: CookieConsentContextType = {
    preferences,
    hasConsent,
    updateConsent,
    acceptAll,
    rejectAll,
    showBanner,
    showModal,
    openModal,
    closeModal,
  };

  // Don't render children until we've checked for existing preferences
  if (isLoading) {
    return null;
  }

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}
    </CookieConsentContext.Provider>
  );
}