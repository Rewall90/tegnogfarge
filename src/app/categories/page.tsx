"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllCategories } from '../../lib/sanity';

export const revalidate = 3600; // Oppdater siden hver time

async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Alle kategorier</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category: any) => (
          <Link 
            key={category._id} 
            href={`/categories/${category.slug}`}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {category.imageUrl && (
              <div className="relative h-48 w-full">
                <Image 
                  src={category.imageUrl}
                  alt={category.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority={false}
                />
              </div>
            )}
            <div className="p-4">
              <h2 className="font-bold text-xl mb-2">{category.title}</h2>
              {category.description && (
                <p className="text-gray-600 text-sm">{category.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CategoriesPage; 