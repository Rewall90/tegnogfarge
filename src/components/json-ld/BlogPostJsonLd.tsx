import { BlogPosting } from 'schema-dts';
import { SanityPost } from '@/types/sanity'; 
import { urlFor } from '@/lib/sanity';
import { STRUCTURED_DATA } from '@/lib/structured-data-constants';

interface BlogPostJsonLdProps {
  post: SanityPost;
}

export function BlogPostJsonLd({ post }: BlogPostJsonLdProps) {
  const baseUrl = STRUCTURED_DATA.ORGANIZATION.URL;
  const postUrl = `${baseUrl}/blog/${post.slug.current}`;
  
  const blogPostSchema: BlogPosting = {
    '@type': 'BlogPosting',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    'headline': post.title,
    'image': post.mainImage ? urlFor(post.mainImage.asset._ref).width(1200).height(630).url() : '',
    'datePublished': post.publishedAt,
    'dateModified': post._updatedAt,
    'author': {
      '@id': `${baseUrl}/om-skribenten#person`,
    },
    'publisher': {
      '@id': `${baseUrl}/#organization`,
    },
    'description': post.title, // You might want to use an excerpt field here if available
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }}
    />
  );
} 