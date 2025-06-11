'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface CategoryItem {
  name: string;
  imageUrl: string;
  slug: string;
}

interface ColoringCategoriesProps {
  categories: CategoryItem[];
}

export function ColoringCategories({ categories }: ColoringCategoriesProps) {
  // Client-side state to track images that failed to load
  const [failedImages, setFailedImages] = React.useState<Record<string, boolean>>({});
  
  const handleImageError = (slug: string) => {
    setFailedImages(prev => ({
      ...prev,
      [slug]: true
    }));
  };

  return (
    <section className="py-12 bg-cream" aria-labelledby="categories-heading">
      <div className="max-w-6xl mx-auto px-4">
        <header className="text-navy">
          <h2 id="categories-heading" className="text-heading text-center mb-2 text-navy">Coloring Fun</h2>
          <p className="text-section text-center mb-10 text-navy">
            Explore Our Coloring Categories
          </p>
        </header>
        
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 list-none p-0">
          {categories.map((category) => (
            <li key={category.slug} className="flex flex-col items-center">
              <article className="w-full relative aspect-[4/5] bg-[#2EC4B6] rounded-[32px] shadow-lg flex flex-col items-center justify-center overflow-hidden transition-transform duration-200 hover:scale-105 hover:shadow-xl">
                <Link 
                  href={`/${category.slug}`} 
                  className="flex flex-col items-center justify-center w-full h-full"
                  aria-label={`Utforsk ${category.name} fargeleggingskategori`}
                >
                  <figure className="flex items-center justify-center w-48 h-48 mt-8 mb-2 overflow-visible">
                    <Image 
                      src={failedImages[category.slug] ? '/images/placeholder.svg' : (category.imageUrl || '/images/placeholder.svg')} 
                      alt={category.name} 
                      width={200} 
                      height={200} 
                      sizes="(max-width: 640px) 85vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 25vw"
                      className="object-contain scale-110"
                      onError={() => handleImageError(category.slug)}
                    />
                  </figure>
                  <h3 className="mt-auto mb-10 text-white text-section text-center w-full drop-shadow-sm">
                    {category.name}
                  </h3>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
} 