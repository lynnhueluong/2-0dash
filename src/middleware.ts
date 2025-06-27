import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/test',
  '/onboarding',
  '/test'
]);

export default async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Check if the path is public
  const isPublicPath = PUBLIC_PATHS.has(req.nextUrl.pathname) ||
    req.nextUrl.pathname.startsWith('/api/auth') ||
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/favicon.ico') ||
    req.nextUrl.pathname.startsWith('/api/test');

  if (isPublicPath) {
    return res;
  }

  try {
    const session = await getSession(req, res);
    
    if (!session?.user) {
      console.log('No session found, redirecting to login');
      return NextResponse.redirect(new URL('/api/auth/login', req.url));
    }

    // Check onboarding status
    const needsOnboarding = !session.user.user_metadata?.onboardingCompleted;
    const isOnboardingPath = req.nextUrl.pathname === '/onboarding';

    // Handle onboarding redirect
    if (needsOnboarding && !isOnboardingPath) {
      console.log('User needs onboarding, redirecting to onboarding page');
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    // If onboarding is complete but user is on onboarding page, redirect to home
    if (!needsOnboarding && isOnboardingPath) {
      console.log('Onboarding complete, redirecting to home');
      return NextResponse.redirect(new URL('/home', req.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // Don't redirect on error, just continue
    return res;
  }
}

export const config = {
  matcher: [
    '/home/:path*',
    '/onboarding',
    '/((?!api/auth|_next/static|_next/image|favicon.ico|test).*)',
  ],
}; 