// auth0-config.ts
const BASE_URL = process.env.AUTH0_BASE_URL || '';

export const auth0Config = {
  baseURL: BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  secret: process.env.AUTH0_SECRET,
  routes: {
    callback: '/api/auth/callback',
    login: '/api/auth/login',
    postLogoutRedirect: BASE_URL
  },
  session: {
    absoluteDuration: 24 * 60 * 60,
    cookie: {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : 'localhost'
    },
    rolling: true,
    rollingDuration: 24 * 60 * 60
  },
  authorizationParams: {
    response_type: 'code',
    audience: process.env.AUTH0_AUDIENCE,
    scope: 'openid profile email'
  }
};