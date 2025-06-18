"use client";

import React, { useState } from 'react';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setFeedbackMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setFeedbackMessage(data.message);
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
        setFeedbackMessage(data.error || 'Noe gikk galt.');
      }
    } catch (error) {
      setStatus('error');
      setFeedbackMessage('Kunne ikke koble til serveren. Prøv igjen senere.');
    }
  };
  
  if (status === 'success') {
    return (
      <div className="p-4 text-center bg-green-100 text-green-800 rounded-md">
        <p className="font-semibold">Takk for din henvendelse!</p>
        <p>{feedbackMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mb-20">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Navn</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Ditt navn her..."
          className="mt-1 block w-full px-4 py-3 bg-white border-2 border-[#2EC4B6]/40 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2EC4B6]"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-post</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Din e-postadresse..."
          className="mt-1 block w-full px-4 py-3 bg-white border-2 border-[#2EC4B6]/40 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2EC4B6]"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Melding</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          required
          placeholder="Skriv meldingen din her..."
          className="mt-1 block w-full px-4 py-3 bg-white border-2 border-[#2EC4B6]/40 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2EC4B6]"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-black bg-[#F4D35E] hover:bg-[#E0C24A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2EC4B6] disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Sender...' : 'Send Melding'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-sm text-red-600 text-center">{feedbackMessage}</p>
      )}
    </form>
  );
} 