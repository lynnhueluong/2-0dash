// app/api/auth/[auth0]/route.ts
import { NextRequest } from 'next/server';
import { handleAuth } from '@auth0/nextjs-auth0';

// For App Router, we need to use a simpler approach
export const GET = async (req: NextRequest) => {
  return handleAuth()(req);
};

export const runtime = 'nodejs';