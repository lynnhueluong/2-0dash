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
      const code = searchParams.get('code');
      const stateParam = searchParams.get('state');
      
      if (!code) {
        throw new Error('No authorization code provided');
      }

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

      // Manual token exchange
      const tokenResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.AUTH0_CLIENT_ID!,
          client_secret: process.env.AUTH0_CLIENT_SECRET!,
          code: code,
          redirect_uri: `${process.env.AUTH0_BASE_URL}/api/auth/callback`
        })
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Token exchange failed: ${errorText}`);
      }

      // Redirect to the intended page
      return NextResponse.redirect(new URL(returnTo));

    } catch (error) {
      console.error('Callback Handling Critical Error:', error);
      return NextResponse.redirect(new URL('/api/auth/login'));
    }
  }
});

export const POST = handleAuth();