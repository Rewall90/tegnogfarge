"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="bg-white">
      <section className="max-w-6xl mx-auto">
        <div className="px-6 py-8 md:px-12 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="max-w-xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Imagination has no limits with our free coloring pages that inspire creativity and endless fun.
              </h1>
              <p className="text-gray-700 mb-6">
                Download and print free coloring pages to spark creativity and fun.
                Perfect for home or classroom use, our collection is designed to inspire
                endless imagination.
              </p>
              
              <form onSubmit={handleSearch} className="mt-6 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for coloring pages..."
                    className="w-full py-2 pl-9 pr-4 border border-gray-300 rounded-md focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search for coloring pages"
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
            </div>
            
            <div className="hidden md:block">
              <div className="overflow-hidden">
                <div className="bg-gray-100 flex items-center justify-center h-64">
                  <div className="text-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-12 w-12 mx-auto text-gray-400 mb-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      />
                    </svg>
                    <p className="text-gray-500">Children coloring together</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 