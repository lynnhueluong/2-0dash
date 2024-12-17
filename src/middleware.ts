import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';

const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/logout',
  '/',
  '/favicon.ico',
  '/_next',
  '/images'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public paths and static files
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  try {
    const session = await getSession(request, new NextResponse());

    if (!session?.user) {
      const loginUrl = new URL('/api/auth/login', request.url);
      // Only set returnTo for valid paths
      if (!pathname.includes('.html')) {
        loginUrl.searchParams.set('returnTo', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }

    // Check onboarding status
    const metadata = session.user.app_metadata || {};
    const isOnboarded = Boolean(metadata.onboarded);

    if (!isOnboarded && !pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/api/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    // Match all paths except public ones
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};