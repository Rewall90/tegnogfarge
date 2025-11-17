"use client";

import React, { useState, useRef } from 'react';
import TurnstileWidget, { type TurnstileWidgetRef } from '../contact/TurnstileWidget';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [honeypot, setHoneypot] = useState(''); // Honeypot field - should remain empty
  const [formLoadTime] = useState(() => Date.now()); // Track when form was loaded for time-based validation
  const turnstileRef = useRef<TurnstileWidgetRef>(null); // Reference to Turnstile widget for reset

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    // Validate Turnstile token on client side
    if (!turnstileToken) {
      setStatus('error');
      setMessage('Vennligst fullfør CAPTCHA-verifiseringen.');
      return;
    }

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          'cf-turnstile-response': turnstileToken,
          honeypot,
          formLoadTime,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail(''); // Clear form
        setTurnstileToken('');
        setHoneypot('');
      } else {
        setStatus('error');
        setMessage(data.message);
        setTurnstileToken('');
        turnstileRef.current?.reset(); // Reset widget for retry
      }
    } catch (error) {
      setStatus('error');
      setMessage('Noe gikk galt. Prøv igjen senere.');
      setTurnstileToken('');
      turnstileRef.current?.reset(); // Reset widget for retry
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded">
        <p>{message}</p>
      </div>
    );
  }

  return (
    <form className="w-full space-y-4" onSubmit={handleNewsletterSubmit}>
      <div className="flex justify-center">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Skriv inn e-posten din"
          className="border border-gray-700 px-4 py-3 rounded-l focus:outline-none w-full max-w-lg text-black"
          aria-label="Din e-postadresse"
          required
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          className={`${
            status === 'loading' || !turnstileToken
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#EB7060] hover:bg-[#EB7060]/90 text-black'
          } text-button px-6 py-3 rounded-r flex items-center`}
          aria-label="Abonner på nyhetsbrevet"
          disabled={status === 'loading' || !turnstileToken}
        >
          {status === 'loading' ? (
            <>
              <span className="animate-spin h-4 w-4 border-t-2 border-white rounded-full mr-2"></span>
              Sender...
            </>
          ) : 'Abonner'}
        </button>
      </div>

      {/* Honeypot field - hidden from users, catches bots */}
      <div
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <label htmlFor="newsletter_phone">Phone (optional)</label>
        <input
          type="text"
          id="newsletter_phone"
          name="phone"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Cloudflare Turnstile CAPTCHA */}
      <div className="flex justify-center">
        <TurnstileWidget
          ref={turnstileRef}
          onVerify={(token) => setTurnstileToken(token)}
          onExpire={() => setTurnstileToken('')}
          onError={() => {
            setStatus('error');
            setMessage('CAPTCHA-verifisering mislyktes. Vennligst prøv igjen.');
          }}
          theme="light"
          size="normal"
        />
      </div>

      {status === 'error' && (
        <div className="flex justify-center">
            <p className="text-red-500 text-sm">{message}</p>
        </div>
      )}

    </form>
  );
} 