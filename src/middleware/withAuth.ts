// src/middleware/withAuth.ts
import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function withAuth(request: NextRequest) {
  try {
    const session = await getSession();
    const { pathname } = request.nextUrl;

    // Public paths that don't require authentication
    const publicPaths = ['/api/auth/login', '/api/auth/callback', '/api/auth/logout', '/'];
    if (publicPaths.includes(pathname)) {
      return NextResponse.next();
    }

    // If there's no session and we're not on a public path, redirect to login
    if (!session) {
      return NextResponse.redirect(new URL('/api/auth/login', request.url));
    }

    // If we're on the dashboard and user hasn't completed onboarding
    if (pathname.startsWith('/dashboard') && !session.user?.onboarded) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    // If we're on onboarding and user has completed it
    if (pathname.startsWith('/onboarding') && session.user?.onboarded) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.redirect(new URL('/api/auth/login', request.url));
  }
}