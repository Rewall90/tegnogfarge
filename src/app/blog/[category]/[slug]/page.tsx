"use client";

import React from 'react';
import Link from 'next/link';
import Header from '../../../../../components/shared/Header';
import Footer from '../../../../../components/shared/Footer';
import { blogPosts } from '../../../../data/blogData';

export default function BlogPost({ params }: { params: { category: string, slug: string } }) {
  // Find the post that matches both the slug and category
  const post = blogPosts.find(post => 
    post.slug === params.slug && 
    post.category === decodeURIComponent(params.category)
  );
  
  if (!post) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Innlegg ikke funnet</h1>
          <p className="mb-8">Beklager, men innlegget du leter etter finnes ikke.</p>
          <Link href="/blog" className="bg-black text-white px-6 py-3 rounded inline-block font-medium hover:bg-gray-800">
            Tilbake til blogg
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Tilbake til blogg
          </Link>
          
          <article className="bg-white p-8 rounded-lg shadow-md">
            <div className="mb-4">
              <Link 
                href={`/blog/${encodeURIComponent(post.category)}`}
                className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded capitalize hover:bg-blue-200"
              >
                {post.category}
              </Link>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            
            <div className="text-gray-600 mb-8">
              <span>{post.date}</span> • <span>{post.author}</span>
            </div>
            
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
} 