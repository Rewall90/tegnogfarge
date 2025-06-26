import { STRUCTURED_DATA } from '@/lib/structured-data-constants';
import { Person, WithContext, ProfilePage } from 'schema-dts';

interface ProfilePageJsonLdProps {
  authorName: string;
}

export default function ProfilePageJsonLd({ authorName }: ProfilePageJsonLdProps) {
  const authorId = `${STRUCTURED_DATA.AUTHOR.URL}#person`;

  const personSchema: Person = {
    '@type': 'Person',
    '@id': authorId,
    name: authorName,
    url: STRUCTURED_DATA.AUTHOR.URL,
    sameAs: [
      // Add social media or other relevant links here if available
    ],
    worksFor: {
      '@type': 'Organization',
      name: STRUCTURED_DATA.ORGANIZATION.NAME,
    },
  };

  const profilePageSchema: WithContext<ProfilePage> = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    mainEntity: personSchema,
    url: STRUCTURED_DATA.AUTHOR.URL,
    name: `Om ${authorName}`,
    description: `Lær mer om ${authorName}, skribenten og illustratøren bak ${STRUCTURED_DATA.ORGANIZATION.NAME}.`,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${STRUCTURED_DATA.ORGANIZATION.URL}#website`,
      name: STRUCTURED_DATA.SITE.NAME,
      url: STRUCTURED_DATA.ORGANIZATION.URL,
      publisher: {
        '@type': 'Organization',
        '@id': `${STRUCTURED_DATA.ORGANIZATION.URL}#organization`,
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
    />
  );
} 