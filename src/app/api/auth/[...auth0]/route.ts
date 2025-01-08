// app/api/auth/[...auth0]/route.ts
import { handleAuth, handleCallback, handleLogin, Session, AfterCallback } from '@auth0/nextjs-auth0';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


export const GET = handleAuth({
  login: handleLogin({
    returnTo: 'https://the20.co/onboarding',
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email' + (process.env.AUTH0_SCOPE ? ' ' + process.env.AUTH0_SCOPE : ''),
      response_type: 'code',
      prompt: 'login'
    }
  }),
  callback: handleCallback({
    afterCallback: (async (req: any, res: any, session: Session) => {
        if (!session) {
            throw new Error('No session available');
          }
    
          return {
            ...session,
            returnTo: 'https://the20.co/onboarding'
          };
    }) as AfterCallback
  })
});