// src/app/api/auth/[auth0]/route.ts
import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  login: handleLogin({
    returnTo: '/dashboard',
    authorizationParams: {
      prompt: 'login',
    }
  }),
  signup: handleLogin({
    returnTo: '/dashboard',
    authorizationParams: {
      prompt: 'signup',
      screen_hint: 'signup',
    }
  })
});

export const POST = handleAuth();