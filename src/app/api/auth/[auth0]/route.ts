// src/app/api/auth/[auth0]/route.ts
import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

export const GET = handleAuth({
  signup: handleLogin({
    returnTo: 'https://the20.co/onboarding',
    authorizationParams: {
      prompt: 'signup',
      screen_hint: 'signup',
    }
  }),
  login: handleLogin({
    returnTo: 'https://the20.co/onboarding',
    authorizationParams: {
      prompt: 'login',
    }
  }),
  async callback(req: NextRequest) {
    try {
      const searchParams = req.nextUrl.searchParams;
      const stateParam = searchParams.get('state');
      
      let returnTo = 'https://the20.co/onboarding';
      
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

      return NextResponse.redirect(new URL(returnTo));

    } catch (error) {
      console.error('Callback Handling Error:', error);
      return NextResponse.redirect(new URL('/api/auth/login'));
    }
  }
});

export const POST = handleAuth();