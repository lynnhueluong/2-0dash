import { handleAuth } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest): Promise<NextResponse> => {
  try {
    return handleAuth()(req);
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
};