//src/app/api/auth/[...auth0]/route.ts
import { handleAuth, handleLogin, handleCallback } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { Session } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  callback: handleCallback({
    async afterCallback(req: NextApiRequest, res: NextApiResponse, session: Session) {
      if (!session.user.user_metadata?.onboardingCompleted) {
        return {
          ...session,
          returnTo: '/onboarding'
        };
      }

      return {
        ...session,
        returnTo: '/home'
      };
    }
  }),
  signup: handleLogin({
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email',
      screen_hint: 'signup',
      prompt: 'login'
    },
    returnTo: '/onboarding'
  }),
  login: handleLogin({
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email',
      prompt: 'login'
    },
    returnTo: '/home'
  })
});

export const dynamic = 'force-dynamic';