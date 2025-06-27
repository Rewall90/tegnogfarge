'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// Set page metadata
function setPageMetadata() {
  if (typeof document !== 'undefined') {
    document.title = 'Bekreft nyhetsbrev | Tegn og Farge';
    
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
    setMetaTag('description', 'Bekreft ditt nyhetsbrevabonnement');
  }
}

function VerifyNewsletterContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  // Set metadata when component mounts
  useEffect(() => {
    setPageMetadata();
  }, []);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Ugyldig verifikasjonslenke');
      return;
    }

    const verifyNewsletter = async () => {
      try {
        const response = await fetch('/api/newsletter/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Noe gikk galt. Prøv igjen senere.');
      }
    };

    verifyNewsletter();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Bekrefter abonnement...</h1>
            <p className="text-gray-600">Vennligst vent</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Abonnement bekreftet!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Tilbake til forsiden
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-600 text-6xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Bekreftelse mislyktes</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Tilbake til forsiden
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Loading fallback component
function NewsletterVerificationLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Laster inn...</h1>
        <p className="text-gray-600">Vennligst vent</p>
      </div>
    </div>
  );
}

export default function VerifyNewsletterPage() {
  return (
    <Suspense fallback={<NewsletterVerificationLoading />}>
      <VerifyNewsletterContent />
    </Suspense>
  );
} 