// app/api/auth/[...auth0]/route.ts
import { handleAuth, handleCallback, handleLogin, Session } from '@auth0/nextjs-auth0';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

export const GET = handleAuth({
  login: handleLogin({
    returnTo: '/auth/success',
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email',
      response_type: 'code',
      prompt: 'login'
    },
    getLoginState: () => ({
      returnTo: '/auth/success'
    })
  }),
  callback: handleCallback({
    afterCallback: async (req: any, res: any, session: Session) => {
      if (!session) {
        throw new Error('No session available');
      }
      
      // Store session state in Redis
      const stateToken = crypto.randomUUID();
      await redis.set(`auth_state:${stateToken}`, session.user.sub, {
        ex: 3600 // 1 hour expiry
      });
      
      return {
        ...session,
        returnTo: `/auth/success?state=${stateToken}`
      };
    }
  })
});