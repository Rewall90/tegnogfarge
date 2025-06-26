import React from 'react';
import { getRelatedDrawings } from '@/lib/sanity';
import { DrawingCard } from '@/components/cards/DrawingCard';

interface RelatedDrawingsProps {
  categorySlug: string;
  subcategorySlug: string;
  currentDrawingSlug: string;
  subcategoryTitle: string;
}

// This defines the shape of a drawing object that getRelatedDrawings returns,
// which we can then pass to the DrawingCard.
interface DrawingForCard {
  _id: string;
  title: string;
  slug: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  imageUrl: string;
  imageAlt: string;
  lqip: string;
}

export async function RelatedDrawings({
  categorySlug,
  subcategorySlug,
  currentDrawingSlug,
  subcategoryTitle,
}: RelatedDrawingsProps) {
  const relatedDrawings: DrawingForCard[] = await getRelatedDrawings(
    currentDrawingSlug,
    subcategorySlug
  );

  if (!relatedDrawings || relatedDrawings.length === 0) {
    return null; // Don't render if there's nothing to show
  }

  return (
    <aside className="py-12 bg-slate-50 border-t" aria-labelledby="related-drawings-title">
      <div className="container mx-auto px-4">
        <h2 id="related-drawings-title" className="text-2xl md:text-3xl font-bold text-center mb-8">
          Andre tegninger i {subcategoryTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedDrawings.map((drawing) => (
            <DrawingCard
              key={drawing._id}
              title={drawing.title}
              href={`/${categorySlug}/${subcategorySlug}/${drawing.slug}`}
              imageUrl={drawing.imageUrl}
              imageAlt={drawing.imageAlt || drawing.title}
              lqip={drawing.lqip}
              difficulty={drawing.difficulty}
            />
          ))}
        </div>
      </div>
    </aside>
  );
} 