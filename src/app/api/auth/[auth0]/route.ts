// src/app/api/auth/[auth0]/route.ts
import { handleAuth } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

export const GET = handleAuth({
  async callback(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const stateParam = searchParams.get('state');
    
    let returnTo = '/dashboard';
    
    if (stateParam) {
      try {
        const decodedState = JSON.parse(
          Buffer.from(stateParam, 'base64').toString()
        );
        returnTo = decodedState.returnTo || returnTo;
      } catch (parseError) {
        console.error('Failed to parse state:', parseError);
      }
    }

    // Use the default callback handler
    return handleAuth().callback(req, {
      returnTo
    });
  }
});

export const POST = handleAuth();