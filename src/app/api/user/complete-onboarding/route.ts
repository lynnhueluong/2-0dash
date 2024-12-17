// src/app/api/user/complete-onboarding/route.ts
import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Simple success response for now
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in complete-onboarding:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}