// src/middleware.ts
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired({
  returnTo: '/dashboard'
});

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|onboarding).*)',
  ]
};