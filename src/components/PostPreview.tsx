import React from 'react';
import Image from 'next/image';

interface PostPreviewProps {
  post: {
    id: number | string;
    title: string;
    excerpt: string;
    date: string;
    author: string;
    slug: string;
    imageUrl?: string;
  };
  className?: string;
}

export default function PostPreview({ post, className = '' }: PostPreviewProps) {
  return (
    <article className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {post.imageUrl && (
        <div className="relative h-48 bg-gray-200">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 40vw, 25vw"
            priority={true}
          />
        </div>
      )}
      <div className="p-5">
        <h2 className="text-xl font-semibold mb-2">
          <a
            href={`/blog/${post.slug}`}
            className="text-gray-900 hover:text-blue-600 transition-colors"
          >
            {post.title}
          </a>
        </h2>
        <div className="text-gray-600 text-sm mb-3">
          <span>{post.date}</span> • <span>{post.author}</span>
        </div>
        <p className="text-gray-700 mb-4">{post.excerpt}</p>
        <div>
          <a
            href={`/blog/${post.slug}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            Les mer
            <svg
              className="ml-1 w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
} 