import React from 'react';
import Link from 'next/link';
import { CategoryPage } from '../../src/data/categoriesData';

interface CategoryPageCardProps {
  page: CategoryPage;
  categorySlug: string;
  className?: string;
}

export default function CategoryPageCard({ page, categorySlug, className = '' }: CategoryPageCardProps) {
  return (
    <div 
      key={page.id} 
      className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div 
        className="h-48 bg-gray-200 flex items-center justify-center bg-cover bg-center" 
        style={{ backgroundImage: `url(${page.imageUrl})` }}
      >
        {/* Image as background */}
      </div>
      <div className="p-4">
        <h3 className="font-bold mb-2">{page.title}</h3>
        {page.difficulty && (
          <p className="text-sm text-gray-600 mb-3">Vanskelighetsgrad: {page.difficulty}</p>
        )}
        <Link 
          href={`/coloring?id=${page.id}&category=${categorySlug}&page=${page.slug}`} 
          className="bg-blue-500 text-white px-3 py-2 rounded text-sm inline-block hover:bg-blue-600"
        >
          Fargelegg nå
        </Link>
      </div>
    </div>
  );
} 