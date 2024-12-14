// src/lib/auth/auth0-config.ts
interface Auth0Config {
  baseURL: string;
  issuerBaseURL: string;
  clientID: string;
  clientSecret: string;
  secret: string;
}

export const auth0Config: Auth0Config = {
  baseURL: process.env.AUTH0_BASE_URL || '',
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || '',
  clientID: process.env.AUTH0_CLIENT_ID || '',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
  secret: process.env.AUTH0_SECRET || ''
};

// Type guard to ensure all required environment variables are present
export function validateAuth0Config(config: Auth0Config): boolean {
  return Boolean(
    config.baseURL &&
    config.issuerBaseURL &&
    config.clientID &&
    config.clientSecret &&
    config.secret
  );
}

// Validate config on initialization
if (!validateAuth0Config(auth0Config)) {
  throw new Error('Missing required Auth0 configuration. Please check your environment variables.');
}