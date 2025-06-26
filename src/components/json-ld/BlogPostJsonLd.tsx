import { BlogPosting } from 'schema-dts';
import { SanityPost } from '@/types/sanity'; 
import { urlFor } from '@/lib/sanity'; 

const SITE_URL = 'https://www.tegnogfarge.no';
const AUTHOR_NAME = 'Petter';
const PUBLISHER_LOGO_URL = `${SITE_URL}/public/favicon/tegnogfarge-favicon.svg`; 
const PUBLISHER_NAME = 'Tegn og Farge';

interface BlogPostJsonLdProps {
  post: SanityPost;
}

export function BlogPostJsonLd({ post }: BlogPostJsonLdProps) {
  const postUrl = `${SITE_URL}/blog/${post.slug.current}`;
  
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
      '@type': 'Person',
      'name': AUTHOR_NAME,
      'url': `${SITE_URL}/om-skribenten`,
    },
    'publisher': {
      '@type': 'Organization',
      'name': PUBLISHER_NAME,
      'logo': {
        '@type': 'ImageObject',
        'url': PUBLISHER_LOGO_URL,
      },
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