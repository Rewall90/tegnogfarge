"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ButtonHeroSection } from "../buttons/ButtonHeroSection";

export function FrontpageHero() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/coloring?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="bg-[#FEFAF6]" aria-labelledby="hero-heading">
      <div className="max-w-6xl mx-auto">
        <div className="px-6 py-8 md:px-12 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
            <div className="max-w-xl">
              <h1 id="hero-heading" className="text-heading mb-4 text-[#264653] font-bold">
                Imagination has no limits with our free coloring pages that inspire creativity and endless fun.
              </h1>
              <p className="text-body mb-6 text-[#264653]">
                Download and print free coloring pages to spark creativity and fun.
                Perfect for home or classroom use, our collection is designed to inspire
                endless imagination.
              </p>
              
              <div className="mt-6 max-w-md">
                <form onSubmit={handleSearch} role="search">
                  <label htmlFor="search-input" className="sr-only">Search for coloring pages</label>
                  <div className="relative">
                    <input
                      id="search-input"
                      type="search"
                      placeholder="Search for coloring pages..."
                      className="w-full py-2 pl-9 pr-4 border-2 border-[#2EC4B6] rounded-md focus:outline-none placeholder:text-[#264653]/70"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ 
                        color: '#264653', 
                        borderColor: '#2EC4B6',
                        caretColor: '#264653'
                      }}
                    />
                    <button 
                      type="submit" 
                      className="absolute inset-y-0 left-0 flex items-center pl-3"
                      aria-label="Search"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 text-gray-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1.5} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                        />
                      </svg>
                    </button>
                  </div>
                </form>
                <ButtonHeroSection />
              </div>
            </div>
            
            <div className="hidden md:block md:-mr-12 md:ml-4 md:h-[400px] relative">
              <Image 
                src="/images/hero section/test bildet.png"
                alt="Children coloring together"
                fill
                className="object-cover rounded-l-lg"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 