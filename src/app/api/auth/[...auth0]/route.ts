// app/api/auth/[...auth0]/route.ts
import { handleAuth, handleCallback, handleLogin, Session, AfterCallback } from '@auth0/nextjs-auth0';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


export const GET = handleAuth({
  login: handleLogin({
    returnTo: '/auth/success',
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email',
      response_type: 'code',
      prompt: 'login'
    }
  }),
  callback: handleCallback({
    afterCallback: async (req: any, res: any, session: Session) => {
        if (!session) {
            throw new Error('No session available');
          }
    
          return {
            ...session,
            returnTo: '/auth/success'
          };
    }
  })
});