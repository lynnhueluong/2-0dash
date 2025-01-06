// middleware.ts
import { NextResponse } from 'next/server';
import { getSession, withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired(async function middleware(req) {
  try {
    const res = NextResponse.next();
    
    // Add CORS headers
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return new NextResponse(null, { status: 401 });
  }
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/protected/:path*',
    '/api/auth/me'
  ]
};