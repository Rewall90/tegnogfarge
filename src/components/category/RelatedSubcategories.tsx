import React from 'react';
import { getRelatedSubcategories } from '@/lib/sanity';
import { SubcategoryCard } from '@/components/cards/SubcategoryCard';

interface RelatedSubcategoriesProps {
  categorySlug: string;
  currentSubcategorySlug: string;
  categoryTitle: string;
  locale?: string;
}

export async function RelatedSubcategories({
  categorySlug,
  currentSubcategorySlug,
  categoryTitle,
  locale = 'no',
}: RelatedSubcategoriesProps) {
  // The SubcategoryCard component expects a specific shape for the subcategory object.
  // We need to define it here for type safety, matching what getRelatedSubcategories returns
  // and what SubcategoryCard expects.
  type SubcategoryForCard = React.ComponentProps<typeof SubcategoryCard>['subcategory'];

  const relatedSubcategories: SubcategoryForCard[] = await getRelatedSubcategories(
    currentSubcategorySlug,
    categorySlug,
    3,
    locale
  );

  if (!relatedSubcategories || relatedSubcategories.length === 0) {
    return null; // Don't render anything if there are no related subcategories
  }

  return (
    <aside className="py-12 bg-[#FEFAF6] border-t" aria-labelledby="related-subcategories-title">
      <div className="container mx-auto px-4">
        <h2 id="related-subcategories-title" className="font-display text-2xl md:text-3xl font-bold text-center mb-8">
          Relaterte underkategorier i {categoryTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedSubcategories.map((subcategory) => (
            <SubcategoryCard
              key={subcategory._id}
              subcategory={subcategory}
              categorySlug={categorySlug}
              locale={locale}
              titleClassName="font-display text-lg"
            />
          ))}
        </div>
      </div>
    </aside>
  );
} 