import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withMiddlewareAuthRequired(
  async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const session = await getSession(req, res);

    // More permissive middleware
    const publicPaths = [
      '/api/auth/login', 
      '/api/auth/callback', 
      '/onboarding', 
      '/auth/success'
    ];

    // Allow public paths
    if (publicPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
      return res;
    }

    // Redirect logic for onboarding
    if (!session?.user?.user_metadata?.onboardingCompleted) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    return res;
  }
);

export const config = {
  matcher: [
    '/home/:path*',
    '/api/profile/:path*',
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};