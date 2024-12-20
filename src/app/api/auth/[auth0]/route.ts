// src/app/api/auth/[auth0]/route.ts
import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  signup: handleLogin({
    returnTo: '/dashboard',
    authorizationParams: {
      prompt: 'signup',
      screen_hint: 'signup',
    }
  }),
  // Regular login should be separate from signup
  login: handleLogin({
    returnTo: '/dashboard',
    authorizationParams: {
      prompt: 'login',
    }
  }),
});

export const POST = handleAuth();