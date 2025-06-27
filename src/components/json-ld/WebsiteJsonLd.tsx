import { WebSite } from 'schema-dts';
import { STRUCTURED_DATA } from '@/lib/structured-data-constants';

export function WebsiteJsonLd() {
  const baseUrl = STRUCTURED_DATA.ORGANIZATION.URL;
  
  const websiteSchema: WebSite = {
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: `${baseUrl}/`,
    name: STRUCTURED_DATA.ORGANIZATION.NAME,
    publisher: {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: STRUCTURED_DATA.ORGANIZATION.NAME,
      logo: {
        '@type': 'ImageObject',
        url: STRUCTURED_DATA.ORGANIZATION.LOGO,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      query: 'search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
    />
  );
} 