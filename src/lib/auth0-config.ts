// Auth0 configuration for v3 - Minimal settings for Vercel
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
  // Use minimal cookie configuration - let Auth0 handle defaults
};