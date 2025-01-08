// app/auth/success/page.tsx
'use client';

import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function AuthSuccess() {
  const { user, isLoading } = useUser();

  useEffect(() => {
    const setupRedirect = async () => {
      if (!isLoading && user) {
        try {
          // Get state token
          const tokenResponse = await fetch('/api/auth/state-token');
          const { stateToken } = await tokenResponse.json();
          
          // Redirect to Framer with state token
          const redirectUrl = new URL('https://the20.co/onboarding');
          redirectUrl.searchParams.append('state', stateToken);
          window.location.href = redirectUrl.toString();
        } catch (error) {
          console.error('Redirect setup failed:', error);
          // Redirect to error page or retry
        }
      }
    };

    setupRedirect();
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