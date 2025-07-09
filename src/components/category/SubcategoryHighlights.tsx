'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface SubcategoryItem {
  _id: string;
  title: string;
  slug: string;
  featuredImage?: { 
    url: string; 
    alt?: string;
  };
  parentCategory: {
    slug: string;
    title?: string;
  };
}

interface SubcategoryHighlightsProps {
  subcategories: SubcategoryItem[];
  title?: string;
  subtitle?: string;
}

export function SubcategoryHighlights({ 
  subcategories, 
  title = "Popular Coloring Pages",
  subtitle = "Explore Our Featured Collections"
}: SubcategoryHighlightsProps) {
  // Client-side state to track images that failed to load
  const [failedImages, setFailedImages] = React.useState<Record<string, boolean>>({});
  
  // Debug: Log the subcategories data
  React.useEffect(() => {
    console.log('SubcategoryHighlights received data:', subcategories);
  }, [subcategories]);
  
  const handleImageError = (slug: string) => {
    console.log(`Image failed to load for subcategory: ${slug}`);
    setFailedImages(prev => ({
      ...prev,
      [slug]: true
    }));
  };

  // If no subcategories are provided or the array is empty, show a message
  if (!subcategories || subcategories.length === 0) {
    return (
      <section className="py-12 bg-[#FEFAF6]" aria-labelledby="subcategories-heading">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <header className="text-navy">
            <h2 id="subcategories-heading" className="text-heading text-center mb-2 text-navy">{title}</h2>
            <p className="text-section text-center mb-10 text-navy">
              {subtitle}
            </p>
          </header>
          <p>Ingen underkategorier funnet. Prøv igjen senere.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-[#FEFAF6]" aria-labelledby="subcategories-heading">
      <div className="max-w-6xl mx-auto px-4">
        <header className="text-navy">
          <h2 id="subcategories-heading" className="text-heading text-center mb-2 text-navy">{title}</h2>
          <p className="text-section text-center mb-10 text-navy">
            {subtitle}
          </p>
        </header>
        
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 list-none p-0">
          {subcategories.map((subcategory, index) => {
            // Ensure we have valid category and subcategory slugs
            const categorySlug = subcategory.parentCategory?.slug || 'category';
            const subcategorySlug = subcategory.slug || '';
            const href = `/${categorySlug}/${subcategorySlug}`;
            const title = subcategory.title || '';
            
            // Hide items beyond 4th on mobile for performance
            const isHiddenOnMobile = index >= 4 ? 'hidden md:flex' : 'flex';
            
            return (
              <li key={subcategory._id} className={`${isHiddenOnMobile} flex-col items-center`}>
                <article className="w-full relative aspect-[4/5] bg-[#2EC4B6] rounded-[32px] shadow-lg flex flex-col items-center justify-center overflow-hidden transition-transform duration-200 hover:scale-105 hover:shadow-xl">
                  <Link 
                    href={href}
                    className="flex flex-col items-center justify-center w-full h-full"
                    aria-label={`Utforsk ${title} fargeleggingsark`}
                  >
                    <figure className="flex items-center justify-center w-48 h-48 mt-8 mb-2 overflow-visible">
                      <Image 
                        src={failedImages[subcategory.slug] ? '/images/placeholder.svg' : (subcategory.featuredImage?.url || '/images/placeholder.svg')} 
                        alt={subcategory.featuredImage?.alt || title} 
                        width={200} 
                        height={200} 
                        sizes="(max-width: 640px) 85vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 25vw"
                        className="object-contain scale-110"
                        onError={() => handleImageError(subcategory.slug)}
                      />
                    </figure>
                    <h3 className="mt-auto mb-10 text-white text-section text-center w-full drop-shadow-sm" style={{ color: '#ffffff' }}>
                      {title}
                    </h3>
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
} 