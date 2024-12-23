import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req, new NextResponse(null, { status: 302 }));
    
    if (!session) {
      return NextResponse.redirect(new URL('/api/auth/login', req.url));
    }

  
    return NextResponse.redirect(new URL('https://the20.co/onboarding', req.url));
  } catch (error) {
    console.error('Error handling callback:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}