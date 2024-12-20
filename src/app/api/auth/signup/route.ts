// src/app/api/auth/signup/route.ts
import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  signup: handleLogin({
    returnTo: '/api/app/callback',
    authorizationParams: {
      prompt: 'signup',
      screen_hint: 'signup'
    }
  })
});

export const POST = handleAuth();