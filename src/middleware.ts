import { NextResponse } from 'next/server';
import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/logout',
  '/',
  '/_next',
  '/images',
  '/onboarding'
];

export const middleware = withMiddlewareAuthRequired(
  async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    try {
      const response = new NextResponse();
      const session = await getSession(request, response);

      // Set CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (!session?.user) {
        const loginUrl = new URL('/api/auth/login', request.url);
        loginUrl.searchParams.set('returnTo', pathname);
        return NextResponse.redirect(loginUrl);
      }

      const metadata = session.user.app_metadata || {};
      const isOnboarded = Boolean(metadata.onboarded);

      if (!isOnboarded && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.redirect(new URL('/api/auth/login', request.url));
    }
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/api/:path*'
  ]
};