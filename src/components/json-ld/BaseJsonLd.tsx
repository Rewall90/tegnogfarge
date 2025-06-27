import { STRUCTURED_DATA } from '@/lib/structured-data-constants';

export default function BaseJsonLd() {
  const baseUrl = STRUCTURED_DATA.ORGANIZATION.URL;
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": STRUCTURED_DATA.SITE.NAME,
        "description": STRUCTURED_DATA.SITE.DESCRIPTION,
        "inLanguage": STRUCTURED_DATA.SITE.LANGUAGE,
        "publisher": {
          "@id": `${baseUrl}/#organization`
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": STRUCTURED_DATA.SEARCH.ENDPOINT,
          "query-input": `required name=${STRUCTURED_DATA.SEARCH.QUERY_PARAM}`
        },
        "copyrightYear": new Date().getFullYear(),
        "copyrightHolder": {
          "@id": `${baseUrl}/#organization`
        },
        "contentRating": "G"
      },
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": STRUCTURED_DATA.ORGANIZATION.NAME,
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "@id": `${baseUrl}/#logo`,
          "url": STRUCTURED_DATA.ORGANIZATION.LOGO,
          "width": 112,
          "height": 32,
          "caption": STRUCTURED_DATA.ORGANIZATION.NAME
        },
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "NO",
          "addressLocality": "Norge"
        },
        "email": "kontakt@tegnogfarge.no",
        "sameAs": [
          "https://www.facebook.com/tegnogfarge",
          "https://www.instagram.com/tegnogfarge",
          "https://www.youtube.com/@tegnogfarge"
        ],
        "description": "Tegn og Farge tilbyr gratis fargeleggingsark og kreative aktiviteter for barn og voksne.",
        "foundingDate": "2020"
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