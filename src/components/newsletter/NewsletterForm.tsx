"use client";

import React, { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail(''); // Clear form
      } else {
        setStatus('error');
        setMessage(data.message);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Noe gikk galt. Prøv igjen senere.');
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
    <form className="w-full" onSubmit={handleNewsletterSubmit}>
      <div className="flex justify-center mb-2">
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
            status === 'loading' 
              ? 'bg-gray-400' 
              : 'bg-[#FF6F59] hover:bg-[#E85A45] text-white'
          } text-button px-6 py-3 rounded-r flex items-center`}
          aria-label="Abonner på nyhetsbrevet"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <>
              <span className="animate-spin h-4 w-4 border-t-2 border-white rounded-full mr-2"></span>
              Sender...
            </>
          ) : 'Abonner'}
        </button>
      </div>
      
      {status === 'error' && (
        <div className="flex justify-center">
            <p className="text-red-500 text-sm">{message}</p>
        </div>
      )}
      
    </form>
  );
} 