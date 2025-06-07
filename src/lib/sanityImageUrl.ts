import imageUrlBuilder from '@sanity/image-url';
import { client } from './sanity';
import { WEBP_PLACEHOLDER_PATH } from './utils';
import { IMAGE_QUALITY } from '@/config/imageOptimization';

const builder = imageUrlBuilder(client);

/**
 * Image presets for common use cases
 * Each preset defines optimal dimensions and quality for a specific purpose
 */
export const IMAGE_PRESETS = {
  /**
   * Small thumbnail for grids and lists
   * 300×400px, low quality
   */
  THUMBNAIL: {
    width: 300,
    height: 400,
    quality: IMAGE_QUALITY.LOW
  },
  
  /**
   * Medium size for cards and previews
   * 450×600px, medium quality
   */
  CARD: {
    width: 450,
    height: 600,
    quality: IMAGE_QUALITY.MEDIUM
  },
  
  /**
   * Large size for detail views
   * 600×800px, high quality
   */
  DETAIL: {
    width: 600,
    height: 800, 
    quality: IMAGE_QUALITY.HIGH
  },
  
  /**
   * Extra large for hero sections
   * 900×1200px, high quality
   */
  HERO: {
    width: 900,
    height: 1200,
    quality: IMAGE_QUALITY.HIGH
  }
};

/**
 * Generates an optimized image URL from Sanity with appropriate caching and format settings
 * 
 * @param source The Sanity image source
 * @param options Optional configuration for the image
 * @returns Optimized image URL with appropriate cache settings
 */
export function urlForImage(source: unknown, options: { 
  width?: number, 
  height?: number, 
  quality?: number,
  format?: 'webp' | 'jpg' | 'png' | 'auto',
  preset?: keyof typeof IMAGE_PRESETS,
  aspectRatio?: string
} = {}) {
  if (!source) return WEBP_PLACEHOLDER_PATH;
  
  // Apply preset if specified
  let presetOptions = {};
  if (options.preset && IMAGE_PRESETS[options.preset]) {
    presetOptions = { ...IMAGE_PRESETS[options.preset] };
  }
  
  // Merge preset with explicit options (explicit options take precedence)
  const mergedOptions = { ...presetOptions, ...options };
  
  // Start with the base image
  let imageBuilder = builder.image(source);
  
  // Apply dimensions if specified
  if (mergedOptions.width) {
    imageBuilder = imageBuilder.width(mergedOptions.width);
  }
  
  if (mergedOptions.height) {
    imageBuilder = imageBuilder.height(mergedOptions.height);
  }
  
  // Apply custom aspect ratio if specified
  if (options.aspectRatio) {
    const [width, height] = options.aspectRatio.split(':').map(Number);
    if (width && height) {
      // If we have a width, calculate height based on aspect ratio
      if (mergedOptions.width && !mergedOptions.height) {
        const calculatedHeight = Math.round(mergedOptions.width * (height / width));
        imageBuilder = imageBuilder.height(calculatedHeight);
      }
      // If we have a height, calculate width based on aspect ratio
      else if (mergedOptions.height && !mergedOptions.width) {
        const calculatedWidth = Math.round(mergedOptions.height * (width / height));
        imageBuilder = imageBuilder.width(calculatedWidth);
      }
    }
  }
  
  // Apply quality (default to 80 for good balance of quality and file size)
  imageBuilder = imageBuilder.quality(mergedOptions.quality || 80);
  
  // Apply format (default to WebP for best compression)
  if (mergedOptions.format && mergedOptions.format !== 'auto') {
    imageBuilder = imageBuilder.format(mergedOptions.format);
  } else {
    imageBuilder = imageBuilder.format('webp');
  }
  
  // Apply auto format for browser compatibility if 'auto' is specified
  if (mergedOptions.format === 'auto') {
    imageBuilder = imageBuilder.auto('format');
  }
  
  // Return the URL - Sanity CDN already applies appropriate cache headers
  return imageBuilder.url();
} 