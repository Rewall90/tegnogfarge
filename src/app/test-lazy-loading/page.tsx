'use client';

import React, { useEffect } from 'react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { ROOT_MARGINS, FADE_DURATIONS } from '@/config/imageOptimization';
import { trackImagePerformance } from '@/utils/imageLoadingMetrics';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

/**
 * Test page for verifying lazy loading implementation
 */
export default function TestLazyLoading() {
  // Set up performance tracking
  useEffect(() => {
    const cleanup = trackImagePerformance({
      debug: true,
      trackAllImages: true,
      onMetricsCollected: (metrics) => {
        console.log('[Test] Image metrics collected:', metrics);
      }
    });
    
    return cleanup;
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Lazy Loading Test</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Priority Images (Above the Fold)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((num) => (
              <div key={num} className="border rounded-lg p-4">
                <div className="relative h-64 mb-4">
                  <OptimizedImage
                    src={`https://picsum.photos/seed/${num}/800/600`}
                    alt={`Priority image ${num}`}
                    fill
                    className="object-cover rounded-md"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    isPriority={true}
                    fadeInDuration={FADE_DURATIONS.FAST}
                  />
                </div>
                <h3 className="text-lg font-medium">Priority Image {num}</h3>
                <p className="text-gray-600">This image loads immediately with priority</p>
              </div>
            ))}
          </div>
        </section>
        
        <div className="h-[100vh] flex items-center justify-center bg-gray-100 mb-12 rounded-lg">
          <p className="text-xl font-semibold">👇 Scroll down to see lazy-loaded images 👇</p>
        </div>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Lazy-Loaded Images (Standard)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[4, 5, 6].map((num) => (
              <div key={num} className="border rounded-lg p-4">
                <div className="relative h-64 mb-4">
                  <OptimizedImage
                    src={`https://picsum.photos/seed/${num}/800/600`}
                    alt={`Lazy image ${num}`}
                    fill
                    className="object-cover rounded-md"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    rootMargin={ROOT_MARGINS.DEFAULT}
                  />
                </div>
                <h3 className="text-lg font-medium">Standard Lazy Image {num}</h3>
                <p className="text-gray-600">Uses default rootMargin of 200px</p>
              </div>
            ))}
          </div>
        </section>
        
        <div className="h-[100vh] flex items-center justify-center bg-gray-100 mb-12 rounded-lg">
          <p className="text-xl font-semibold">👇 Keep scrolling for more test cases 👇</p>
        </div>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Lazy-Loaded Images (Aggressive)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[7, 8, 9].map((num) => (
              <div key={num} className="border rounded-lg p-4">
                <div className="relative h-64 mb-4">
                  <OptimizedImage
                    src={`https://picsum.photos/seed/${num}/800/600`}
                    alt={`Aggressive lazy image ${num}`}
                    fill
                    className="object-cover rounded-md"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    rootMargin={ROOT_MARGINS.AGGRESSIVE}
                  />
                </div>
                <h3 className="text-lg font-medium">Aggressive Lazy Image {num}</h3>
                <p className="text-gray-600">Uses aggressive rootMargin of 300px</p>
              </div>
            ))}
          </div>
        </section>
        
        <div className="h-[100vh] flex items-center justify-center bg-gray-100 mb-12 rounded-lg">
          <p className="text-xl font-semibold">👇 Last set of images 👇</p>
        </div>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Lazy-Loaded Images (Conservative)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[10, 11, 12].map((num) => (
              <div key={num} className="border rounded-lg p-4">
                <div className="relative h-64 mb-4">
                  <OptimizedImage
                    src={`https://picsum.photos/seed/${num}/800/600`}
                    alt={`Conservative lazy image ${num}`}
                    fill
                    className="object-cover rounded-md"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    rootMargin={ROOT_MARGINS.CONSERVATIVE}
                  />
                </div>
                <h3 className="text-lg font-medium">Conservative Lazy Image {num}</h3>
                <p className="text-gray-600">Uses conservative rootMargin of 100px</p>
              </div>
            ))}
          </div>
        </section>
        
        <section className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Testing Results</h2>
          <p className="mb-2">Check your browser's console to see image loading metrics.</p>
          <p className="mb-2">Use Chrome DevTools Performance tab to verify loading behavior.</p>
          <p>Test this page with different throttling settings to simulate various network conditions.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
} 