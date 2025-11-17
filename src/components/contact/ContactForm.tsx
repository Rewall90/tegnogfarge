"use client";

import React, { useState, useRef, useCallback } from 'react';
import TurnstileWidget, { type TurnstileWidgetRef } from './TurnstileWidget';
import type { ContactFormTranslations } from '@/i18n/translations/contact';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

interface ContactFormProps {
  translations: ContactFormTranslations;
  locale: string;
}

export default function ContactForm({ translations, locale }: ContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [honeypot, setHoneypot] = useState(''); // Honeypot field - should remain empty
  const [formLoadTime] = useState(() => Date.now()); // Track when form was loaded for time-based validation
  const turnstileRef = useRef<TurnstileWidgetRef>(null); // Reference to Turnstile widget for reset

  // Memoized callbacks to prevent re-rendering of TurnstileWidget
  const handleVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleExpire = useCallback(() => {
    setTurnstileToken('');
  }, []);

  const handleError = useCallback(() => {
    setStatus('error');
    setFeedbackMessage(translations.messages.captchaFailed);
  }, [translations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setFeedbackMessage('');

    // Validate Turnstile token on client side
    if (!turnstileToken) {
      setStatus('error');
      setFeedbackMessage(translations.messages.captchaRequired);
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          'cf-turnstile-response': turnstileToken,
          honeypot, // Include honeypot for server-side validation
          formLoadTime, // Include form load time for time-based validation
          locale, // Include locale for server-side error messages and emails
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setFeedbackMessage(data.message);
        setName('');
        setEmail('');
        setMessage('');
        setTurnstileToken('');
        setHoneypot('');
      } else {
        setStatus('error');
        setFeedbackMessage(data.error || translations.messages.genericError);
        setTurnstileToken(''); // Reset token on error
        turnstileRef.current?.reset(); // Reset widget for retry
      }
    } catch (error) {
      setStatus('error');
      setFeedbackMessage(translations.messages.serverError);
      setTurnstileToken(''); // Reset token on error
      turnstileRef.current?.reset(); // Reset widget for retry
    }
  };
  
  if (status === 'success') {
    return (
      <div className="p-4 text-center bg-green-100 text-green-800 rounded-md">
        <p className="font-semibold">{translations.messages.successTitle}</p>
        <p>{feedbackMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mb-20">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">{translations.labels.name}</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder={translations.placeholders.name}
          className="mt-1 block w-full px-4 py-3 bg-white border-2 border-[#2EC4B6]/40 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2EC4B6]"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">{translations.labels.email}</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder={translations.placeholders.email}
          className="mt-1 block w-full px-4 py-3 bg-white border-2 border-[#2EC4B6]/40 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2EC4B6]"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">{translations.labels.message}</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          required
          placeholder={translations.placeholders.message}
          className="mt-1 block w-full px-4 py-3 bg-white border-2 border-[#2EC4B6]/40 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2EC4B6]"
        />
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
        <label htmlFor="phone">Phone (optional)</label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Cloudflare Turnstile CAPTCHA */}
      <div>
        <TurnstileWidget
          ref={turnstileRef}
          onVerify={handleVerify}
          onExpire={handleExpire}
          onError={handleError}
          theme="light"
          size="normal"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={status === 'loading' || !turnstileToken}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-black bg-[#F4D35E] hover:bg-[#E0C24A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2EC4B6] disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? translations.button.sending : translations.button.submit}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-sm text-red-600 text-center">{feedbackMessage}</p>
      )}
    </form>
  );
} 