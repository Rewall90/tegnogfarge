import { COLORING_APP_CONFIG } from '@/config/coloringApp';

/**
 * Validates if an image URL is from a trusted source
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    
    // Allow Sanity CDN
    if (urlObj.hostname === 'cdn.sanity.io') return true;
    
    // Allow localhost for development
    if (process.env.NODE_ENV === 'development' && urlObj.hostname === 'localhost') return true;
    
    // Allow the current domain
    if (typeof window !== 'undefined' && urlObj.hostname === window.location.hostname) return true;
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Gets the appropriate image URL for coloring, handling CORS and fallbacks
 */
export function getColoringImageUrl(imageUrl: string, fallbackUrl?: string): string {
  // Try primary URL first
  if (isValidImageUrl(imageUrl)) {
    if (COLORING_APP_CONFIG.USE_IMAGE_PROXY && imageUrl.includes('cdn.sanity.io')) {
      return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    }
    return imageUrl;
  }
  
  // Try fallback URL
  if (fallbackUrl && isValidImageUrl(fallbackUrl)) {
    if (COLORING_APP_CONFIG.USE_IMAGE_PROXY && fallbackUrl.includes('cdn.sanity.io')) {
      return `/api/proxy-image?url=${encodeURIComponent(fallbackUrl)}`;
    }
    return fallbackUrl;
  }
  
  throw new Error('No valid image URL available');
}

/**
 * Preloads an image and returns a promise that resolves when it's loaded
 */
export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    
    img.src = url;
  });
}

/**
 * Validates image dimensions for coloring
 */
export function validateImageDimensions(img: HTMLImageElement): boolean {
  if (img.width > COLORING_APP_CONFIG.MAX_IMAGE_WIDTH || 
      img.height > COLORING_APP_CONFIG.MAX_IMAGE_HEIGHT) {
    console.warn(`Image dimensions (${img.width}x${img.height}) exceed maximum allowed size (${COLORING_APP_CONFIG.MAX_IMAGE_WIDTH}x${COLORING_APP_CONFIG.MAX_IMAGE_HEIGHT})`);
    return false;
  }
  
  if (img.width < 100 || img.height < 100) {
    console.warn(`Image dimensions (${img.width}x${img.height}) are too small for coloring`);
    return false;
  }
  
  return true;
}