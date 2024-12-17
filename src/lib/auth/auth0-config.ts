// src/lib/auth/auth0-config.ts
import { NextRequest } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export const initAuth0Config = {
  routes: {
    callback: '/api/auth/callback',
    login: '/api/auth/login',
    logout: '/api/auth/logout'
  },
  session: {
    absoluteDuration: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  },
};

export async function getUserProfile(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) return null;

  try {
    const response = await fetch(
      `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${session.user.sub}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.AUTH0_MANAGEMENT_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const profile = await response.json();
    return {
      ...session.user,
      app_metadata: profile.app_metadata || {},
      user_metadata: profile.user_metadata || {},
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export function isOnboarded(user: any): boolean {
  return Boolean(user?.app_metadata?.onboarded);
}