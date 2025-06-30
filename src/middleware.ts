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
  const { pathname, host, protocol } = request.nextUrl;
  const canonicalHost = 'tegnogfarge.no';

  // Enforce canonical domain: https://tegnogfarge.no
  if (protocol !== 'https:' || host !== canonicalHost) {
    const newUrl = new URL(pathname, `https://${canonicalHost}`);
    return NextResponse.redirect(newUrl.toString(), 301); // 301 for permanent redirect
  }

  // Existing category redirects
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

// This matcher ensures the middleware runs on all paths.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 