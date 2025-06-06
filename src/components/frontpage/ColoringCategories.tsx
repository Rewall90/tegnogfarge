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
  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Coloring Fun</h1>
        <h2 className="text-2xl font-semibold text-center mb-10">
          Explore Our Coloring Categories
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {categories.map((category) => (
            <div key={category.slug} className="flex flex-col items-center">
              <Link href={`/${category.slug}`} className="block w-full">
                <div className="relative w-full aspect-[4/5] bg-[#2EC4B6] rounded-[32px] shadow-lg flex flex-col items-center justify-center overflow-hidden transition-transform duration-200 hover:scale-105 hover:shadow-xl">
                  {category.imageUrl && (
                    <Image 
                      src={category.imageUrl} 
                      alt={category.name} 
                      width={144} 
                      height={144} 
                      className="w-36 h-36 object-contain mb-4 mt-10" 
                    />
                  )}
                  <div className="mt-auto mb-10 text-white text-2xl font-bold text-center w-full drop-shadow-sm">
                    {category.name}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 