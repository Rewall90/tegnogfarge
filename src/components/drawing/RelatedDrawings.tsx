import React from 'react';
import { getRelatedDrawings } from '@/lib/sanity';
import { TrackedDrawingCard } from '@/components/cards/TrackedDrawingCard';

interface RelatedDrawingsProps {
  categorySlug: string;
  subcategorySlug: string;
  currentDrawingSlug: string;
  currentDrawingId: string;
  currentDrawingTitle: string;
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
  currentDrawingId,
  currentDrawingTitle,
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
    <aside className="py-12 bg-[#FEFAF6] border-t" aria-labelledby="related-drawings-title">
      <div className="container mx-auto px-4">
        <h2 id="related-drawings-title" className="font-display text-2xl md:text-3xl font-bold text-center mb-8">
          Relaterte tegninger i {subcategoryTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedDrawings.map((drawing, index) => (
            <TrackedDrawingCard
              key={drawing._id}
              title={drawing.title}
              href={`/${categorySlug}/${subcategorySlug}/${drawing.slug}`}
              imageUrl={drawing.imageUrl}
              imageAlt={drawing.imageAlt || drawing.title}
              lqip={drawing.lqip}
              difficulty={drawing.difficulty}
              titleClassName="font-display text-lg"
              drawingId={drawing._id}
              position={index + 1}
              fromDrawingId={currentDrawingId}
              fromDrawingTitle={currentDrawingTitle}
              subcategory={subcategoryTitle}
            />
          ))}
        </div>
      </div>
    </aside>
  );
} 