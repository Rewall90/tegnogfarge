/**
 * Category URL Middleware
 * 
 * This middleware handles URL normalization for category-related routes:
 * - Redirects /categories to /all
 * - Redirects /categories/[slug] to /[slug] (removing the "categories" prefix)
 * - Redirects /all-categories to /all
 * 
 * NOTE: This project has a second middleware file at the root level (middleware.ts)
 * that handles authentication and route protection. Both files work independently
 * and target different routes.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Redirect from /categories to /all
  if (pathname === '/categories') {
    return NextResponse.redirect(new URL('/all', request.url));
  }
  
  // Redirect from /categories/[slug] to /[slug]
  if (pathname.startsWith('/categories/')) {
    const newPathname = pathname.replace('/categories', '');
    return NextResponse.redirect(new URL(newPathname, request.url));
  }
  
  // Redirect from /all-categories to /all
  if (pathname === '/all-categories') {
    return NextResponse.redirect(new URL('/all', request.url));
  }
  
  return NextResponse.next();
}

// Match paths for redirection
export const config = {
  matcher: ['/categories', '/categories/:path*', '/all-categories'],
}; 