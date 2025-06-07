# Image Optimization Guide

This document provides a comprehensive guide to the image optimization strategy implemented in the application, with a focus on lazy loading and performance.

## Table of Contents

1. [Overview](#overview)
2. [Key Components](#key-components)
3. [Usage Guidelines](#usage-guidelines)
4. [Performance Metrics](#performance-metrics)
5. [Best Practices](#best-practices)
6. [Smart Image Selection API](#smart-image-selection-api)
7. [Art Direction](#art-direction)
8. [Maintenance and Monitoring](#maintenance-and-monitoring)

## Overview

Our image optimization strategy focuses on:

- **Optimized lazy loading** with configurable thresholds
- **Priority loading** for above-the-fold images
- **Performance tracking** of image loading metrics
- **Smooth loading transitions** with fade-in effects
- **Responsive sizing** for different devices
- **Smart image selection** for optimal sizing and quality
- **Art direction** with different crops for different viewports

The implementation is designed to balance performance and user experience by loading critical images immediately while deferring less important images until they're needed.

## Key Components

### OptimizedImage Component

The core of our implementation is the `OptimizedImage` component, which extends Next.js Image with advanced lazy loading capabilities:

```tsx
<OptimizedImage
  src="/image.jpg"
  alt="Description"
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  isPriority={false}
  rootMargin="200px 0px"
  className="object-cover rounded-md"
/>
```

Key props:

- `isPriority`: When true, loads the image immediately (for above-the-fold content)
- `rootMargin`: Controls how far outside the viewport to start loading (default: "200px 0px")
- `fadeIn`: Whether to apply a fade-in effect (default: true)
- `fadeInDuration`: Duration of fade-in animation in ms (default: 300)

### Intersection Observer Hook

The `useOptimizedLazyLoading` hook provides the core functionality for our lazy loading implementation:

```tsx
const { targetRef, isIntersecting, hasIntersected } = useOptimizedLazyLoading({
  rootMargin: '300px 0px',
  disabled: isPriority
});
```

### Performance Tracking

The `imageLoadingMetrics` utility tracks and measures image loading performance:

```tsx
const cleanup = trackImagePerformance({
  debug: true,
  trackAllImages: true,
  onMetricsCollected: (metrics) => {
    // Send to analytics service
    analyticsService.trackImagePerformance(metrics);
  }
});
```

## Usage Guidelines

### When to Use Priority Loading

Priority loading should be used for:

- **Hero images** at the top of the page
- **Main product images** on product detail pages
- **Images visible in the initial viewport** without scrolling
- **LCP (Largest Contentful Paint)** elements critical for Web Vitals

Example:
```tsx
<OptimizedImage
  src="/hero-image.jpg"
  alt="Hero image"
  isPriority={true}
  // other props...
/>
```

### Choosing the Right Root Margin

The `rootMargin` controls how far outside the viewport to start loading images:

- **Standard (200px)**: Good balance for most content
- **Aggressive (300px)**: For content users are likely to see
- **Very Aggressive (500px)**: For critical content just below the fold
- **Conservative (100px)**: For less important content
- **Minimal (50px)**: For far-down content or bandwidth-sensitive scenarios

Use the constants from `imageOptimization.ts`:

```tsx
import { ROOT_MARGINS } from '@/config/imageOptimization';

<OptimizedImage
  rootMargin={ROOT_MARGINS.AGGRESSIVE}
  // other props...
/>
```

### Grid and List Views

For grid or list views with multiple images:

1. Mark the first N items as priority based on viewport size
2. Use the `DrawingGrid` component for automatic prioritization
3. On mobile, prioritize fewer items (2-3)
4. On desktop, prioritize more items (6-8)

## Performance Metrics

To monitor image loading performance:

1. Use the `trackImagePerformance` utility in key pages
2. Check Largest Contentful Paint (LCP) in Chrome DevTools
3. Set up a dashboard to track image loading metrics over time
4. Regularly review performance data to identify optimization opportunities

## Best Practices

1. **Always specify image dimensions**:
   - For fixed-size images, use `width` and `height`
   - For fluid images, use `fill` with a parent container that has a defined size

2. **Provide appropriate `sizes` attribute**:
   - This helps the browser select the right image size
   - Example: `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"`

3. **Use WebP format**:
   - Next.js handles this automatically, but ensure your source images are high quality

4. **Leverage blur placeholders**:
   - Always include `placeholder="blur"` and `blurDataURL` for a better loading experience

5. **Balance quality and performance**:
   - Use higher quality (85) for key images
   - Use medium quality (75) for most content
   - Use lower quality (65) for thumbnails

## Smart Image Selection API

The Smart Image Selection API provides automatic selection of the right image format and size based on the intended use of the image.

### Image Presets

The `urlForImage` function now supports presets for common use cases:

```tsx
import { urlForImage, IMAGE_PRESETS } from '@/lib/sanityImageUrl';

// Using a preset
const thumbnailUrl = urlForImage(image, { preset: 'THUMBNAIL' });
const cardUrl = urlForImage(image, { preset: 'CARD' });
const detailUrl = urlForImage(image, { preset: 'DETAIL' });
const heroUrl = urlForImage(image, { preset: 'HERO' });

// Overriding preset values
const customCardUrl = urlForImage(image, { 
  preset: 'CARD',
  quality: 90 // Override the quality setting
});
```

Available presets:
- **THUMBNAIL**: Small image for grids and lists (300×400px, lower quality)
- **CARD**: Medium size for cards and previews (450×600px, medium quality)
- **DETAIL**: Large size for detail views (600×800px, high quality)
- **HERO**: Extra large for hero sections (900×1200px, high quality)

### Aspect Ratio Support

The `urlForImage` function now supports aspect ratio calculations:

```tsx
// Generate image with specific aspect ratio
const landscapeUrl = urlForImage(image, { 
  width: 800,
  aspectRatio: '16:9' // Height will be calculated automatically
});

const portraitUrl = urlForImage(image, {
  height: 600,
  aspectRatio: '3:4' // Width will be calculated automatically
});
```

## Art Direction

Art direction allows you to serve different image crops for different viewport sizes, optimizing the viewing experience across devices.

### ArtDirectedImage Component

The `ArtDirectedImage` component extends `OptimizedImage` with support for different image sources based on viewport size:

```tsx
import { ArtDirectedImage } from '@/components/ui/ArtDirectedImage';

<ArtDirectedImage
  mobileSrc="/images/product-portrait.jpg" // 3:4 crop for mobile
  tabletSrc="/images/product-square.jpg"   // 1:1 crop for tablet
  desktopSrc="/images/product-landscape.jpg" // 16:9 crop for desktop
  alt="Product image"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

The component automatically switches between images based on the viewport size:
- **Mobile**: Up to 768px width
- **Tablet**: 768px to 1024px width
- **Desktop**: 1024px and above

### Generating Art-Directed Sources

For Sanity images, you can use the `generateArtDirectedSources` utility to create different crops of the same image:

```tsx
import { generateArtDirectedSources } from '@/utils/artDirectionUtils';

// Using default settings (portrait for mobile, square for tablet, landscape for desktop)
const sources = generateArtDirectedSources(drawing.image);

// With custom settings
const customSources = generateArtDirectedSources(drawing.image, {
  mobile: { aspectRatio: '4:5', width: 450 },
  tablet: { aspectRatio: '1:1', width: 600 },
  desktop: { aspectRatio: '21:9', width: 900 }
});

<ArtDirectedImage
  mobileSrc={sources.mobile}
  tabletSrc={sources.tablet}
  desktopSrc={sources.desktop}
  alt="Drawing with responsive crops"
  // other props...
/>
```

### Use Cases for Art Direction

Art direction is particularly useful for:

1. **Product images**: Portrait on mobile, square on tablet, landscape on desktop
2. **Hero banners**: Different focal points for different screen sizes
3. **Content images**: Different crops to emphasize important elements based on available space
4. **Gallery images**: Consistent aspect ratios across varying source images

## Maintenance and Monitoring

### Regular Checks

1. **Monthly Performance Review**:
   - Review LCP metrics in Google Analytics and DevTools
   - Check for any regressions in image loading performance
   - Update optimization settings as needed

2. **New Feature Integration**:
   - Ensure all new image-heavy features use the `OptimizedImage` component
   - Test new features with network throttling to verify lazy loading behavior

3. **Browser Compatibility**:
   - Verify functionality in all major browsers (Chrome, Firefox, Safari, Edge)
   - Test on both desktop and mobile devices

### Improvement Opportunities

Future enhancements to consider:

1. Implement image CDN with automatic format detection
2. Add support for art direction with multiple image sources
3. Implement more sophisticated above-the-fold detection
4. Add support for low-data mode
5. Explore native lazy loading improvements as browser support evolves

---

## Testing

To test the lazy loading implementation:

1. Visit the `/test-lazy-loading` page
2. Open Chrome DevTools and go to the Network tab
3. Enable throttling to simulate slower connections
4. Monitor image loading as you scroll
5. Check console logs for performance metrics 