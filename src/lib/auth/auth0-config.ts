import { NextRequest } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { ConfigParameters } from '@auth0/nextjs-auth0';

// Define stronger types for metadata
interface AppMetadata {
  onboarded: boolean;
  needs_onboarding: boolean;
  onboarding_completed_at?: string;
  code_of_conduct_accepted?: boolean;
  data_privacy_policy_accepted?: boolean;
  terms_and_conditions_accepted?: boolean;
  last_login?: string;
}

interface UserMetadata {
  [key: string]: any;
}

interface UserProfile {
  sub: string;
  app_metadata?: AppMetadata;
  user_metadata?: UserMetadata;
  [key: string]: any;
}

// Environment validation
const validateEnv = () => {
  const requiredEnvVars = [
    'AUTH0_SECRET',
    'AUTH0_BASE_URL',
    'AUTH0_ISSUER_BASE_URL',
    'AUTH0_CLIENT_ID',
    'AUTH0_CLIENT_SECRET',
    'AUTH0_MANAGEMENT_API_TOKEN'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

validateEnv();

// Auth0 configuration
export const auth0Config: ConfigParameters = {
  secret: process.env.AUTH0_SECRET!,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  routes: {
    callback: '/api/auth/callback',
    postLogoutRedirect: '/',
    login: '/api/auth/login'
  },
  session: {
    absoluteDuration: 24 * 60 * 60,
    cookie: {
      domain: process.env.NODE_ENV === 'production' ? 'your-domain.com' : 'localhost',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  },
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email'
  },
  organization: process.env.AUTH0_ORGANIZATION_ID,
};

// User profile fetching with better error handling
export async function getUserProfile(req: NextRequest): Promise<UserProfile | null> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return null;
    }

    const response = await fetch(
      `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${session.user.sub}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.AUTH0_MANAGEMENT_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to fetch user profile:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return null;
    }

    const userData = await response.json();
    
    return {
      sub: session.user.sub,
      ...userData,
      app_metadata: userData.app_metadata || {},
      user_metadata: userData.user_metadata || {}
    };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

// Helper functions for checking user state
export function isOnboarded(user: UserProfile | null): boolean {
  return Boolean(user?.app_metadata?.onboarded);
}

export function needsOnboarding(user: UserProfile | null): boolean {
  return Boolean(user?.app_metadata?.needs_onboarding);
}

export function hasAcceptedPolicies(user: UserProfile | null): boolean {
  const metadata = user?.app_metadata;
  return Boolean(
    metadata?.code_of_conduct_accepted &&
    metadata?.data_privacy_policy_accepted &&
    metadata?.terms_and_conditions_accepted
  );
}

// Initialize auth handler with error handling
export async function initAuth(): Promise<ConfigParameters> {
  try {
    validateEnv();
    return auth0Config;
  } catch (error) {
    console.error('Failed to initialize Auth0 configuration:', error);
    throw error;
  }
}

