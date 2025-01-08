// auth0-config.ts
const BASE_URL = process.env.AUTH0_BASE_URL || '';

export const auth0Config = {
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  secret: process.env.AUTH0_SECRET,
  routes: {
    callback: '/api/auth/callback',
    login: '/api/auth/login',
  },
  session: {
    absoluteDuration: 24 * 60 * 60,
    cookie: {
      domain: process.env.NODE_ENV === 'production' ? '2-0dash.vercel.app' : undefined,
      secure: true,
      sameSite: 'lax', 
      httpOnly: true,
      path: '/'
    },
    storeIDToken: true,
    rolling: true,
    rollingDuration: 24 * 60 * 60
  },
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email',
    audience: process.env.AUTH0_AUDIENCE,
    

  }
};