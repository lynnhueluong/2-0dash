// middleware.ts
import { NextResponse } from 'next/server';
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired(async function middleware(req) {
  const res = NextResponse.next();
  res.headers.set('Cache-Control', 'no-store, max-age=0');
  return res;
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/protected/:path*',
    '/((?!api/auth/callback).*)',
    '!api/auth/:path*'
  ]
};