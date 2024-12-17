// src/app/api/auth/onboarding-status/route.ts
import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      isAuthenticated: true,
      isOnboarded: session.user.app_metadata?.onboarded === true,
      onboardingData: session.user.app_metadata?.onboardingData || null
    });
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}