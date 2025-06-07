'use client';

import React from 'react';
import { ArtDirectedImage } from '@/components/ui/ArtDirectedImage';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { urlForImage, IMAGE_PRESETS } from '@/lib/sanityImageUrl';
import { generateArtDirectedSources } from '@/utils/artDirectionUtils';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

// Mock Sanity image source for testing
const mockSanityImage = {
  _type: 'image',
  asset: {
    _ref: 'image-5b21c948c8ffa16e2dd06a74a11b56d5d5b7bcb6-800x600-jpg',
    _type: 'reference'
  }
};

/**
 * Test page for the smart image selection API and art direction
 */
export default function ImageApiTestPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Smart Image API Test</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Image Presets</h2>
          <p className="mb-6">These examples demonstrate the use of image presets for automatic sizing and quality settings.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(IMAGE_PRESETS).map(([presetName, preset]) => (
              <div key={presetName} className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">{presetName}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {preset.width}×{preset.height}, quality: {preset.quality}
                </p>
                
                <div className="relative h-64 mb-4 bg-gray-100">
                  {/* Using a public placeholder image since we don't have actual Sanity images in the test */}
                  <OptimizedImage
                    src={`https://placehold.co/${preset.width}x${preset.height}?text=${presetName}`}
                    alt={`${presetName} preset example`}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Art Direction Examples</h2>
          <p className="mb-6">These examples demonstrate different image crops for different viewport sizes. Resize your browser to see the changes.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Example 1: Product Image */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Product Image</h3>
              <p className="text-sm text-gray-500 mb-4">
                Mobile: 3:4 (portrait)<br />
                Tablet: 1:1 (square)<br />
                Desktop: 16:9 (landscape)
              </p>
              
              <div className="relative aspect-video bg-gray-100">
                <ArtDirectedImage
                  mobileSrc="https://placehold.co/450x600?text=Mobile+3:4"
                  tabletSrc="https://placehold.co/600x600?text=Tablet+1:1"
                  desktopSrc="https://placehold.co/800x450?text=Desktop+16:9"
                  alt="Product with different crops for different devices"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
            
            {/* Example 2: Hero Image */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Hero Image</h3>
              <p className="text-sm text-gray-500 mb-4">
                Mobile: 4:3 (more square)<br />
                Tablet: 16:9 (standard widescreen)<br />
                Desktop: 21:9 (ultrawide)
              </p>
              
              <div className="relative aspect-video bg-gray-100">
                <ArtDirectedImage
                  mobileSrc="https://placehold.co/400x300?text=Mobile+4:3"
                  tabletSrc="https://placehold.co/800x450?text=Tablet+16:9"
                  desktopSrc="https://placehold.co/1050x450?text=Desktop+21:9"
                  alt="Hero image with different aspect ratios"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>
        
        <section className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Implementation Notes</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Smart Image Selection</h3>
              <p>The enhanced <code>urlForImage</code> function now supports:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Predefined presets for common use cases (THUMBNAIL, CARD, DETAIL, HERO)</li>
                <li>Automatic quality selection based on image purpose</li>
                <li>Aspect ratio calculation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Art Direction</h3>
              <p>The new <code>ArtDirectedImage</code> component:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Supports different image sources for mobile, tablet, and desktop</li>
                <li>Automatically switches between sources based on viewport size</li>
                <li>Maintains all the benefits of the <code>OptimizedImage</code> component</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Helper Utilities</h3>
              <p>The <code>generateArtDirectedSources</code> function:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Takes a Sanity image and generates appropriate URLs for different devices</li>
                <li>Supports custom aspect ratios, dimensions, and quality settings</li>
                <li>Uses sensible defaults that can be overridden as needed</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 