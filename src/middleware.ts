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
];

const FRAMER_ORIGIN = 'https://project-dmklsn3yttooaux1sfgg.framercanvas.com';

export const middleware = withMiddlewareAuthRequired(
  async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const origin = request.headers.get('origin');

    if (request.method === 'OPTIONS') {
      const corsResponse = new NextResponse(null, { status: 204 });
      corsResponse.headers.set('Access-Control-Allow-Origin', FRAMER_ORIGIN);
      corsResponse.headers.set('Access-Control-Allow-Credentials', 'true');
      corsResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      corsResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return corsResponse;
    }

    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    try {
      const nextResponse = NextResponse.next();
      const session = await getSession(request, nextResponse);

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

      if (pathname.startsWith('/api/')) {
        nextResponse.headers.set('Access-Control-Allow-Origin', FRAMER_ORIGIN);
        nextResponse.headers.set('Access-Control-Allow-Credentials', 'true');
        nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      }

      return nextResponse;

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