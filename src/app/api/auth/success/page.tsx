// app/auth/success/page.tsx
'use client';

import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export default function AuthSuccess() {
  const { user, isLoading } = useUser();

  useEffect(() => {
    const retryAuth = async (retries = 0): Promise<void> => {
      try {
        if (!isLoading && user) {
          const params = new URLSearchParams(window.location.search);
          const stateToken = params.get('state');
          
          if (!stateToken) {
            throw new Error('Missing state token');
          }
          
          const redirectUrl = new URL('https://the20.co/onboarding');
          redirectUrl.searchParams.append('state', stateToken);
          window.location.href = redirectUrl.toString();
        }
      } catch (error) {
        console.error('Auth retry failed:', error);
        if (retries < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return retryAuth(retries + 1);
        }
        window.location.href = '/api/auth/login';
      }
    };

    retryAuth();
  }, [user, isLoading]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Logging you in...</h1>
        <p>You will be redirected momentarily</p>
      </div>
    </div>
  );
}