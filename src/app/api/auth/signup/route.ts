// src/app/api/auth/signup/route.ts
import { handleLogin } from '@auth0/nextjs-auth0';

export const GET = handleLogin({
  returnTo: '/dashboard',
  authorizationParams: {
    prompt: 'signup',
    screen_hint: 'signup'
  }
});