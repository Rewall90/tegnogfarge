'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [automaticLogin, setAutomaticLogin] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';
  
  // Auto-populate token from URL if present
  useEffect(() => {
    if (token) {
      setVerificationCode(token);
      // Submit the token automatically
      handleVerify(token);
    }
  }, [token]);
  
  // Handle verification submission
  const handleVerify = async (code = verificationCode) => {
    if (!code) {
      setError('Vennligst skriv inn verifiseringskoden');
      return;
    }
    
    setIsVerifying(true);
    setMessage('Verifiserer...');
    setError('');
    
    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: code }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Verifisering mislyktes');
        setIsVerifying(false);
        return;
      }
      
      // Successful verification
      setSuccess(true);
      setMessage('E-postadressen din er bekreftet!');
      
      // If we have user data, we can auto-login
      if (data.user && data.user.email) {
        setVerifiedEmail(data.user.email);
        setAutomaticLogin(true);
        setMessage('E-postadressen din er bekreftet! Logger deg inn automatisk...');
        
        // Wait a second before attempting auto-login to allow state updates
        setTimeout(async () => {
          await attemptAutoLogin(data.user.email);
        }, 1500);
      } else {
        // No user data, redirect to login
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      setError('Det oppstod en feil ved verifisering. Vennligst prøv igjen.');
      setIsVerifying(false);
    }
  };
  
  // Attempt to auto-login after successful verification
  const attemptAutoLogin = async (email: string) => {
    const maxLoginAttempts = 3;
    let loginAttempts = 0;
    let delay = 1000;
    
    const tryLogin = async (): Promise<boolean> => {
      loginAttempts++;
      
      try {
        // Attempt to sign in with special flag for verified email
        const result = await signIn('credentials', {
          redirect: false,
          email: email,
          password: '',  // We don't need password for this special login
          isVerified: 'true'  // Special flag to bypass password check
        });
        
        if (result?.ok) {
          setMessage('Innlogging vellykket! Omdirigerer...');
          
          // Redirect to home page
          setTimeout(() => {
            router.push('/');
          }, 1000);
          
          return true;
        } else {
          // If we have attempts left, try again after a delay
          if (loginAttempts < maxLoginAttempts) {
            delay = delay * 1.5;
            await new Promise(resolve => setTimeout(resolve, delay));
            return tryLogin();
          }
          
          return false;
        }
      } catch (error) {
        // If we have attempts left, try again after a delay
        if (loginAttempts < maxLoginAttempts) {
          delay = delay * 1.5;
          await new Promise(resolve => setTimeout(resolve, delay));
          return tryLogin();
        }
        
        return false;
      }
    };
    
    const loginSuccess = await tryLogin();
    
    if (!loginSuccess) {
      setMessage('E-postadressen din er bekreftet! Logg inn for å fortsette.');
      // Redirect to login page if auto-login fails
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Bekreft e-postadresse</h1>
        
        {!success ? (
          <>
            <p className="text-gray-600 mb-6 text-center">
              Skriv inn verifiseringskoden du mottok på e-post for å bekrefte kontoen din.
            </p>
            
            <div className="mb-4">
              <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-1">
                Verifiseringskode
              </label>
              <input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Skriv inn 6-sifret kode"
                disabled={isVerifying}
              />
            </div>
            
            <button
              onClick={() => handleVerify()}
              disabled={isVerifying}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:bg-blue-400"
            >
              {isVerifying ? 'Verifiserer...' : 'Bekreft e-post'}
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                Mottok du ikke koden?{' '}
                <Link href="/register" className="text-blue-600 hover:underline">
                  Registrer deg på nytt
                </Link>
              </p>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-4 text-green-600 text-5xl flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg mb-4">{message}</p>
            
            {!automaticLogin && (
              <Link 
                href="/login" 
                className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md"
              >
                Logg inn
              </Link>
            )}
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>
            <Link href="/" className="text-blue-600 hover:underline">
              Tilbake til hovedsiden
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 