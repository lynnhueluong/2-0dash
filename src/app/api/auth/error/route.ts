// src/app/api/auth/error/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get('error');
  const description = searchParams.get('error_description');

  switch (error) {
    case 'access_denied':
      if (description?.includes('onboarding process')) {
        return NextResponse.redirect(new URL('/onboarding-required', request.url));
      }
      if (description?.includes('policies')) {
        return NextResponse.redirect(new URL('/policies-required', request.url));
      }
      break;
    default:
      // Handle other errors
      return NextResponse.redirect(new URL('/error', request.url));
  }

  // Fallback
  return NextResponse.redirect(new URL('/', request.url));
}