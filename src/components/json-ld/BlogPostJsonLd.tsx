import { WithContext, BlogPosting } from 'schema-dts';
import { STRUCTURED_DATA } from '@/lib/structured-data-constants';
import { SanityPost } from '@/types/sanity';

interface BlogPostJsonLdProps {
  post: SanityPost;
}

export default function BlogPostJsonLd({ post }: BlogPostJsonLdProps) {
  const postUrl = `${STRUCTURED_DATA.ORGANIZATION.URL}/blog/${post.slug.current}`;
  const authorId = `${STRUCTURED_DATA.AUTHOR.URL}#person`;

  const blogPostSchema: WithContext<BlogPosting> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    headline: post.title,
    description: post.excerpt,
    image: post.mainImage?.asset?.url,
    author: {
      '@type': 'Person',
      '@id': authorId,
      name: STRUCTURED_DATA.AUTHOR.NAME,
      url: STRUCTURED_DATA.AUTHOR.URL,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${STRUCTURED_DATA.ORGANIZATION.URL}#organization`,
      name: STRUCTURED_DATA.ORGANIZATION.NAME,
      logo: {
        '@type': 'ImageObject',
        url: STRUCTURED_DATA.ORGANIZATION.LOGO,
      },
    },
    datePublished: post.publishedAt,
    dateModified: post._updatedAt,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${STRUCTURED_DATA.ORGANIZATION.URL}#website`,
      name: STRUCTURED_DATA.SITE.NAME,
      url: STRUCTURED_DATA.ORGANIZATION.URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }}
    />
  );
} 