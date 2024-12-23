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

      const response = NextResponse.redirect(new URL(returnTo));
      
      response.headers.set('Access-Control-Allow-Origin', 'https://the20.co');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return response;

    } catch (error) {
      console.error('Callback Handling Error:', error);
      const response = NextResponse.redirect(new URL('/api/auth/login'));
      response.headers.set('Access-Control-Allow-Origin', 'https://the20.co');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }
  }
});

export const POST = handleAuth();

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://the20.co',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    }
  });
}