/**
 * Utilities for working with JSON-LD structured data
 */
import { STRUCTURED_DATA } from './structured-data-constants';

type ImageDimensions = {
  width: number;
  height: number;
};

/**
 * Default dimensions for different image sizes
 */
export const DEFAULT_DIMENSIONS: Record<string, ImageDimensions> = {
  thumbnail: { width: 300, height: 300 },
  small: { width: 600, height: 450 },
  medium: { width: 800, height: 600 },
  large: { width: 1200, height: 900 },
  original: { width: 1600, height: 1200 },
};

/**
 * Extract dimensions from Sanity image URL if possible
 * 
 * Sanity CDN URLs can contain width and height parameters
 * Example: https://cdn.sanity.io/images/abcd1234/production/image-abc123-800x600.jpg?w=600&h=450
 * 
 * @param imageUrl The Sanity image URL
 * @returns Dimensions object or null if dimensions couldn't be extracted
 */
export function extractDimensionsFromUrl(imageUrl: string): ImageDimensions | null {
  if (!imageUrl) return null;
  
  try {
    // Try to extract dimensions from URL parameters
    const url = new URL(imageUrl);
    const width = url.searchParams.get('w') || url.searchParams.get('width');
    const height = url.searchParams.get('h') || url.searchParams.get('height');
    
    if (width && height) {
      return {
        width: parseInt(width, 10),
        height: parseInt(height, 10)
      };
    }
    
    // Try to extract from filename (some CDNs include dimensions in filename)
    // Example: image-800x600.jpg
    const matches = imageUrl.match(/(\d+)x(\d+)/);
    if (matches && matches.length >= 3) {
      return {
        width: parseInt(matches[1], 10),
        height: parseInt(matches[2], 10)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting dimensions from URL:', error);
    return null;
  }
}

/**
 * Creates an ImageObject for JSON-LD with all required properties
 * 
 * @param imageUrl URL of the image
 * @param alt Alternative text for the image
 * @param dimensions Optional known dimensions
 * @param caption Optional caption for the image
 * @param contentUrl Optional content URL if different from the image URL
 * @returns Complete ImageObject for JSON-LD
 */
export function createImageObject(
  imageUrl: string,
  alt?: string,
  dimensions?: ImageDimensions,
  caption?: string,
  contentUrl?: string
) {
  if (!imageUrl) return null;
  
  // Try to extract dimensions from URL if not provided
  const extractedDimensions = !dimensions ? extractDimensionsFromUrl(imageUrl) : null;
  
  // Determine image size category based on URL or defaults
  let sizeCategory: keyof typeof DEFAULT_DIMENSIONS = 'medium';
  if (imageUrl.includes('thumbnail') || imageUrl.includes('small')) {
    sizeCategory = 'thumbnail';
  } else if (imageUrl.includes('large')) {
    sizeCategory = 'large';
  }
  
  // Use extracted, provided, or default dimensions
  const finalDimensions = dimensions || extractedDimensions || DEFAULT_DIMENSIONS[sizeCategory];
  
  return {
    "@type": "ImageObject",
    "url": imageUrl,
    "contentUrl": contentUrl || imageUrl,
    "width": finalDimensions.width,
    "height": finalDimensions.height,
    "caption": caption || alt || "",
    "name": alt || caption || "",
    ...(alt && { "alternateName": alt }),
    "license": STRUCTURED_DATA.LEGAL.LICENSE_URL,
    "creator": {
      "@type": "Person",
      "name": STRUCTURED_DATA.AUTHOR.NAME,
      "url": STRUCTURED_DATA.AUTHOR.URL
    },
    "creditText": STRUCTURED_DATA.AUTHOR.NAME,
    "copyrightNotice": STRUCTURED_DATA.LEGAL.COPYRIGHT,
    "acquireLicensePage": STRUCTURED_DATA.LEGAL.LICENSE_URL,
    "encodingFormat": imageUrl.endsWith('.png') ? "image/png" : 
                     imageUrl.endsWith('.svg') ? "image/svg+xml" : 
                     imageUrl.endsWith('.webp') ? "image/webp" : "image/jpeg"
  };
} 