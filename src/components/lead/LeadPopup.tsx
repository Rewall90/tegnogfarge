'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import type { Campaign } from '@/lib/campaignService';
import { CTAButton } from './CTAButton';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface LeadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onSubmit: (email: string) => Promise<void>;
  downloadUrl?: string | null;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function LeadPopup({
  isOpen,
  onClose,
  campaign,
  onSubmit,
  downloadUrl,
}: LeadPopupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Don't render if not open or no campaign
  if (!isOpen || !campaign) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Basic email validation
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Vennligst skriv inn en gyldig e-postadresse');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      await onSubmit(email);
      setStatus('success');
      // Don't auto-close - user will manually click download button
    } catch (error) {
      setStatus('error');
      setErrorMessage('Noe gikk galt. Prøv igjen senere.');
      console.error('[LeadPopup] Submit error:', error);
    }
  };

  const handleClose = () => {
    if (status === 'loading') return; // Don't allow close while submitting
    onClose();
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="lead-popup-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen px-4 py-4">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          aria-hidden="true"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-md">
          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={status === 'loading'}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10"
            aria-label="Lukk"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Content */}
          <div className="bg-white px-6 pt-6 pb-4 sm:p-8">
            <div className="text-center">
              {/* Headline */}
              <h2
                className="text-2xl sm:text-3xl font-bold text-[#264653] mb-3"
                id="lead-popup-title"
              >
                {campaign.content.headline}
              </h2>

              {/* Description */}
              <p className="text-base sm:text-lg text-gray-600 mb-6">
                {campaign.content.description}
              </p>

              {/* Optional Campaign Image */}
              {campaign.content.imageUrl && (
                <figure className="w-full max-w-sm mx-auto mb-6">
                  <Image
                    src={campaign.content.imageUrl}
                    alt={campaign.content.imageAlt || 'Kampanjebilde'}
                    width={400}
                    height={300}
                    className="w-full h-auto"
                    sizes="(max-width: 448px) 90vw, 400px"
                  />
                </figure>
              )}

              {/* Form */}
              {status !== 'success' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Input */}
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="din@epost.no"
                    className={`w-full py-2 px-4 border-2 rounded-md placeholder:text-[#264653]/70 ${
                      status === 'error' ? 'border-red-500' : 'border-[#2EC4B6]'
                    }`}
                    required
                    disabled={status === 'loading'}
                    aria-label="E-postadresse"
                    style={{
                      color: '#264653',
                      borderColor: status === 'error' ? '#ef4444' : '#2EC4B6',
                      caretColor: '#264653',
                      outline: 'none',
                      boxShadow: 'none',
                    }}
                  />

                  {/* Error Message */}
                  {status === 'error' && errorMessage && (
                    <p className="text-sm text-red-600 text-left">
                      {errorMessage}
                    </p>
                  )}

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Submit Button with Configurable Animation */}
                    <CTAButton
                      type="submit"
                      text={campaign.content.ctaText}
                      loading={status === 'loading'}
                      disabled={status === 'loading'}
                      enablePulse={campaign.styling?.buttonPulse ?? false}
                    />

                    {/* Dismiss Button */}
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={status === 'loading'}
                      className="inline-flex justify-center items-center rounded-lg border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {campaign.content.dismissText}
                    </button>
                  </div>
                </form>
              ) : (
                /* Success Message - Thank You Page */
                <div className="py-4 space-y-6">
                  <div>
                    <div className="text-green-600 text-4xl mb-3">✓</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {campaign.content.thankYouHeadline || 'Velkommen!'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {campaign.content.thankYouDescription || 'Sjekk innboksen din for å bekrefte abonnementet.'}
                    </p>
                  </div>

                  {/* Download Button */}
                  {downloadUrl && (
                    <button
                      onClick={handleDownload}
                      className="w-full inline-flex justify-center items-center rounded-lg shadow-lg px-8 py-4 bg-[#2EC4B6] text-lg font-bold text-white hover:bg-[#27a89a] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2EC4B6] transition-all duration-200"
                    >
                      {campaign.content.thankYouButtonText || 'Ta meg til tegningen'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 text-center">
            <p className="text-xs text-gray-500">
              Vi respekterer personvernet ditt. Du kan melde deg av når som helst.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
