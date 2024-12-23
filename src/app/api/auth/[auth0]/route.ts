// src/app/api/auth/[auth0]/route.ts
import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

const FRAMER_ONBOARDING_URL = 'https://project-dmklsn3yttooaux1sfgg.framercanvas.com/onboarding';

export const GET = handleAuth({
  signup: handleLogin({
    returnTo: FRAMER_ONBOARDING_URL,
    authorizationParams: {
      prompt: 'signup',
      screen_hint: 'signup',
    }
  }),
  login: handleLogin({
    returnTo: FRAMER_ONBOARDING_URL,
    authorizationParams: {
      prompt: 'login',
    }
  })
});

export const POST = handleAuth();