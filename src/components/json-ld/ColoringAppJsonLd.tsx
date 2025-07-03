import { createImageObject } from '@/lib/json-ld-utils';
import { STRUCTURED_DATA } from '@/lib/structured-data-constants';

export default function ColoringAppJsonLd() {
  const baseUrl = STRUCTURED_DATA.ORGANIZATION.URL;
  const appUrl = `${baseUrl}/coloring-app`;
  const appId = `${appUrl}#coloringapp`;
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": appId,
        "name": "Tegn og Farge Digital Fargeleggingsapp",
        "alternateName": "Fargelegg Online",
        "url": appUrl,
        "applicationCategory": "EducationalApplication, EntertainmentApplication",
        "applicationSubCategory": "Coloring App",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "0.00",
          "priceCurrency": "NOK",
          "availability": "https://schema.org/InStock"
        },
        "browserRequirements": "Requires JavaScript. Works best in modern browsers.",
        "softwareVersion": "1.0",
        "fileSize": "800KB",
        "interactivityType": "active",
        "isAccessibleForFree": true,
        "description": "Gratis digital fargeleggingsapp hvor du kan fargelegge hundrevis av fargeleggingsark direkte i nettleseren.",
        "audience": {
          "@type": "PeopleAudience",
          "suggestedMinAge": "3",
          "suggestedMaxAge": "12"
        },
        "contentRating": "G",
        "publisher": {
          "@id": `${baseUrl}/#organization`
        },
        "provider": {
          "@id": `${baseUrl}/#organization`
        },
        "mainEntityOfPage": {
          "@id": appUrl
        },
        "potentialAction": {
          "@type": "UseAction",
          "target": appUrl,
          "expectsAcceptanceOf": {
            "@type": "Offer",
            "price": 0,
            "priceCurrency": "NOK"
          }
        },
        "screenshot": createImageObject(
          `${baseUrl}/images/coloring-app-screenshot.jpg`,
          "Skjermbilde av Tegn og Farge digital fargeleggingsapp",
          { width: 1200, height: 800 },
          "Skjermbilde av Tegn og Farge digital fargeleggingsapp"
        ),
        "featureList": "Fargevalg, penselstørrelser, lagre funksjon, dele funksjon",
        "keywords": "fargelegging, fargeleggingsark, tegning, kreativ, aktivitet for barn, online fargelegging"
      },
      {
        "@type": "WebPage",
        "@id": appUrl,
        "url": appUrl,
        "name": "Fargelegg Online - Digital Fargeleggingsapp for Barn",
        "description": "Gratis digital fargeleggingsapp hvor du kan fargelegge hundrevis av fargeleggingsark direkte i nettleseren.",
        "inLanguage": STRUCTURED_DATA.SITE.LANGUAGE,
        "isPartOf": {
          "@id": `${baseUrl}/#website`
        },
        "mainEntity": {
          "@id": appId
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
              "name": "Fargelegg Online",
              "item": appUrl
            }
          ]
        },
        "audience": {
          "@type": "PeopleAudience",
          "suggestedMinAge": "3",
          "suggestedMaxAge": "12"
        },
        "contentRating": "G",
        "publisher": {
          "@id": `${baseUrl}/#organization`
        },
        "license": STRUCTURED_DATA.LEGAL.LICENSE_URL,
        "potentialAction": [
          {
            "@type": "UseAction",
            "target": appUrl,
            "name": "Start Fargelegging Online"
          }
        ]
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