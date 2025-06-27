import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public paths that don't require authentication
const PUBLIC_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/logout',
  '/onboarding',
  '/auth/success',
  '/api/auth/state-token',
  '/test',
  '/api/auth-test',
  '/'
]);

export default async function middleware(req: NextRequest) {
  // Skip middleware completely for Auth0 routes
  if (req.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Skip middleware for static assets
  if (req.nextUrl.pathname.startsWith('/_next') || 
      req.nextUrl.pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // Skip middleware for public paths
  if (req.nextUrl.pathname === '/' || 
      req.nextUrl.pathname === '/onboarding' ||
      req.nextUrl.pathname === '/api/auth-test') {
    return NextResponse.next();
  }

  // Only check session for protected routes
  try {
    const res = NextResponse.next();
    const session = await getSession(req, res);
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/api/auth/login', req.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/api/auth/login', req.url));
  }
}

export const config = {
  matcher: [
    '/home/:path*',
    '/api/profile/:path*',
    '/api/onboarding/:path*',
  ],
};