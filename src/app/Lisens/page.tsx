import React from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { STRUCTURED_DATA } from '@/lib/structured-data-constants';

export const metadata: Metadata = {
  title: 'Lisensvilkår | Tegn og Farge',
  description: 'Lisensvilkår for bruk av innhold på Tegn og Farge - fargeleggingsark, bilder og tekst.',
};

async function getLastModifiedDate() {
  try {
    const filePath = path.join(process.cwd(), 'src/app/Lisens/page.tsx');
    const stats = await fs.promises.stat(filePath);
    return stats.mtime;
  } catch (error) {
    console.error('Error getting file stats:', error);
    return new Date(); // Fallback to current date
  }
}

export default async function LicensePage() {
  const lastModified = await getLastModifiedDate();
  const formattedDate = lastModified.toLocaleDateString('nb-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Generate JSON-LD data for license page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${STRUCTURED_DATA.ORGANIZATION.URL}/Lisens`,
    "name": "Lisensvilkår for innhold på Tegn og Farge",
    "description": "Lisensvilkår for bruk av innhold på Tegn og Farge - fargeleggingsark, bilder og tekst.",
    "url": `${STRUCTURED_DATA.ORGANIZATION.URL}/Lisens`,
    "inLanguage": STRUCTURED_DATA.SITE.LANGUAGE,
    "dateModified": lastModified.toISOString(),
    "publisher": {
      "@type": "Organization",
      "name": STRUCTURED_DATA.ORGANIZATION.NAME,
      "url": STRUCTURED_DATA.ORGANIZATION.URL,
      "logo": {
        "@type": "ImageObject",
        "url": STRUCTURED_DATA.ORGANIZATION.LOGO,
        "width": 112,
        "height": 32
      }
    },
    "breadcrumb": {
      "@type": STRUCTURED_DATA.SCHEMA_TYPES.BREADCRUMB,
      "itemListElement": [
        {
          "@type": STRUCTURED_DATA.SCHEMA_TYPES.LIST_ITEM,
          "position": 1,
          "name": "Hjem",
          "item": STRUCTURED_DATA.ORGANIZATION.URL
        },
        {
          "@type": STRUCTURED_DATA.SCHEMA_TYPES.LIST_ITEM,
          "position": 2,
          "name": "Lisensvilkår",
          "item": `${STRUCTURED_DATA.ORGANIZATION.URL}/Lisens`
        }
      ]
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow">
        <div className="max-w-screen-md mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Lisensvilkår for innhold på Tegn og Farge</h1>
          <p className="text-sm text-gray-600 mb-6">
            Sist oppdatert: {formattedDate}
          </p>
          
          <p className="mb-6">
            Alt innhold på Tegn og Farge – inkludert fargeleggingsark, bilder og tekst – er beskyttet av opphavsrett og er kun ment for personlig og ikke-kommersiell bruk. Dette inkluderer bruk i undervisning og av elever.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Tillatt bruk</h2>
          <p className="mb-4">
            Du har lov til å laste ned, skrive ut og dele fargeleggingsark fra tegnogfarge.no for følgende formål:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Bruk i barnehager og skoler, av lærere og elever</li>
            <li>Hjemmeundervisning og privat bruk</li>
            <li>Deling med venner og familie</li>
            <li>Deling på sosiale medier, så lenge det ikke innebærer økonomisk vinning</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">2. Forbudt bruk</h2>
          <p className="mb-4">
            Det er ikke tillatt å bruke innholdet vårt til kommersielle formål, som for eksempel:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Salg eller distribusjon av fargeleggingsark, enten originalt eller redigert</li>
            <li>Bruk i betalte produkter, digitale nedlastinger eller fysisk materiell</li>
            <li>Inkludering i reklame eller markedsføringsmateriell</li>
          </ul>
          <p className="mb-6">
            All kommersiell bruk uten skriftlig tillatelse er forbudt og kan føre til juridiske tiltak.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3. Opphavsrett og eierskap</h2>
          <p className="mb-6">
            Alt innhold eies av Tegn og Farge og er beskyttet av åndsverkloven. Du har ikke rett til å hevde eierskap eller bruke innholdet som ditt eget – hverken i original eller endret form.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">4. Ønsker du å bruke innholdet kommersielt?</h2>
          <p className="mb-6">
            Send en e-post til <a href="mailto:kontakt@tegnogfarge.no" className="text-blue-600 hover:underline">kontakt@tegnogfarge.no</a> dersom du ønsker å bruke vårt innhold på en måte som ikke omfattes av disse vilkårene. Vi vurderer alle henvendelser individuelt.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">5. Endringer i lisensvilkårene</h2>
          <p className="mb-6">
            Tegn og Farge forbeholder seg retten til å oppdatere disse vilkårene ved behov. Du anbefales å lese gjennom vilkårene jevnlig.
          </p>
          
          <div className="mt-12 border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600">
              Dokumentet er gyldig fra: {new Date().toLocaleDateString('nb-NO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Add JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
} 