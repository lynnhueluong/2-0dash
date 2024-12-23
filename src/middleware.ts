// middleware.ts
import { NextResponse } from 'next/server';
import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import type { NextRequest } from 'next/server';

export const middleware = withMiddlewareAuthRequired(
  async function middleware(request: NextRequest) {
    // Allow OPTIONS requests to pass through
    if (request.method === 'OPTIONS') {
      return NextResponse.next();
    }

    const { pathname } = request.nextUrl;
    
    try {
      const response = new NextResponse();
      const session = await getSession(request, response);

      if (!session?.user) {
        const loginUrl = new URL('/api/auth/login', request.url);
        loginUrl.searchParams.set('returnTo', pathname);
        return NextResponse.redirect(loginUrl);
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
    '/api/((?!auth).*)'
  ]
};