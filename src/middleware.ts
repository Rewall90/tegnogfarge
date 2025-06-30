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
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // --- KANONISK DOMENE-OMDIRIGERING ---
  const { pathname, search } = request.nextUrl;
  const protocol = request.headers.get('x-forwarded-proto') ?? 'http';
  const host = request.headers.get('x-forwarded-host') ?? request.nextUrl.host;
  const canonicalHost = 'tegnogfarge.no';

  if (
    process.env.NODE_ENV === 'production' &&
    (protocol !== 'https' || host !== canonicalHost)
  ) {
    const newUrl = new URL(pathname, `https://${canonicalHost}`);
    newUrl.search = search;
    return NextResponse.redirect(newUrl.toString(), 301);
  }

  // --- KATEGORI-OMDIRIGERINGER ---
  if (pathname === '/categories') {
    return NextResponse.redirect(new URL('/all', request.url));
  }
  if (pathname.startsWith('/categories/')) {
    const newPathname = pathname.replace('/categories', '');
    return NextResponse.redirect(new URL(newPathname, request.url));
  }
  if (pathname === '/all-categories') {
    return NextResponse.redirect(new URL('/all', request.url));
  }

  // --- AUTENTISERINGSLOGIKK ---
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuth = !!token;
  const isAuthPage =
    pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtectedPage = pathname.startsWith('/dashboard');
  const isAdminPage = pathname.startsWith('/dashboard/admin');

  if (isAuthPage) {
    if (isAuth) {
      const redirectParam = request.nextUrl.searchParams.get('redirect');
      if (redirectParam) {
        return NextResponse.redirect(new URL(redirectParam, request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (isProtectedPage && !isAuth) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAdminPage && token?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Kombinert matcher for alle ruter
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * This ensures the canonical redirect runs on all pages.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // Legg til de beskyttede rutene for autentisering
    '/login',
    '/register',
    '/dashboard/:path*',
  ],
}; 