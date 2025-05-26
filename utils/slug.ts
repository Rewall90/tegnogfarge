/**
 * Converts a string to a URL-friendly slug.
 * Removes special characters, replaces spaces with hyphens, and converts to lowercase.
 * 
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug version of the text
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+/, '') // Remove leading hyphens
    .replace(/-+$/, ''); // Remove trailing hyphens
}

/**
 * Generates a unique slug based on a title, ensuring it doesn't conflict with existing slugs.
 * If the slug already exists, appends a number to make it unique.
 * 
 * @param title - The title to convert to a slug
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 */
export function generateUniqueSlug(title: string, existingSlugs: string[] = []): string {
  let slug = createSlug(title);
  
  if (!existingSlugs.includes(slug)) {
    return slug;
  }
  
  // If slug already exists, add a number suffix to make it unique
  let counter = 1;
  let uniqueSlug = `${slug}-${counter}`;
  
  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }
  
  return uniqueSlug;
} 