import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Temporarily disabled middleware to isolate Auth0 state cookie issue
export default async function middleware(req: NextRequest) {
  // Skip all middleware for now to test Auth0 callback
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Temporarily disabled all matchers
  ],
};