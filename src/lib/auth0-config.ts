export const auth0Config = {
  baseURL: 'https://dash.the20.co',
  issuerBaseURL: 'https://auth.the20.co',
  clientID: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  secret: process.env.AUTH0_SECRET!,
  routes: {
    callback: '/api/auth/callback',
    login: '/api/auth/login',
    logout: '/api/auth/logout'
  },
  authorizationParams: {
    audience: process.env.AUTH0_AUDIENCE,
    scope: 'openid profile email'
  },
  session: {
    absoluteDuration: 24 * 60 * 60,
    rolling: true,
    cookie: {
      secure: true,
      sameSite: 'strict',
      domain: process.env.COOKIE_DOMAIN || 'dash.the20.co',
      httpOnly: true
    }
  },
  // Add these configurations
  redirectUri: 'https://dash.the20.co/api/auth/callback',
  postLogoutRedirectUri: 'https://dash.the20.co/login'
};