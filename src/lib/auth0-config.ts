// Auth0 configuration for v3
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
  // Simplified cookie configuration for Vercel compatibility
  cookies: {
    sessionToken: {
      name: `appSession`,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
};