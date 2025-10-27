'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { setVerifiedEmail } from '@/lib/userIdentification';

export function VerificationToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const verified = searchParams.get('verified');
    const error = searchParams.get('error');
    const email = searchParams.get('email');

    // Handle subscription verification
    if (verified === 'success') {
      setMessage('Takk! Ditt abonnement er bekreftet.');
      setIsError(false);
      setIsVisible(true);

      // Store verified email for unique download tracking
      if (email) {
        setVerifiedEmail(email);
        console.log('[VerificationToast] Verified email stored for unique tracking');
      }

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 4000);

      return () => clearTimeout(timer);
    }

    // Handle verification errors
    if (error) {
      setIsError(true);
      switch (error) {
        case 'invalid-token':
          setMessage('Lenken er ugyldig eller utløpt.');
          break;
        case 'missing-token':
          setMessage('Ugyldig bekreftelseslenke.');
          break;
        case 'subscriber-not-found':
          setMessage('Abonnent ikke funnet.');
          break;
        case 'server-error':
          setMessage('Noe gikk galt. Prøv igjen senere.');
          break;
        default:
          setMessage('Noe gikk galt.');
      }
      setIsVisible(true);

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-50 animate-fade-in"
        onClick={() => setIsVisible(false)}
      />

      {/* Centered Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
        <div
          className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center pointer-events-auto animate-scale-in"
          role="alert"
          aria-live="polite"
        >
          {/* Icon */}
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isError ? 'bg-red-100' : 'bg-green-100'
          }`}>
            {isError ? (
              // Error Icon (X)
              <svg
                className="w-8 h-8 text-red-600"
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
            ) : (
              // Success Icon (Checkmark)
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>

          {/* Message */}
          <h3 className={`text-xl font-bold mb-2 ${
            isError ? 'text-red-900' : 'text-gray-900'
          }`}>
            {isError ? 'Oops!' : 'Suksess!'}
          </h3>
          <p className="text-gray-600 mb-6">{message}</p>

          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isError
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-[#E76F51] hover:bg-[#d35f41] text-white'
            }`}
          >
            Lukk
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
