// middleware.ts
import { NextResponse } from 'next/server';
import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://project-dmklsn3yttooaux1sfgg.framercanvas.com',
  'https://framerusercontent.com',
  'http://localhost:3000'
];

const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/logout',
  '/',
  '/_next',
  '/images',
  '/onboarding'
];

function getCorsHeaders(origin: string | null) {
  if (!origin || !ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed))) {
    return new Headers();
  }

  return new Headers({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  });
}

export const middleware = withMiddlewareAuthRequired(
  async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const origin = request.headers.get('origin');
    const headers = getCorsHeaders(origin);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers });
    }

    // Allow public paths
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
      const response = NextResponse.next();
      headers.forEach((value, key) => response.headers.set(key, value));
      return response;
    }

    try {
      const response = NextResponse.next();
      const session = await getSession(request, response);

      if (!session?.user) {
        const loginUrl = new URL('/api/auth/login', request.url);
        const currentUrl = request.nextUrl.pathname;
        loginUrl.searchParams.set('returnTo', currentUrl);
        return NextResponse.redirect(loginUrl);
      }

      const metadata = session.user.app_metadata || {};
      const isOnboarded = Boolean(metadata.onboarded);

      if (!isOnboarded && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }

      headers.forEach((value, key) => response.headers.set(key, value));
      return response;

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
    '/api/:path*',
    '/onboarding/:path*'
  ]
};