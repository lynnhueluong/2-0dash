// Auth0 configuration for v3 - Vercel compatible
export const auth0Config = {
  secret: process.env.AUTH0_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  authorizationParams: {
    audience: process.env.AUTH0_AUDIENCE,
    scope: 'openid profile email'
  },
  session: {
    absoluteDuration: 24 * 60 * 60, // 24 hours
  },
  // Explicit cookie configuration for Vercel
  cookies: {
    sessionToken: {
      name: `appSession`,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    },
    state: {
      name: `appState`,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    },
    nonce: {
      name: `appNonce`,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    },
  },
};