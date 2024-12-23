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
  '/onboarding',
  '/dashboard',
  'https://the20.co/onboarding'
];

const ALLOWED_ORIGINS = [
  'https://the20.co',
  'https://2-0dash.vercel.app',
  'http://localhost:3000'
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    };
  }
  // Return empty headers object instead of empty object
  return {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  };
}

export const middleware = withMiddlewareAuthRequired(
  async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

    // Allow CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 204,
        headers: corsHeaders
      });
    }

    // Allow public paths
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
      const response = NextResponse.next();
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    try {
      const response = new NextResponse();
      const session = await getSession(request, response);

      if (!session?.user) {
        const loginUrl = new URL('/api/auth/login', request.url);
        loginUrl.searchParams.set('returnTo', pathname);
        return NextResponse.redirect(loginUrl);
      }

      const metadata = session.user.app_metadata || {};
      const isOnboarded = Boolean(metadata.onboarded);

      if (!isOnboarded && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('https://the20.co/onboarding', request.url));
      }

      const nextResponse = NextResponse.next();
      
      // Add CORS headers to all API responses
      if (pathname.startsWith('/api/')) {
        Object.entries(corsHeaders).forEach(([key, value]) => {
          nextResponse.headers.set(key, value);
        });
      }

      return nextResponse;

    } catch (error) {
      console.error('Middleware error:', error);
      const response = NextResponse.redirect(new URL('/api/auth/login', request.url));
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
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