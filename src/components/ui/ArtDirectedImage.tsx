'use client';

import React from 'react';
import Image, { ImageProps } from 'next/image';
import { OptimizedImage, OptimizedImageProps } from './OptimizedImage';
import { SVG_BLUR_PLACEHOLDER } from '@/lib/utils';
import { BREAKPOINTS } from '@/utils/viewportDetection';

/**
 * Props for the ArtDirectedImage component
 */
export interface ArtDirectedImageProps {
  /**
   * Image source for mobile devices (up to 768px)
   */
  mobileSrc: string;
  
  /**
   * Image source for tablet devices (768px to 1024px)
   */
  tabletSrc?: string;
  
  /**
   * Image source for desktop devices (1024px and above)
   */
  desktopSrc?: string;
  
  /**
   * Alternative text for accessibility
   */
  alt: string;
  
  /**
   * Whether the image should be loaded with priority
   * When true, disables lazy loading and loads the image immediately
   * Use for above-the-fold images that are critical for LCP
   * @default false
   */
  isPriority?: boolean;
  
  /**
   * The root margin to use for the intersection observer
   * Defines how far outside the viewport to start loading
   * @default '200px 0px' - Start loading 200px before element enters viewport
   */
  rootMargin?: string;
  
  /**
   * Whether to fade in the image once loaded
   * @default true
   */
  fadeIn?: boolean;
  
  /**
   * Duration of the fade-in animation in milliseconds
   * @default 300
   */
  fadeInDuration?: number;
  
  /**
   * Additional CSS class for the image
   */
  className?: string;
  
  /**
   * Additional CSS class for the wrapper
   */
  wrapperClassName?: string;
  
  /**
   * CSS properties for the image
   */
  style?: React.CSSProperties;
  
  /**
   * Fill the parent container
   */
  fill?: boolean;
  
  /**
   * Image width in pixels
   */
  width?: number;
  
  /**
   * Image height in pixels
   */
  height?: number;
  
  /**
   * The sizes attribute for responsive images
   */
  sizes?: string;
  
  /**
   * Quality of the image (1-100)
   */
  quality?: number;
  
  /**
   * Placeholder type
   */
  placeholder?: 'blur' | 'empty';
  
  /**
   * Data URL for the blur placeholder
   */
  blurDataURL?: string;
}

/**
 * ArtDirectedImage component that displays different image crops for different viewport sizes
 * 
 * This component uses the picture element with media queries to serve different images
 * based on the viewport size, allowing for art direction.
 * 
 * Example usage:
 * ```tsx
 * <ArtDirectedImage
 *   mobileSrc="/images/product-portrait.jpg"
 *   tabletSrc="/images/product-square.jpg"
 *   desktopSrc="/images/product-landscape.jpg"
 *   alt="Product image"
 *   isPriority={true}
 *   fill
 *   sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
 * />
 * ```
 */
export function ArtDirectedImage({
  mobileSrc,
  tabletSrc,
  desktopSrc,
  alt,
  isPriority = false,
  rootMargin = '200px 0px',
  fadeIn = true,
  fadeInDuration = 300,
  className = '',
  wrapperClassName = '',
  style,
  fill = false,
  width,
  height,
  sizes,
  quality,
  placeholder = 'blur',
  blurDataURL = SVG_BLUR_PLACEHOLDER,
}: ArtDirectedImageProps) {
  // Use the appropriate sources
  // If tablet or desktop sources are not provided, fall back to the previous one
  const tabletSource = tabletSrc || mobileSrc;
  const desktopSource = desktopSrc || tabletSource;
  
  // Media query breakpoints
  const tabletQuery = `(min-width: ${BREAKPOINTS.md}px)`;
  const desktopQuery = `(min-width: ${BREAKPOINTS.lg}px)`;
  
  // In a client component, we can use window.matchMedia to determine the current viewport
  // and select the appropriate image
  const [currentSrc, setCurrentSrc] = React.useState(mobileSrc);
  
  React.useEffect(() => {
    // Update the source based on the current viewport
    const updateSource = () => {
      if (window.matchMedia(desktopQuery).matches) {
        setCurrentSrc(desktopSource);
      } else if (window.matchMedia(tabletQuery).matches) {
        setCurrentSrc(tabletSource);
      } else {
        setCurrentSrc(mobileSrc);
      }
    };
    
    // Initial update
    updateSource();
    
    // Update on resize
    window.addEventListener('resize', updateSource);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateSource);
    };
  }, [mobileSrc, tabletSource, desktopSource, tabletQuery, desktopQuery]);
  
  // Use the OptimizedImage component with the current source
  return (
    <OptimizedImage
      src={currentSrc}
      alt={alt}
      isPriority={isPriority}
      rootMargin={rootMargin}
      fadeIn={fadeIn}
      fadeInDuration={fadeInDuration}
      className={className}
      wrapperClassName={wrapperClassName}
      style={style}
      fill={fill}
      width={width}
      height={height}
      sizes={sizes}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
    />
  );
} 