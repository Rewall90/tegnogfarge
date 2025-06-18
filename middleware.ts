/**
 * Root Middleware: Authentication & Authorization
 * 
 * This middleware handles user authentication and route protection:
 * - Redirects authenticated users away from login/register pages
 * - Prevents unauthenticated users from accessing dashboard routes
 * - Restricts admin routes to users with admin role
 * 
 * NOTE: This project has a second middleware file at src/middleware.ts
 * that handles category-related URL redirects. Both files work independently
 * and target different routes.
 */

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isAuth = !!token;
  const isAuthPage = 
    request.nextUrl.pathname.startsWith('/login') || 
    request.nextUrl.pathname.startsWith('/register');
  
  const isProtectedPage = 
    request.nextUrl.pathname.startsWith('/dashboard');
  
  const isAdminPage = 
    request.nextUrl.pathname.startsWith('/dashboard/admin');
  
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

export const config = {
  matcher: [
    '/login',
    '/register',
    '/dashboard/:path*',
  ],
}; 