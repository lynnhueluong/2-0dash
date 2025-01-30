import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public paths that don't require authentication
const PUBLIC_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/logout',
  '/onboarding',
  '/auth/success',
  '/api/auth/state-token'
]);

export default withMiddlewareAuthRequired(
  async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    
    // Check if the path is public
    const isPublicPath = PUBLIC_PATHS.has(req.nextUrl.pathname) ||
      req.nextUrl.pathname.startsWith('/api/auth') ||
      req.nextUrl.pathname.startsWith('/_next') ||
      req.nextUrl.pathname.startsWith('/favicon.ico');

    if (isPublicPath) {
      return res;
    }

    try {
      const session = await getSession(req, res);
      
      // If no session and not a public path, redirect to login
      if (!session?.user) {
        console.log('No session found, redirecting to login');
        return NextResponse.redirect(new URL('/api/auth/login', req.url));
      }

      // Get state token from cookies
      const stateToken = req.cookies.get('state_token');
      
      // Check onboarding status
      const needsOnboarding = !session.user.user_metadata?.onboardingCompleted;
      const isOnboardingPath = req.nextUrl.pathname === '/onboarding';

      // Handle onboarding redirect
      if (needsOnboarding && !isOnboardingPath) {
        console.log('User needs onboarding, redirecting to onboarding page');
        const onboardingUrl = new URL('/onboarding', req.url);
        if (stateToken) {
          onboardingUrl.searchParams.set('state_token', stateToken.value);
        }
        return NextResponse.redirect(onboardingUrl);
      }

      // If onboarding is complete but user is on onboarding page, redirect to home
      if (!needsOnboarding && isOnboardingPath) {
        console.log('Onboarding complete, redirecting to home');
        return NextResponse.redirect(new URL('/home', req.url));
      }

      // Add state token to headers if it exists
      if (stateToken) {
        res.headers.set('x-state-token', stateToken.value);
      }

      return res;
    } catch (error) {
      console.error('Middleware error:', error);
      // On error, redirect to login
      return NextResponse.redirect(new URL('/api/auth/login', req.url));
    }
  }
);

export const config = {
  matcher: [
    '/home/:path*',
    '/api/profile/:path*',
    '/api/onboarding/:path*',
    '/api/((?!auth|state-token).*)/:path*',
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};