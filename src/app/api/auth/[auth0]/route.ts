// src/app/api/auth/[auth0]/route.ts
import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

const FRAMER_PREVIEW_URL = 'https://framerusercontent.com/preview-web/87af2f501b59f4647af60ff68d43fd455e7cff35c5c448db1aa7b0d1f62fa9e9/onboarding';

export const GET = handleAuth({
  signup: handleLogin({
    returnTo: FRAMER_PREVIEW_URL,
    authorizationParams: {
      prompt: 'signup',
      screen_hint: 'signup',
    }
  }),
  login: handleLogin({
    returnTo: FRAMER_PREVIEW_URL,
    authorizationParams: {
      prompt: 'login',
    }
  })
});

export const POST = handleAuth();