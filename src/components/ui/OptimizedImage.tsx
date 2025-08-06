'use client';

import React, { useState, CSSProperties } from 'react';
import Image, { ImageProps } from 'next/image';
import { useOptimizedLazyLoading } from '@/hooks/useOptimizedLazyLoading';
import { SVG_BLUR_PLACEHOLDER } from '@/lib/utils';

/**
 * Props for the OptimizedImage component
 * Extends Next.js Image props with additional optimization options
 */
export interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'loading'> {
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
   * Additional CSS class to apply to the image wrapper
   */
  wrapperClassName?: string;
  
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
}

/**
 * Enhanced Image component with optimized lazy loading
 * 
 * Features:
 * - Configurable rootMargin for optimized lazy loading
 * - Support for priority loading with isPriority prop
 * - Smooth fade-in effect when image loads
 * - Maintains Next.js Image optimization features
 * - TypeScript support
 * 
 * @example
 * ```tsx
 * <OptimizedImage
 *   src="/image.jpg"
 *   alt="Description"
 *   width={800}
 *   height={600}
 *   isPriority={false}
 *   rootMargin="300px 0px"
 *   className="rounded-md"
 * />
 * ```
 */
export function OptimizedImage({
  src,
  alt,
  isPriority = false,
  rootMargin = '200px 0px',
  placeholder = 'blur',
  blurDataURL = SVG_BLUR_PLACEHOLDER,
  wrapperClassName = '',
  className = '',
  fadeIn = true,
  fadeInDuration = 300,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Check if the image is an SVG or small icon that shouldn't be optimized
  const isSvg = typeof src === 'string' && src.endsWith('.svg');
  const isIcon = typeof src === 'string' && (src.includes('/icon') || src.includes('.ico'));
  const shouldOptimize = !isSvg && !isIcon;
  
  // Use the optimized lazy loading hook
  // Disable it if isPriority is true
  const { targetRef, isIntersecting, hasIntersected } = useOptimizedLazyLoading({
    rootMargin,
    disabled: isPriority
  });
  
  // Determine if we should render the image
  // Either because it's a priority image or it's in/near the viewport
  const shouldRender = isPriority || hasIntersected;
  
  // Style for fade-in effect
  const imageStyle = {
    ...props.style,
    transition: fadeIn ? `opacity ${fadeInDuration}ms ease-in-out` : undefined,
    opacity: (!fadeIn || isLoaded) ? 1 : 0
  };

  const wrapperStyle: CSSProperties = {
    overflow: 'hidden',
    ...(props.fill
      ? {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }
      : {
          position: 'relative',
        }),
  };
  
  return (
    <div 
      ref={targetRef as React.RefObject<HTMLDivElement>}
      className={wrapperClassName}
      style={wrapperStyle}
    >
      {shouldRender && (
        <Image
          src={src}
          alt={alt}
          className={className}
          style={imageStyle}
          placeholder={shouldOptimize ? placeholder : undefined}
          blurDataURL={shouldOptimize ? blurDataURL : undefined}
          priority={isPriority}
          unoptimized={!shouldOptimize}
          onLoad={() => setIsLoaded(true)}
          {...props}
        />
      )}
    </div>
  );
} 