import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { urlForImage, IMAGE_PRESETS } from '@/lib/sanityImageUrl';

/**
 * Configuration for art-directed image variants
 */
export interface ArtDirectionConfig {
  /**
   * Mobile image crop configuration (portrait orientation)
   * Used for screens below 768px
   */
  mobile: {
    /**
     * Custom aspect ratio for mobile (e.g., '3:4' for portrait)
     * @default '3:4'
     */
    aspectRatio?: string;
    
    /**
     * Width of the mobile image
     * @default 450
     */
    width?: number;
    
    /**
     * Height of the mobile image
     * @default 600
     */
    height?: number;
    
    /**
     * Image quality (1-100)
     * @default 75
     */
    quality?: number;
    
    /**
     * Cropping strategy
     * @default undefined - Use the default Sanity crop
     */
    crop?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  };
  
  /**
   * Tablet image crop configuration (square orientation)
   * Used for screens 768px - 1024px
   */
  tablet?: {
    /**
     * Custom aspect ratio for tablet (e.g., '1:1' for square)
     * @default '1:1'
     */
    aspectRatio?: string;
    
    /**
     * Width of the tablet image
     * @default 600
     */
    width?: number;
    
    /**
     * Height of the tablet image
     * @default 600
     */
    height?: number;
    
    /**
     * Image quality (1-100)
     * @default 80
     */
    quality?: number;
    
    /**
     * Cropping strategy
     * @default undefined - Use the default Sanity crop
     */
    crop?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  };
  
  /**
   * Desktop image crop configuration (landscape orientation)
   * Used for screens above 1024px
   */
  desktop?: {
    /**
     * Custom aspect ratio for desktop (e.g., '16:9' for landscape)
     * @default '16:9'
     */
    aspectRatio?: string;
    
    /**
     * Width of the desktop image
     * @default 800
     */
    width?: number;
    
    /**
     * Height of the desktop image
     * @default 450
     */
    height?: number;
    
    /**
     * Image quality (1-100)
     * @default 85
     */
    quality?: number;
    
    /**
     * Cropping strategy
     * @default undefined - Use the default Sanity crop
     */
    crop?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  };
}

/**
 * Default configuration for art direction
 */
export const DEFAULT_ART_DIRECTION_CONFIG: ArtDirectionConfig = {
  mobile: {
    aspectRatio: '3:4',
    width: 450,
    height: 600,
    quality: 75,
  },
  tablet: {
    aspectRatio: '1:1',
    width: 600,
    height: 600,
    quality: 80,
  },
  desktop: {
    aspectRatio: '16:9',
    width: 800,
    height: 450,
    quality: 85,
  },
};

/**
 * Generate art-directed image sources from a Sanity image
 * This creates different crops of the same image for different viewport sizes
 * 
 * @param image Sanity image source
 * @param config Configuration for the different crops
 * @returns Object with URLs for mobile, tablet, and desktop
 * 
 * @example
 * ```tsx
 * const sources = generateArtDirectedSources(drawing.image, {
 *   mobile: { aspectRatio: '3:4', width: 450 },
 *   tablet: { aspectRatio: '1:1', width: 600 },
 *   desktop: { aspectRatio: '16:9', width: 900 }
 * });
 * 
 * return (
 *   <ArtDirectedImage
 *     mobileSrc={sources.mobile}
 *     tabletSrc={sources.tablet}
 *     desktopSrc={sources.desktop}
 *     alt={drawing.title}
 *   />
 * );
 * ```
 */
export function generateArtDirectedSources(
  image: SanityImageSource,
  config: Partial<ArtDirectionConfig> = {}
): {
  mobile: string;
  tablet: string;
  desktop: string;
} {
  // Merge with default configuration
  const mergedConfig: ArtDirectionConfig = {
    mobile: { ...DEFAULT_ART_DIRECTION_CONFIG.mobile, ...config.mobile },
    tablet: { ...DEFAULT_ART_DIRECTION_CONFIG.tablet, ...config.tablet },
    desktop: { ...DEFAULT_ART_DIRECTION_CONFIG.desktop, ...config.desktop },
  };
  
  // Generate the URLs
  return {
    mobile: urlForImage(image, {
      width: mergedConfig.mobile.width,
      height: mergedConfig.mobile.height,
      quality: mergedConfig.mobile.quality,
      aspectRatio: mergedConfig.mobile.aspectRatio,
    }),
    
    tablet: urlForImage(image, {
      width: mergedConfig.tablet?.width,
      height: mergedConfig.tablet?.height,
      quality: mergedConfig.tablet?.quality,
      aspectRatio: mergedConfig.tablet?.aspectRatio,
    }),
    
    desktop: urlForImage(image, {
      width: mergedConfig.desktop?.width,
      height: mergedConfig.desktop?.height,
      quality: mergedConfig.desktop?.quality,
      aspectRatio: mergedConfig.desktop?.aspectRatio,
    }),
  };
} 