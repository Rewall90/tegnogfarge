export type Category = {
  id: number;
  name: string;
  slug: string;
  imageUrl: string;
  count: number;
  description?: string;
  icon?: string;
};

export type CategoryPage = {
  id: number;
  title: string;
  slug: string;
  imageUrl: string;
  categorySlug: string;
  description?: string;
  difficulty?: 'Enkel' | 'Middels' | 'Vanskelig';
};

export const categories: Category[] = [
  // Feiringer
  { id: 1, name: 'Feiringer', slug: 'feiringer', imageUrl: '/images/categories/feiringer.jpg', count: 6, icon: '🥳' },
  
  // Tegneserier
  { id: 2, name: 'Tegneserier', slug: 'tegneserier', imageUrl: '/images/categories/tegneserier.jpg', count: 18, icon: '🎨' },
  
  // Superhelter
  { id: 3, name: 'Superhelter', slug: 'superhelter', imageUrl: '/images/categories/superhelter.jpg', count: 6, icon: '🦸' },
  
  // Dyr
  { id: 4, name: 'Dyr', slug: 'dyr', imageUrl: '/images/categories/dyr.jpg', count: 19, icon: '🐾' },
  
  // Videospill
  { id: 5, name: 'Videospill', slug: 'videospill', imageUrl: '/images/categories/videospill.jpg', count: 6, icon: '🎮' },
  
  // Natur
  { id: 6, name: 'Natur', slug: 'natur', imageUrl: '/images/categories/natur.jpg', count: 4, icon: '🌱' },
  
  // Blomster
  { id: 7, name: 'Blomster', slug: 'blomster', imageUrl: '/images/categories/blomster.jpg', count: 2, icon: '🌸' },
  
  // Mystiske skapninger
  { id: 8, name: 'Mystiske skapninger', slug: 'mystiske-skapninger', imageUrl: '/images/categories/mystiske-skapninger.jpg', count: 3, icon: '🧚' },
  
  // Frukt og grønnsaker
  { id: 9, name: 'Frukt og grønnsaker', slug: 'frukt-og-gronnsaker', imageUrl: '/images/categories/frukt-og-gronnsaker.jpg', count: 2, icon: '🍎' },
  
  // Vitenskap
  { id: 10, name: 'Vitenskap', slug: 'vitenskap', imageUrl: '/images/categories/vitenskap.jpg', count: 2, icon: '🔬' },
  
  // Måneder
  { id: 11, name: 'Måneder', slug: 'maneder', imageUrl: '/images/categories/maneder.jpg', count: 12, icon: '📅' },
  
  // Kjøretøy
  { id: 12, name: 'Kjøretøy', slug: 'kjoretoy', imageUrl: '/images/categories/kjoretoy.jpg', count: 2, icon: '🚗' }
];

// Helper functions
export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(category => category.slug === slug);
}

export function getRelatedCategories(categorySlug: string): Category[] {
  const category = getCategoryBySlug(categorySlug);
  
  if (!category) return [];
  
  // Returnerer bare noen få tilfeldige relaterte kategorier
  return categories
    .filter(cat => cat.slug !== categorySlug)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);
}

// Mock pages for categories based on the structure in kategorier.md
// In a real implementation, this would be fetched from a database or API
export function getCategoryPages(categorySlug: string): CategoryPage[] {
  // Example implementation for feiringer category
  if (categorySlug === 'feiringer') {
    return [
      { id: 1001, title: 'Bursdag', slug: 'bursdag', imageUrl: '/images/categories/pages/bursdag.jpg', categorySlug: 'feiringer', difficulty: 'Enkel' },
      { id: 1002, title: 'Jul', slug: 'jul', imageUrl: '/images/categories/pages/jul.jpg', categorySlug: 'feiringer', difficulty: 'Middels' },
      { id: 1003, title: 'Påsken', slug: 'pasken', imageUrl: '/images/categories/pages/pasken.jpg', categorySlug: 'feiringer', difficulty: 'Enkel' },
      { id: 1004, title: 'Halloween', slug: 'halloween', imageUrl: '/images/categories/pages/halloween.jpg', categorySlug: 'feiringer', difficulty: 'Middels' },
      { id: 1005, title: 'Thanksgiving', slug: 'thanksgiving', imageUrl: '/images/categories/pages/thanksgiving.jpg', categorySlug: 'feiringer', difficulty: 'Vanskelig' },
      { id: 1006, title: 'Morsdag', slug: 'morsdag', imageUrl: '/images/categories/pages/morsdag.jpg', categorySlug: 'feiringer', difficulty: 'Middels' }
    ];
  }
  
  // Example implementation for dyr category
  if (categorySlug === 'dyr') {
    return [
      { id: 2001, title: 'Valp', slug: 'valp', imageUrl: '/images/categories/pages/valp.jpg', categorySlug: 'dyr', difficulty: 'Enkel' },
      { id: 2002, title: 'Kattunge', slug: 'kattunge', imageUrl: '/images/categories/pages/kattunge.jpg', categorySlug: 'dyr', difficulty: 'Enkel' },
      { id: 2003, title: 'Fisk', slug: 'fisk', imageUrl: '/images/categories/pages/fisk.jpg', categorySlug: 'dyr', difficulty: 'Enkel' },
      { id: 2004, title: 'Rev', slug: 'rev', imageUrl: '/images/categories/pages/rev.jpg', categorySlug: 'dyr', difficulty: 'Middels' },
      { id: 2005, title: 'Kanin', slug: 'kanin', imageUrl: '/images/categories/pages/kanin.jpg', categorySlug: 'dyr', difficulty: 'Enkel' },
      { id: 2006, title: 'Ape', slug: 'ape', imageUrl: '/images/categories/pages/ape.jpg', categorySlug: 'dyr', difficulty: 'Middels' },
      { id: 2007, title: 'Pingvin', slug: 'pingvin', imageUrl: '/images/categories/pages/pingvin.jpg', categorySlug: 'dyr', difficulty: 'Middels' },
      { id: 2008, title: 'Tiger', slug: 'tiger', imageUrl: '/images/categories/pages/tiger.jpg', categorySlug: 'dyr', difficulty: 'Vanskelig' },
      { id: 2009, title: 'Skilpadde', slug: 'skilpadde', imageUrl: '/images/categories/pages/skilpadde.jpg', categorySlug: 'dyr', difficulty: 'Middels' }
      // Add more as needed
    ];
  }
  
  // Example implementation for tegneserier category
  if (categorySlug === 'tegneserier') {
    return [
      { id: 3001, title: 'Hello Kitty', slug: 'hello-kitty', imageUrl: '/images/categories/pages/hello-kitty.jpg', categorySlug: 'tegneserier', difficulty: 'Enkel' },
      { id: 3002, title: 'Unicorn', slug: 'unicorn', imageUrl: '/images/categories/pages/unicorn.jpg', categorySlug: 'tegneserier', difficulty: 'Enkel' },
      { id: 3003, title: 'Bluey', slug: 'bluey', imageUrl: '/images/categories/pages/bluey.jpg', categorySlug: 'tegneserier', difficulty: 'Middels' },
      { id: 3004, title: 'Sonic', slug: 'sonic', imageUrl: '/images/categories/pages/sonic.jpg', categorySlug: 'tegneserier', difficulty: 'Middels' },
      { id: 3005, title: 'Kawaii', slug: 'kawaii', imageUrl: '/images/categories/pages/kawaii.jpg', categorySlug: 'tegneserier', difficulty: 'Enkel' }
      // Add more as needed
    ];
  }

  // For other categories, return an empty array for now
  // In a real implementation, you would populate this with actual pages
  return [];
} 