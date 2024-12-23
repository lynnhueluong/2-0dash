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
  '/api/auth/onboarding-status' 
];

const ALLOWED_ORIGINS = [
  'https://the20.co',
  'http://localhost:3000',
  'https://2-0dash.vercel.app'
];


export const middleware = withMiddlewareAuthRequired(
  async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const origin = request.headers.get('origin');

    const headers = {
      'Access-Control-Allow-Credentials': 'true',
      ...(origin && ALLOWED_ORIGINS.includes(origin) 
        ? { 'Access-Control-Allow-Origin': origin }
        : {}),
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 204,
        headers 
      });
    }

    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
      const response = NextResponse.next();
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    try {
      const response = NextResponse.next();
      const session = await getSession(request, response);

      if (!session?.user) {
        const loginUrl = new URL('/api/auth/login', request.url);
        loginUrl.searchParams.set('returnTo', pathname);
        return NextResponse.redirect(loginUrl);
      }

      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
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
    '/api/:path*'
  ]
};