'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const redirectUrl = redirectParam ? decodeURIComponent(redirectParam) : '/';
  const registered = searchParams.get('registered');
  const verify = searchParams.get('verify');
  const verified = searchParams.get('verified');
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error === 'E-post ikke bekreftet. Sjekk innboksen din for bekreftelseslenke.' 
          ? 'E-post ikke bekreftet. Sjekk innboksen din for bekreftelseslenke.' 
          : 'Feil e-post eller passord');
      } else {
        router.push(redirectUrl);
      }
    } catch (error) {
      setError('En feil oppstod. Prøv igjen senere.');
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
          
          <button
            type="submit"
            disabled={isLoading}
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