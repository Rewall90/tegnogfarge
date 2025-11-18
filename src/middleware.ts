/**
 * Simplified Middleware
 *
 * This middleware handles:
 * - Locale routing (Norwegian/Swedish)
 * - Category URL redirects
 * - Authentication and route protection
 * - Canonical domain redirects
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

// Create next-intl middleware with locale prefix strategy
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // No prefix for Norwegian, /sv/ for Swedish
  localeDetection: false, // Disable automatic locale detection to prevent unwanted redirects
});

export async function middleware(request: NextRequest) {
  // --- CANONICAL DOMAIN REDIRECT ---
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

  // --- CATEGORY REDIRECTS ---
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

  // --- COPYRIGHT CONTENT DETECTION ---
  // These patterns will match both category pages and all individual pages within them
  const copyrightedPatterns = [
    '/tegneserier/pokemon-figurer',
    '/tegneserier/fargelegg-paw-patrol',
    '/tegneserier/fargelegg-ole-brumm',
    '/tegneserier/fargelegg-ninjago',
    '/tegneserier/fargelegg-minions',
    '/tegneserier/fargelegg-my-little-pony',
    '/tegneserier/fargelegg-hello-kitty',
    '/tegneserier/fargelegg-harry-potter',
    '/tegneserier/fargelegg-elsa',
    '/tegneserier/disney-prinsesser',
    '/tegneserier/fargelegg-disney-figurer',
    '/tegneserier/fargelegg-barbie',
    '/tegneserier/fargelegg-spiderman',
    '/superhelter/fargelegg-sonic',
    '/tegneserier/fargelegg-mario',
    '/superhelter/fargelegg-deadpool',
    '/superhelter/fargelegg-captain-america',
  ];

  // Check if current path matches any copyrighted content pattern
  // This will catch both category pages (/tegneserier/disney-prinsesser)
  // and individual pages (/tegneserier/disney-prinsesser/anna-og-eventyret-i-snoen)
  const isCopyrightedContent = copyrightedPatterns.some(pattern =>
    pathname.startsWith(pattern)
  );

  if (isCopyrightedContent) {
    return NextResponse.redirect(new URL('/api/410-gone', request.url));
  }

  // --- AUTHENTICATION LOGIC ---
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret',
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

  // --- LOCALE ROUTING (next-intl) ---
  // Pattern: Default language (Norwegian) has NO prefix: /jul/farglegg-nisse
  //          Other languages (Swedish) have prefix: /sv/jul/farglaegg-tomte
  // Using next-intl with localePrefix: 'as-needed'

  // Skip locale routing for non-localized routes
  const nonLocalizedRoutes = [
    '/dashboard',
    '/login',
    '/register',
    '/studio',
    '/verify-email',
    '/verify-newsletter',
    '/unsubscribe-confirmation',
    '/api',
    '/coloring-app',
  ];

  const shouldSkipLocale = nonLocalizedRoutes.some(route => pathname.startsWith(route)) || pathname.includes('.');

  if (!shouldSkipLocale) {
    // Use next-intl middleware for locale routing
    const response = intlMiddleware(request);

    // Extract locale from pathname and set it as a header for root layout
    const locale = pathname.startsWith('/sv') ? 'sv' : 'no';
    response.headers.set('x-locale', locale);

    return response;
  }

  const response = NextResponse.next();
  // Set locale header for non-localized routes too
  const locale = pathname.startsWith('/sv') ? 'sv' : 'no';
  response.headers.set('x-locale', locale);

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
    // Authentication routes
    '/login',
    '/register',
    '/dashboard/:path*',
  ],
}; 