import { ProfilePage } from 'schema-dts';
import { STRUCTURED_DATA } from '@/lib/structured-data-constants';

export function AuthorJsonLd() {
  const baseUrl = STRUCTURED_DATA.ORGANIZATION.URL;
  
  const profilePageSchema: ProfilePage = {
    '@type': 'ProfilePage',
    name: `Om ${STRUCTURED_DATA.AUTHOR.NAME}`,
    url: `${baseUrl}/om-skribenten`,
    mainEntity: {
      '@type': 'Person',
      '@id': `${baseUrl}/om-skribenten#person`,
      name: STRUCTURED_DATA.AUTHOR.NAME,
      url: `${baseUrl}/om-skribenten`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
    />
  );
} 