/**
 * Common utility functions and constants for the application
 */

/**
 * Base64 encoded SVG placeholder used for image blur effects
 * This is a light gray rectangle (3:4 ratio) that serves as a loading placeholder
 */
export const SVG_BLUR_PLACEHOLDER = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjVmNWY1IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiIC8+PC9zdmc+";

/**
 * Path to the WebP placeholder image
 * Used as fallback when no image is available from Sanity
 */
export const WEBP_PLACEHOLDER_PATH = "/placeholders/drawing-placeholder.webp";

/**
 * Helper function to format a date string to YYYY/MM/DD
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return new Date().toISOString().split('T')[0].replace(/-/g, '/');
  
  try {
    return new Date(dateString).toISOString().split('T')[0].replace(/-/g, '/');
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date().toISOString().split('T')[0].replace(/-/g, '/');
  }
} 