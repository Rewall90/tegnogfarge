import type { PortableTextBlock } from '@portabletext/types';
import type { Image, Slug } from 'sanity';

// Based on the GROQ query in lib/sanity.ts
export interface SanityPost {
  _id: string;
  _updatedAt: string;
  title: string;
  slug: Slug;
  mainImage?: Image & { asset: { url: string } };
  publishedAt: string;
  body: PortableTextBlock[];
  excerpt: string;
  categories?: {
    _id: string;
    title: string;
    slug: Slug;
  }[];
} 