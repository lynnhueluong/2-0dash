import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export const GET = handleAuth({
  login: handleLogin({
    returnTo: '/dashboard',
    authorizationParams: {
      prompt: 'login',
    },
  }),
  signup: handleLogin({
    returnTo: '/dashboard',
    authorizationParams: {
      prompt: 'signup',
      screen_hint: 'signup',
    },
  }),
});

// Optional: Add more specific handlers
export const POST = handleAuth();