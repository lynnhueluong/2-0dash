// app/api/auth/[...auth0]/route.ts
import { handleAuth, handleCallback, handleLogin, Session } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  login: handleLogin({
    returnTo: '/dashboard',
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: process.env.AUTH0_SCOPE
    }
  }),
  callback: handleCallback({
    afterCallback: async (req: any, re: any, session: Session) => {
      return session;
    }
  }),
  onError: (req: Request, error: Error) => {
    console.error('Auth error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});