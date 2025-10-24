'use client';

import { useEffect } from 'react';
import {
  trackCategoryView,
  trackSubcategoryView,
  trackDrawingView,
} from '@/lib/analytics';

interface CategoryViewProps {
  type: 'category';
  categorySlug: string;
  categoryTitle: string;
}

interface SubcategoryViewProps {
  type: 'subcategory';
  categorySlug: string;
  subcategorySlug: string;
  subcategoryTitle: string;
}

interface DrawingViewProps {
  type: 'drawing';
  imageId: string;
  imageTitle: string;
  category: string;
  subcategory: string;
}

type PageViewTrackerProps = CategoryViewProps | SubcategoryViewProps | DrawingViewProps;

/**
 * Client component for tracking page views
 * Use in Server Components to track analytics events
 */
export function PageViewTracker(props: PageViewTrackerProps) {
  useEffect(() => {
    // Debug log to verify component is mounting
    console.log('[PageViewTracker] Component mounted', props.type);

    // Track page view on mount
    if (props.type === 'category') {
      trackCategoryView({
        categorySlug: props.categorySlug,
        categoryTitle: props.categoryTitle,
      });
    } else if (props.type === 'subcategory') {
      trackSubcategoryView({
        categorySlug: props.categorySlug,
        subcategorySlug: props.subcategorySlug,
        subcategoryTitle: props.subcategoryTitle,
      });
    } else if (props.type === 'drawing') {
      trackDrawingView({
        imageId: props.imageId,
        imageTitle: props.imageTitle,
        category: props.category,
        subcategory: props.subcategory,
      });
    }
  }, []); // Empty dependency array - only track once on mount

  // This component doesn't render anything
  return null;
}
