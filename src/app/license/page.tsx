import React from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { STRUCTURED_DATA } from '@/lib/structured-data-constants';

export const metadata = {
  title: 'Lisensinformasjon - TegnOgFarge.no',
  description: 'Informasjon om lisens og bruksrettigheter for fargeleggingsark fra TegnOgFarge.no',
};

export default function LicensePage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Lisensinformasjon</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Bruk av fargeleggingsark</h2>
          <p className="mb-4">
            Alle fargeleggingsark fra TegnOgFarge.no er lisensiert under en Creative Commons Navngivelse-Ikkekommersiell 4.0 Internasjonal Lisens 
            (CC BY-NC 4.0), med mindre annet er spesifisert.
          </p>
          <p className="mb-4">
            Dette betyr at du fritt kan:
          </p>
          <ul className="list-disc pl-8 mb-4">
            <li>Dele - kopiere og videreformidle materialet i ethvert medium eller format</li>
            <li>Bearbeide - remixe, endre, og bygge videre på materialet</li>
          </ul>
          <p className="mb-4">
            Under følgende vilkår:
          </p>
          <ul className="list-disc pl-8 mb-4">
            <li>
              <strong>Navngivelse</strong> - Du må kreditere TegnOgFarge.no, gjerne med link tilbake til vår nettside.
            </li>
            <li>
              <strong>Ikkekommersiell</strong> - Du kan ikke bruke materialet til kommersielle formål.
            </li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Kommersielle formål</h2>
          <p className="mb-4">
            Hvis du ønsker å bruke fargeleggingsarkene til kommersielle formål, vennligst kontakt oss på <a href="mailto:kontakt@tegnogfarge.no" className="text-blue-600 hover:underline">kontakt@tegnogfarge.no</a>.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Lisensdetaljer</h2>
          <p className="mb-4">
            For å se fullstendig lisenstekst, besøk: <a 
              href="https://creativecommons.org/licenses/by-nc/4.0/deed.no" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Creative Commons BY-NC 4.0
            </a>
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Copyright</h2>
          <p>
            © {new Date().getFullYear()} TegnOgFarge.no. Alle rettigheter reservert for nettsideinnhold 
            som ikke er fargeleggingsark.
          </p>
        </section>
        
        {/* JSON-LD for License Page */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebPage",
                  "@id": `${STRUCTURED_DATA.ORGANIZATION.URL}/license#webpage`,
                  "url": `${STRUCTURED_DATA.ORGANIZATION.URL}/license`,
                  "name": "Lisensinformasjon - TegnOgFarge.no",
                  "description": "Informasjon om lisens og bruksrettigheter for fargeleggingsark fra TegnOgFarge.no",
                  "isPartOf": {
                    "@id": `${STRUCTURED_DATA.ORGANIZATION.URL}/#website`
                  },
                  "inLanguage": STRUCTURED_DATA.SITE.LANGUAGE,
                  "mainEntity": {
                    "@id": `${STRUCTURED_DATA.ORGANIZATION.URL}/license#license`
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
                        "name": "Lisensinformasjon",
                        "item": `${STRUCTURED_DATA.ORGANIZATION.URL}/license`
                      }
                    ]
                  }
                },
                {
                  "@type": "CreativeWork",
                  "@id": `${STRUCTURED_DATA.ORGANIZATION.URL}/license#license`,
                  "name": "Fargeleggingsark Lisens",
                  "description": "Creative Commons Navngivelse-Ikkekommersiell 4.0 Internasjonal Lisens (CC BY-NC 4.0)",
                  "url": "https://creativecommons.org/licenses/by-nc/4.0/deed.no",
                  "license": "https://creativecommons.org/licenses/by-nc/4.0/deed.no",
                  "copyrightYear": new Date().getFullYear(),
                  "copyrightHolder": {
                    "@id": `${STRUCTURED_DATA.ORGANIZATION.URL}/#organization`
                  },
                  "creator": {
                    "@id": `${STRUCTURED_DATA.ORGANIZATION.URL}/#organization`
                  },
                  "publisher": {
                    "@id": `${STRUCTURED_DATA.ORGANIZATION.URL}/#organization`
                  },
                  "mainEntityOfPage": {
                    "@id": `${STRUCTURED_DATA.ORGANIZATION.URL}/license#webpage`
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