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