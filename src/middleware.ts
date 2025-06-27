import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Temporarily disabled middleware to fix Auth0 callback
export default async function middleware(req: NextRequest) {
  // Just pass through all requests for now
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Temporarily disabled
    // '/home/:path*',
    // '/onboarding',
    // '/((?!api/auth|_next/static|_next/image|favicon.ico|test).*)',
  ],
}; 