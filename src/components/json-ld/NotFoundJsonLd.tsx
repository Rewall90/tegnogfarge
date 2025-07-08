import { STRUCTURED_DATA } from '@/lib/structured-data-constants';

export default function NotFoundJsonLd() {
  const baseUrl = STRUCTURED_DATA.ORGANIZATION.URL;
  const currentUrl = `${baseUrl}/404`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": currentUrl,
        "url": currentUrl,
        "name": "Siden ble ikke funnet - 404",
        "description": "Siden du leter etter eksisterer ikke eller har blitt flyttet. Bruk søket for å finne fargeleggingsark.",
        "inLanguage": STRUCTURED_DATA.SITE.LANGUAGE,
        "isPartOf": {
          "@id": `${baseUrl}/#website`
        },
        "publisher": {
          "@id": `${baseUrl}/#organization`
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${baseUrl}/search?q={search_term_string}`,
            "actionPlatform": [
              "https://schema.org/DesktopWebPlatform",
              "https://schema.org/MobileWebPlatform"
            ]
          },
          "query-input": "required name=search_term_string"
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Hjem",
              "item": baseUrl
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "404 - Siden ikke funnet"
            }
          ]
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
} 