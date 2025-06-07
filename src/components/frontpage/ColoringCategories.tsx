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
    <section className="py-12 bg-white" aria-labelledby="categories-heading">
      <div className="max-w-6xl mx-auto px-4">
        <header>
          <h2 id="categories-heading" className="text-3xl md:text-4xl font-bold text-center mb-2">Coloring Fun</h2>
          <p className="text-2xl font-semibold text-center mb-10">
            Explore Our Coloring Categories
          </p>
        </header>
        
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 list-none p-0">
          {categories.map((category) => (
            <li key={category.slug} className="flex flex-col items-center">
              <article className="w-full relative aspect-[4/5] bg-[#2EC4B6] rounded-[32px] shadow-lg flex flex-col items-center justify-center overflow-hidden transition-transform duration-200 hover:scale-105 hover:shadow-xl">
                <Link 
                  href={`/${category.slug}`} 
                  className="flex flex-col items-center justify-center w-full h-full"
                  aria-label={`Utforsk ${category.name} fargeleggingskategori`}
                >
                  {category.imageUrl && (
                    <figure>
                      <Image 
                        src={category.imageUrl} 
                        alt={category.name} 
                        width={144} 
                        height={144} 
                        sizes="(max-width: 640px) 85vw, (max-width: 1024px) 40vw, 25vw"
                        className="w-36 h-36 object-contain mb-4 mt-10" 
                      />
                    </figure>
                  )}
                  <h3 className="mt-auto mb-10 text-white text-2xl font-bold text-center w-full drop-shadow-sm">
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