"use client";

import React from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-heading mb-6">Om Oss</h1>
          
          <section className="mb-8">
            <h2 className="text-section mb-4">Vår historie</h2>
            <p className="text-body mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id dolor id nibh ultricies 
              vehicula ut id elit. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
            </p>
            <p className="text-body mb-4">
              Vi startet vår reise i 2023 med en enkel idé: å skape et inspirerende nettsted dedikert til 
              fargelegging og kreativ utfoldelse for alle aldersgrupper. Det som begynte som en liten 
              hobbyside har nå vokst til et fellesskap av kreative sjeler som deler sin lidenskap for kunst.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-section mb-4">Vårt team</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-display text-xl font-medium text-center">Petter Olsen</h3>
                <p className="text-body text-gray-600 text-center mb-3">Grunnlegger & Kreativ Leder</p>
                <p className="text-body text-gray-700">
                  Med bakgrunn i grafisk design og en lidenskap for kunst, leder Petter teamet vårt 
                  med kreativ visjon og teknisk kunnskap.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-display text-xl font-medium text-center">Anna Hansen</h3>
                <p className="text-body text-gray-600 text-center mb-3">Innholdsskaper</p>
                <p className="text-body text-gray-700">
                  Anna er vår ekspert på fargeleggingsteknikker og skaper det meste av vårt 
                  pedagogiske innhold. Hun har bakgrunn som kunstlærer.
                </p>
              </div>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-section mb-4">Vår misjon</h2>
            <p className="text-body mb-4">
              Vi tror på kraften i kreativ utfoldelse og hvordan det kan berike livet. Vår misjon er å:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="text-body mb-2">Tilby høykvalitets fargeleggingsressurser for alle aldersgrupper</li>
              <li className="text-body mb-2">Dele kunnskap og teknikker for å forbedre kreative ferdigheter</li>
              <li className="text-body mb-2">Bygge et støttende fellesskap for kreative entusiaster</li>
              <li className="text-body mb-2">Fremme fargelegging som en måte å redusere stress og fremme mindfulness</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-section mb-4">Kontakt oss</h2>
            <p className="text-body mb-4">
              Har du spørsmål eller tilbakemeldinger? Vi vil gjerne høre fra deg!
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-body mb-2"><strong>E-post:</strong> kontakt@eksempel.no</p>
              <p className="text-body mb-2"><strong>Telefon:</strong> +47 123 45 678</p>
              <p className="text-body"><strong>Adresse:</strong> Eksempelgata 123, 0000 Oslo, Norge</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
} 