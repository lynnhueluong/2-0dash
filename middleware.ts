import { NextResponse } from 'next/server';
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired(async function middleware(req) {
  const res = NextResponse.next();
  const origin = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://2-0dash.vercel.app';
    
  res.headers.set('Access-Control-Allow-Origin', origin);
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', '*');
  return res;
});

export const config = {
  matcher: ['/dashboard/:path*', '/api/auth/me', '/api/auth/login']
};