"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
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
  
  return (
    <footer className="bg-[#264653] text-white py-10">
      <div className="container mx-auto px-4">
        {/* Logo and Newsletter Signup */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-12">
          <div className="mb-8 md:mb-0">
            <Link href="/" className="font-display font-bold text-2xl" aria-label="Til forsiden">
              Logo
            </Link>
            <p className="mt-4 mb-4 max-w-md text-body">
              Bli med på vårt nyhetsbrev for å holde deg oppdatert om funksjoner og nyheter.
            </p>
            
            {status === 'success' ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded">
                <p>{message}</p>
              </div>
            ) : (
              <form className="flex flex-col" onSubmit={handleNewsletterSubmit}>
                <div className="flex mb-2">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Skriv inn e-posten din" 
                    className="border border-gray-700 px-4 py-2 rounded-l focus:outline-none w-full max-w-xs"
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
                    } text-button px-4 py-2 rounded-r flex items-center`}
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
                  <p className="text-red-600 text-sm">{message}</p>
                )}
                
                <p className="text-xs mt-2">
                  Ved å klikke på dette, bekrefter du at du er over 16 år.
                </p>
              </form>
            )}
          </div>
          
          {/* Footer Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-display font-semibold mb-4">Om oss</h3>
              <ul className="space-y-2">
                <li><Link href="/skribent" className="hover:underline">Om skribenten</Link></li>
                <li><Link href="#" className="hover:underline">Lenke To</Link></li>
                <li><Link href="#" className="hover:underline">Lenke Tre</Link></li>
                <li><Link href="#" className="hover:underline">Lenke Fire</Link></li>
                <li><Link href="#" className="hover:underline">Lenke Fem</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-semibold mb-4">Kolonne To</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:underline">Lenke Seks</Link></li>
                <li><Link href="#" className="hover:underline">Lenke Syv</Link></li>
                <li><Link href="#" className="hover:underline">Lenke Åtte</Link></li>
                <li><Link href="#" className="hover:underline">Lenke Ni</Link></li>
                <li><Link href="#" className="hover:underline">Lenke Ti</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-semibold mb-4">Følg oss</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-6">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </span>
                  <Link href="#" className="ml-2 hover:underline">Facebook</Link>
                </li>
                <li className="flex items-center">
                  <span className="w-6">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </span>
                  <Link href="#" className="ml-2 hover:underline">Instagram</Link>
                </li>
                <li className="flex items-center">
                  <span className="w-6">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                    </svg>
                  </span>
                  <Link href="#" className="ml-2 hover:underline">X</Link>
                </li>
                <li className="flex items-center">
                  <span className="w-6">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </span>
                  <Link href="#" className="ml-2 hover:underline">LinkedIn</Link>
                </li>
                <li className="flex items-center">
                  <span className="w-6">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </span>
                  <Link href="#" className="ml-2 hover:underline">YouTube</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Copyright and Legal Links */}
        <div className="border-t border-gray-700 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-300 mb-4 md:mb-0">
              &copy; {currentYear} Fargelegg. Alle rettigheter reservert.
            </p>
            <nav aria-label="Juridisk informasjon">
              <ul className="flex flex-wrap space-x-4 text-sm">
                <li><Link href="#" className="text-gray-300 hover:underline">Personvernerklæring</Link></li>
                <li><Link href="/Lisens" className="text-gray-300 hover:underline">Lisensvilkår</Link></li>
                <li><Link href="/skribent" className="text-gray-300 hover:underline">Om skribenten</Link></li>
                <li><Link href="#" className="text-gray-300 hover:underline">Innstillinger for informasjonskapsler</Link></li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
} 