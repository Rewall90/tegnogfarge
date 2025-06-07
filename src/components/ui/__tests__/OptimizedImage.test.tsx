'use client';

/**
 * This is a manual test file for the OptimizedImage component.
 * 
 * It's not meant to be run as an automated test, but rather to be used
 * as a reference for how to use the component.
 * 
 * You can copy this code to a test component to verify the component is working.
 */

import React from 'react';
import { OptimizedImage } from '../OptimizedImage';
import { SVG_BLUR_PLACEHOLDER } from '@/lib/utils';

export function OptimizedImageExamples() {
  return (
    <div className="space-y-8 p-4">
      <h1 className="text-2xl font-bold">OptimizedImage Examples</h1>
      
      <section>
        <h2 className="text-xl font-semibold mb-2">Standard Usage</h2>
        <div className="relative w-64 h-64">
          <OptimizedImage
            src="/path/to/image.jpg"
            alt="Example image"
            fill
            className="object-cover rounded-md"
            sizes="256px"
          />
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-2">Priority Image (Above the Fold)</h2>
        <div className="relative w-64 h-64">
          <OptimizedImage
            src="/path/to/image.jpg"
            alt="Priority image"
            fill
            isPriority={true}
            className="object-cover rounded-md"
            sizes="256px"
          />
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-2">Custom Root Margin</h2>
        <div className="relative w-64 h-64">
          <OptimizedImage
            src="/path/to/image.jpg"
            alt="Custom root margin"
            fill
            rootMargin="400px 0px"
            className="object-cover rounded-md"
            sizes="256px"
          />
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-2">No Fade-In Effect</h2>
        <div className="relative w-64 h-64">
          <OptimizedImage
            src="/path/to/image.jpg"
            alt="No fade-in"
            fill
            fadeIn={false}
            className="object-cover rounded-md"
            sizes="256px"
          />
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-2">Custom Fade-In Duration</h2>
        <div className="relative w-64 h-64">
          <OptimizedImage
            src="/path/to/image.jpg"
            alt="Custom fade duration"
            fill
            fadeInDuration={1000} // 1 second fade
            className="object-cover rounded-md"
            sizes="256px"
          />
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-2">With Wrapper Class</h2>
        <OptimizedImage
          src="/path/to/image.jpg"
          alt="With wrapper class"
          width={256}
          height={256}
          wrapperClassName="border-2 border-blue-500 p-2 rounded-md"
          className="object-cover rounded-md"
        />
      </section>
    </div>
  );
} 