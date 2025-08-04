"use client";

import Link from "next/link";
import React from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ButtonHeroSection } from "../buttons/ButtonHeroSection";
import { SearchForm } from "../shared/SearchForm";
import { trackImagePerformance } from "@/utils/imageLoadingMetrics";

export function FrontpageHero() {
  // Lazy load performance tracking after initial paint to reduce JavaScript evaluation time
  React.useEffect(() => {
    // Use requestIdleCallback for better performance, fallback to setTimeout
    const loadPerformanceTracking = () => {
      const cleanup = trackImagePerformance({
        debug: true,
        trackAllImages: false, // Only track LCP for hero
        onMetricsCollected: (metrics) => {
          if (metrics.isLCP) {
            console.log('[Hero LCP] Performance metrics:', metrics);
            // In production, send to analytics service
          }
        }
      });
      
      return cleanup;
    };

    let cleanup: (() => void) | undefined;
    
    if ('requestIdleCallback' in window) {
      const idleCallbackId = window.requestIdleCallback(() => {
        cleanup = loadPerformanceTracking();
      });
      
      return () => {
        window.cancelIdleCallback(idleCallbackId);
        cleanup?.();
      };
    } else {
      // Fallback for browsers without requestIdleCallback
      const timeoutId = setTimeout(() => {
        cleanup = loadPerformanceTracking();
      }, 1);
      
      return () => {
        clearTimeout(timeoutId);
        cleanup?.();
      };
    }
  }, []);

  return (
    <section className="bg-[#FEFAF6]" aria-labelledby="hero-heading">
      <div className="max-w-6xl mx-auto">
        <div className="px-6 py-8 md:px-12 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
            <div className="max-w-xl">
              <h1 id="hero-heading" className="text-heading mb-4 text-[#264653] font-bold">
                Gratis fargeleggingsark for barn og voksne
              </h1>
              <p className="mb-6 text-[#264653] text-lg">
                <span className="md:hidden">Last ned, skriv ut eller fargelegg direkte i nettleseren</span>
                <span className="hidden md:block">Perfekt for hjemme, barnehage og skole. For barn og voksne i alle aldre!</span>
              </p>
              
              <div className="mt-6 max-w-md">
                <SearchForm />
                <ButtonHeroSection />
              </div>
            </div>
            
            <div className="hidden md:block md:-mr-12 md:ml-4 md:h-[535px] relative">
              <OptimizedImage 
                src="/images/hero section/fargelegging-barn-voksne-gratis-motiver.webp"
                alt="Fargelegg og last ned motiver for barn og voksne – helt gratis!"
                fill
                sizes="(max-width: 768px) 0vw, 50vw"
                className="object-cover rounded-l-lg"
                isPriority={true}
                fadeIn={false} // No fade for LCP element
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 