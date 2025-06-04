'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState('');
  const [isDevMode, setIsDevMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerificationUrl('');

    // Valider passord
    if (formData.password !== formData.confirmPassword) {
      setError('Passordene matcher ikke');
      return;
    }

    if (formData.password.length < 8) {
      setError('Passordet må være minst 8 tegn');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registrering feilet');
      } else {
        // Check if we're in development mode and got a verification URL
        if (window.location.hostname === 'localhost' && data.verificationUrl) {
          setIsDevMode(true);
          setVerificationUrl(data.verificationUrl);
        } else {
          // Redirect to login with verification message
          const loginPath = redirectUrl 
            ? `/login?registered=true&verify=true&redirect=${encodeURIComponent(redirectUrl)}`
            : '/login?registered=true&verify=true';
          
          router.push(loginPath);
        }
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
        <h1 className="text-2xl font-bold text-center mb-6">Opprett konto</h1>
        
        {verificationUrl && isDevMode && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 mb-4 rounded">
            <p className="font-bold">Development Mode</p>
            <p className="mb-2">Registrering vellykket! I produksjon vil en e-post bli sendt til brukeren.</p>
            <p className="mb-2">For testing, klikk på lenken under for å verifisere kontoen:</p>
            <a 
              href={verificationUrl} 
              className="text-blue-600 underline break-all"
              target="_blank" 
              rel="noopener noreferrer"
            >
              {verificationUrl}
            </a>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Navn
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-post
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Minst 8 tegn</p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Bekreft passord
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Oppretter konto...' : 'Opprett konto'}
          </button>
        </form>
        
        <p className="text-center mt-4 text-sm text-gray-600">
          Har du allerede konto?{' '}
          <Link 
            href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login"}
            className="text-blue-600 hover:underline"
          >
            Logg inn her
          </Link>
        </p>
      </div>
    </div>
  );
} 