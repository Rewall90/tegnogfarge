import React from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { STRUCTURED_DATA } from '@/lib/structured-data-constants';
import Image from 'next/image';

export const metadata = {
  title: 'Om Skribenten - TegnOgFarge.no',
  description: 'Informasjon om forfatteren bak fargeleggingsarkene på TegnOgFarge.no',
};

export default function AuthorPage() {
  const authorImageUrl = '/images/author-profile.jpg'; // Placeholder - replace with actual image
  const authorDescription = 'TegnOgFarge.no ble startet av en liten gruppe kreative illustratører med et felles mål: å tilby gratis, høykvalitets fargeleggingsark til barn og voksne. Med bakgrunn i både pedagogikk og design, skaper vi tegninger som både er estetisk tiltalende og utviklingsfremmende.';
  
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Om Skribenten</h1>
        
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="w-full md:w-1/3">
            <div className="rounded-lg overflow-hidden shadow-md">
              <Image 
                src={authorImageUrl} 
                alt="TegnOgFarge Team" 
                width={400} 
                height={400}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="w-full md:w-2/3">
            <h2 className="text-2xl font-semibold mb-4">TegnOgFarge Team</h2>
            <p className="mb-4">
              {authorDescription}
            </p>
            <p className="mb-4">
              Vårt team har sammen flere tiårs erfaring med illustrasjon, og vi er lidenskapelig opptatt av å skape tegninger som stimulerer fantasien og kreativiteten hos barn i alle aldre. Vi tror at fargelegging ikke bare er en morsom aktivitet, men også et verdifullt verktøy for å utvikle finmotorikk, konsentrasjon og estetisk sans.
            </p>
            <p>
              Alle våre fargeleggingsark er nøye utformet med tanke på både estetikk og brukervennlighet. Vi streber etter å tilby et bredt utvalg av motiver som passer for ulike aldersgrupper og interesser, fra enkle tegninger for de minste til mer detaljerte og utfordrende motiver for eldre barn og voksne.
            </p>
          </div>
        </div>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Vår Filosofi</h2>
          <p className="mb-4">
            Vi tror på at alle barn bør ha tilgang til kreative ressurser uavhengig av økonomisk bakgrunn. Derfor er alle våre fargeleggingsark gratis å laste ned og bruke.
          </p>
          <p>
            Vår filosofi er enkel: å skape vakre, engasjerende tegninger som inspirerer til kreativitet og glede. Vi oppdaterer jevnlig nettstedet vårt med nye tegninger, spesielt rundt høytider og sesongbegivenheter.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Kontakt</h2>
          <p>
            Har du spørsmål, kommentarer eller ønsker om spesifikke typer fargeleggingsark? Ikke nøl med å kontakte oss på <a href="mailto:kontakt@tegnogfarge.no" className="text-blue-600 hover:underline">kontakt@tegnogfarge.no</a>.
          </p>
        </section>
        
        {/* JSON-LD for Author Page */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebPage",
                  "@id": `${STRUCTURED_DATA.ORGANIZATION.URL}/skribent#webpage`,
                  "url": `${STRUCTURED_DATA.ORGANIZATION.URL}/skribent`,
                  "name": "Om Skribenten - TegnOgFarge.no",
                  "description": "Informasjon om forfatteren bak fargeleggingsarkene på TegnOgFarge.no",
                  "isPartOf": {
                    "@id": `${STRUCTURED_DATA.ORGANIZATION.URL}/#website`
                  },
                  "inLanguage": STRUCTURED_DATA.SITE.LANGUAGE,
                  "mainEntity": {
                    "@id": `${STRUCTURED_DATA.ORGANIZATION.URL}/skribent#author`
                  },
                  "publisher": {
                    "@id": `${STRUCTURED_DATA.ORGANIZATION.URL}/#organization`
                  },
                  "breadcrumb": {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                      {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Hjem",
                        "item": STRUCTURED_DATA.ORGANIZATION.URL
                      },
                      {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Om Skribenten",
                        "item": `${STRUCTURED_DATA.ORGANIZATION.URL}/skribent`
                      }
                    ]
                  }
                },
                {
                  "@type": "Person",
                  "@id": `${STRUCTURED_DATA.ORGANIZATION.URL}/skribent#author`,
                  "name": "TegnOgFarge Team",
                  "description": authorDescription,
                  "image": {
                    "@type": "ImageObject",
                    "url": `${STRUCTURED_DATA.ORGANIZATION.URL}${authorImageUrl}`,
                    "width": 400,
                    "height": 400,
                    "caption": "TegnOgFarge Team"
                  },
                  "email": "kontakt@tegnogfarge.no",
                  "jobTitle": "Illustratør",
                  "worksFor": {
                    "@id": `${STRUCTURED_DATA.ORGANIZATION.URL}/#organization`
                  },
                  "mainEntityOfPage": {
                    "@id": `${STRUCTURED_DATA.ORGANIZATION.URL}/skribent#webpage`
                  }
                }
              ]
            })
          }}
        />
      </main>
      <Footer />
    </>
  );
} 