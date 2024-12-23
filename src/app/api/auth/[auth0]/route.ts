// src/app/api/auth/[auth0]/route.ts
import { handleAuth, handleLogin, handleCallback } from '@auth0/nextjs-auth0';

const FRAMER_ONBOARDING_URL = 'https://framerusercontent.com/preview-web/87af2f501b59f4647af60ff68d43fd455e7cff35c5c448db1aa7b0d1f62fa9e9/onboarding';

export const GET = handleAuth({
  signup: handleLogin({ 
    returnTo: FRAMER_ONBOARDING_URL,
    getLoginState: () => ({
      returnTo: FRAMER_ONBOARDING_URL,
      screenHint: 'signup'
    })
  }),
  login: handleLogin({
    returnTo: FRAMER_ONBOARDING_URL,
    getLoginState: () => ({
      returnTo: FRAMER_ONBOARDING_URL
    })
  }),
  callback: handleCallback({
    redirectUri: `${process.env.AUTH0_BASE_URL}/api/auth/callback`
  })
});

export const POST = handleAuth();