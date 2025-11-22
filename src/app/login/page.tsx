'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

// Set page metadata
function setPageMetadata() {
  if (typeof document !== 'undefined') {
    document.title = 'Logg inn | Tegn og Farge';
    
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
    setMetaTag('description', 'Logg inn på din Tegn og Farge konto');
  }
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const redirectUrl = redirectParam ? decodeURIComponent(redirectParam) : '/';
  const registered = searchParams.get('registered');
  const verify = searchParams.get('verify');
  const verified = searchParams.get('verified');
  
  // Set metadata when component mounts
  useEffect(() => {
    setPageMetadata();
  }, []);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(
    verified
      ? 'E-post bekreftet! Du kan nå logge inn.'
      : verify
        ? 'Registrering vellykket! Sjekk e-posten din for å bekrefte kontoen før du logger inn.'
        : registered
          ? 'Registrering vellykket! Du kan nå logge inn.'
          : ''
  );
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Valider CAPTCHA
    if (!turnstileToken) {
      setError('Vennligst fullfør CAPTCHA-verifiseringen');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        turnstileToken,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error === 'E-post ikke bekreftet. Sjekk innboksen din for bekreftelseslenke.'
          ? 'E-post ikke bekreftet. Sjekk innboksen din for bekreftelseslenke.'
          : result.error === 'CAPTCHA-verifisering feilet. Prøv igjen.'
            ? 'CAPTCHA-verifisering feilet. Prøv igjen.'
            : 'Feil e-post eller passord');
        // Reset Turnstile on error
        turnstileRef.current?.reset();
        setTurnstileToken(null);
      } else {
        router.push(redirectUrl);
      }
    } catch {
      setError('En feil oppstod. Prøv igjen senere.');
      // Reset Turnstile on error
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-section text-center mb-6">Logg inn</h1>
        
        {success && (
          <div className={`${verify ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-green-100 border-green-400 text-green-700'} px-4 py-3 mb-4 rounded border`}>
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-post
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Passord
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          {/* Cloudflare Turnstile CAPTCHA */}
          <div className="flex justify-center">
            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY!}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
              onError={() => {
                setTurnstileToken(null);
                setError('CAPTCHA-verifisering feilet. Prøv igjen.');
              }}
              options={{ theme: 'light' }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !turnstileToken}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-button text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Logger inn...' : 'Logg inn'}
          </button>
        </form>
        
        <p className="text-center mt-4 text-sm text-body text-gray-600">
          Har du ikke konto?{' '}
          <Link 
            href={redirectParam ? `/register?redirect=${redirectParam}` : "/register"}
            className="text-blue-600 hover:underline"
          >
            Registrer deg her
          </Link>
        </p>
      </div>
    </div>
  );
}

// Loading fallback component
function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-section mb-6">Laster inn...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-body text-gray-600">Vennligst vent</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
} 