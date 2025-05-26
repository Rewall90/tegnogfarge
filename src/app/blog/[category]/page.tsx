"use client";

import React from 'react';
import Link from 'next/link';
import Header from '../../../../components/shared/Header';
import Footer from '../../../../components/shared/Footer';
import { blogPosts } from '../../../data/blogData';

export default function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params;
  const decodedCategory = decodeURIComponent(category);
  
  // Finn alle innlegg i denne kategorien
  const categoryPosts = blogPosts.filter(post => post.category === decodedCategory);
  
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/blog" className="text-blue-600 hover:underline">
            ← Tilbake til alle kategorier
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-6 capitalize">
          Kategori: {decodedCategory}
        </h1>
        
        {categoryPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {categoryPosts.map(post => (
              <article key={post.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded capitalize">
                    {post.category}
                  </span>
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  <Link href={`/blog/${encodeURIComponent(post.category)}/${post.slug}`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </h2>
                <div className="text-gray-600 mb-4">
                  <span>{post.date}</span> • <span>{post.author}</span>
                </div>
                <p className="mb-4">{post.excerpt}</p>
                <Link href={`/blog/${encodeURIComponent(post.category)}/${post.slug}`} className="text-blue-500 hover:underline">
                  Les mer →
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <p className="text-lg text-gray-600 mb-4">Ingen innlegg funnet i kategorien "{decodedCategory}".</p>
            <Link href="/blog" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Se alle kategorier
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
} 