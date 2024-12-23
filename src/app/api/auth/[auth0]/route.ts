// src/app/api/auth/[auth0]/route.ts
import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://the20.co',
  'https://2-0dash.vercel.app',
  'http://localhost:3000'
];

function getCorsHeaders(origin: string | null) {
  const headers = new Headers({
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  });

  // Only set allowed origins if origin is in our allowed list
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }

  return headers;
}

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
      const origin = req.headers.get('origin');
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

      // Validate return URL
      try {
        new URL(returnTo);
      } catch {
        console.error('Invalid return URL:', returnTo);
        returnTo = 'https://the20.co/onboarding';
      }

      const response = NextResponse.redirect(new URL(returnTo));
      
      // Add CORS headers from our helper function
      const headers = getCorsHeaders(origin);
      headers.forEach((value, key) => {
        response.headers.set(key, value);
      });

      return response;

    } catch (error) {
      console.error('Callback Handling Error:', error);
      const response = NextResponse.redirect(new URL('https://2-0dash.vercel.app/api/auth/login'));
      
      // Add CORS headers even in error case
      const headers = getCorsHeaders(req.headers.get('origin'));
      headers.forEach((value, key) => {
        response.headers.set(key, value);
      });

      return response;
    }
  }
});

export const POST = handleAuth();

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new Response(null, {
    status: 204, // Changed from 200 to 204 for OPTIONS
    headers: getCorsHeaders(origin)
  });
}