import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired();

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/protected/:path*',
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};