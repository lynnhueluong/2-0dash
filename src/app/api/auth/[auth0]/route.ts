// src/app/api/auth/[auth0]/route.ts
import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  signup: handleLogin({
    returnTo: 'https://the20.co/onboarding',
    authorizationParams: {
      prompt: 'signup',
      screen_hint: 'signup',
    }
  }),
  login: handleLogin({
    returnTo: '/onboarding',
    authorizationParams: {
      prompt: 'login',
    }
  })
});

export const POST = handleAuth();