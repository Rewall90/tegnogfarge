'use client';

import React, { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    try {
      setStatus('loading');
      
      // Make API call to backend endpoint that will use Resend
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Noe gikk galt. Vennligst prøv igjen senere.');
      }
      
      setStatus('success');
      setMessage('Takk for påmeldingen! Sjekk e-posten din for å bekrefte abonnementet.');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Noe gikk galt. Vennligst prøv igjen senere.');
    }
  };

  return (
    <div>
      {status === 'success' ? (
        <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4">
          {message}
        </div>
      ) : (
        <form 
          onSubmit={handleSubmit} 
          className="flex flex-col md:flex-row justify-center" 
          role="form" 
          aria-labelledby="newsletter-heading"
        >
          <label htmlFor="email-input" className="sr-only">Din e-postadresse</label>
          <input 
            id="email-input"
            type="email" 
            placeholder="Skriv inn e-posten din" 
            className="px-4 py-3 mb-2 md:mb-0 md:mr-2 rounded-md w-full md:w-auto md:flex-1 text-black focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button 
            type="submit" 
            className={`px-6 py-3 rounded-md font-medium ${
              status === 'loading' 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-black hover:bg-gray-800'
            } text-white`}
            disabled={status === 'loading'}
            aria-label="Meld deg på nyhetsbrevet"
          >
            {status === 'loading' ? 'Sender...' : 'Meld deg på'}
          </button>
        </form>
      )}
      
      {status === 'error' && (
        <div className="bg-red-100 text-red-800 p-2 rounded-md mt-2 text-sm">
          {message}
        </div>
      )}
    </div>
  );
} 