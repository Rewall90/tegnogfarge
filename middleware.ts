import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getToken } = require('next-auth/jwt');

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