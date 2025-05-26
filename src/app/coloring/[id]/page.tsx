import React from 'react';
import Link from 'next/link';
import { client } from '../../../lib/sanity';
import { notFound } from 'next/navigation';
import ColoringCanvas from '../../../components/ColoringCanvas';

export const revalidate = 3600; // Oppdater siden hver time

interface ColoringPageProps {
  params: { id: string }
}

async function ColoringPage({ params }: ColoringPageProps) {
  const { id } = params;
  
  // Hent bildedetaljer
  const image = await client.fetch(`
    *[_type == "drawingImage" && _id == $id][0] {
      _id,
      title,
      description,
      "imageUrl": mainImage.asset->url,
      "outlineUrl": outlineImage.asset->url,
      "downloadUrl": downloadFile.asset->url,
      "category": *[_type == "category" && _id == ^.category._ref][0] {
        _id,
        title,
        "slug": slug.current
      }
    }
  `, { id });
  
  if (!image || !image.outlineUrl) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {image.category && (
        <Link 
          href={`/categories/${image.category.slug}`}
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          &larr; Tilbake til {image.category.title}
        </Link>
      )}
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">{image.title}</h1>
        {image.description && (
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">{image.description}</p>
        )}
      </div>
      
      <div className="flex flex-col items-center">
        <ColoringCanvas drawingUrl={image.outlineUrl} width={800} height={600} />
        
        <div className="mt-8 flex space-x-4">
          <a
            href={image.downloadUrl}
            download
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
          >
            Last ned original PDF
          </a>
        </div>
      </div>
    </div>
  );
}

export default ColoringPage; 