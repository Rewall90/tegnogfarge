'use client';

import Image, { ImageProps } from 'next/image';
import { sanityImageLoader } from '@/lib/sanityImageLoader';

/**
 * Thin client wrapper around next/image that uses Sanity CDN's
 * built-in image transformations instead of Vercel's /_next/image.
 * Eliminates the double-hop for Sanity-hosted images.
 */
export function SanityImage(props: ImageProps) {
  const isSanity = typeof props.src === 'string' && props.src.includes('cdn.sanity.io');
  return <Image {...props} loader={isSanity ? sanityImageLoader : undefined} />;
}
