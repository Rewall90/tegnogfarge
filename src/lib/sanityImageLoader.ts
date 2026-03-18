/**
 * Custom Next.js Image loader for Sanity CDN images.
 *
 * Bypasses Vercel's /_next/image optimizer and fetches directly from
 * Sanity's CDN with built-in image transformations. This eliminates the
 * double-hop (Browser → Vercel → Sanity → Vercel → Browser) and serves
 * images in a single hop (Browser → Sanity CDN).
 *
 * Sanity CDN is globally distributed and supports on-the-fly resizing,
 * format conversion, and quality adjustment via URL parameters.
 */
export function sanityImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src.includes('cdn.sanity.io')) {
    return src;
  }

  const q = quality || 75;
  const url = new URL(src);
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(q));
  url.searchParams.set('fm', 'webp');
  url.searchParams.set('fit', 'max');
  url.searchParams.set('auto', 'format');
  return url.toString();
}
