import { handleAuth, handleLogin, handleCallback } from '@auth0/nextjs-auth0';

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
  callback: handleCallback({
    redirectUri: process.env.AUTH0_BASE_URL + '/api/auth/callback'
  })
});

export const POST = handleAuth();
