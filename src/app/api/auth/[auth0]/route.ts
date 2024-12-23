import { handleAuth } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://the20.co',
  'https://2-0dash.vercel.app',
  'http://localhost:3000'
];

function getCorsHeaders(origin: string | null) {
  const headers = new Headers({
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, X-Requested-With, Accept',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  });

  // Check if the origin is in our allowed list
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }

  return headers;
}

export const GET = handleAuth({
  signup: async (req: NextRequest) => {
    const origin = req.headers.get('origin');
    const redirectTo = 'https://the20.co/onboarding';
    const state = { redirectTo };
    const stateParam = Buffer.from(JSON.stringify(state)).toString('base64');

    const authorizationParams = {
      client_id: process.env.AUTH0_CLIENT_ID,
      response_type: 'code',
      redirect_uri: `${process.env.BASE_URL}/api/auth/callback`,
      scope: 'openid profile email',
      prompt: 'signup',
      screen_hint: 'signup',
      state: stateParam,
    };

    const searchParams = new URLSearchParams(
      Object.entries(authorizationParams).map(([key, value]) => [key, value as string])
    );

    const response = NextResponse.redirect(
      new URL(`${process.env.AUTH0_ISSUER_BASE_URL}/authorize?${searchParams}`)
    );

    // Add CORS headers to the response
    const headers = getCorsHeaders(origin);
    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  },
  login: async (req: NextRequest) => {
    const origin = req.headers.get('origin');
    const redirectTo = 'https://the20.co/onboarding';
    const state = { redirectTo };
    const stateParam = Buffer.from(JSON.stringify(state)).toString('base64');

    const authorizationParams = {
      client_id: process.env.AUTH0_CLIENT_ID,
      response_type: 'code',
      redirect_uri: `${process.env.BASE_URL}/api/auth/callback`,
      scope: 'openid profile email',
      prompt: 'login',
      state: stateParam,
    };

    const searchParams = new URLSearchParams(
      Object.entries(authorizationParams).map(([key, value]) => [key, value as string])
    );

    const response = NextResponse.redirect(
      new URL(`${process.env.AUTH0_ISSUER_BASE_URL}/authorize?${searchParams}`)
    );

    // Add CORS headers to the response
    const headers = getCorsHeaders(origin);
    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  },
  callback: async (req: NextRequest) => {
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
          returnTo = decodedState.redirectTo || returnTo;
        } catch (parseError) {
          console.error('Failed to parse state:', parseError);
        }
      }

      const response = NextResponse.redirect(new URL(returnTo));
      
      // Add CORS headers to the response
      const headers = getCorsHeaders(origin);
      headers.forEach((value, key) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      console.error('Callback Error:', error);
      const response = NextResponse.redirect(new URL('/api/auth/login', req.url));
      
      // Add CORS headers even to error responses
      const headers = getCorsHeaders(req.headers.get('origin'));
      headers.forEach((value, key) => {
        response.headers.set(key, value);
      });

      return response;
    }
  }
});

export const POST = handleAuth();

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  
  // Return response with CORS headers
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}