'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// Set page metadata
function setPageMetadata() {
  if (typeof document !== 'undefined') {
    document.title = 'Avmelding bekreftet | Tegn og Farge';

    // Set or update meta tags
    const setMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMetaTag('robots', 'noindex, nofollow, nocache, noarchive, nosnippet');
    setMetaTag('description', 'Bekreftelse på avmelding fra nyhetsbrev');
  }
}

function UnsubscribeConfirmationContent() {
  const [status, setStatus] = useState<'success' | 'error'>('success');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const result = searchParams.get('status');

  // Set metadata when component mounts
  useEffect(() => {
    setPageMetadata();
  }, []);

  useEffect(() => {
    // Parse the status from URL
    if (result === 'success') {
      setStatus('success');
      setMessage('Du er nå avmeldt fra vårt nyhetsbrev.');
    } else {
      setStatus('error');
      switch (result) {
        case 'invalid-token':
          setMessage('Ugyldig avmeldingslenke.');
          break;
        case 'missing-token':
          setMessage('Ugyldig avmeldingslenke.');
          break;
        case 'not-found':
          setMessage('Abonnement ikke funnet.');
          break;
        case 'error':
          setMessage('Noe gikk galt. Prøv igjen senere.');
          break;
        default:
          setMessage('Noe gikk galt.');
      }
    }
  }, [result]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        {status === 'success' && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-green-100 mb-4">
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
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Du er nå avmeldt</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-6">
              Vi er lei oss for at du forlater oss. Skulle du ombestemme deg,
              kan du enkelt melde deg på igjen ved å besøke vår nettside.
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-[#E76F51] hover:bg-[#d35f41] text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Tilbake til forsiden
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-red-100 mb-4">
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
            </div>
            <h1 className="text-2xl font-bold text-red-900 mb-2">Oops!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-6">
              Hvis du fortsatt ønsker å melde deg av, vennligst kontakt oss direkte.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full bg-[#E76F51] hover:bg-[#d35f41] text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Tilbake til forsiden
              </button>
              <button
                onClick={() => router.push('/kontakt')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Kontakt oss
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Loading fallback component
function UnsubscribeConfirmationLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Laster inn...</h1>
        <p className="text-gray-600">Vennligst vent</p>
      </div>
    </div>
  );
}

export default function UnsubscribeConfirmationPage() {
  return (
    <Suspense fallback={<UnsubscribeConfirmationLoading />}>
      <UnsubscribeConfirmationContent />
    </Suspense>
  );
}
