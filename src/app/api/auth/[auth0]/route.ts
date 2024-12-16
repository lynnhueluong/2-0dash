import { handleAuth, HandlerError } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export const GET = handleAuth({
  onError(req: Request, error: HandlerError) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
});

// Optional: Add more specific handlers
export const POST = handleAuth();