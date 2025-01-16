// app/auth/success/page.tsx
'use client';

import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthSuccess() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignup = searchParams.get('screen_hint') === 'signup';

  useEffect(() => {
    // Handle any auth errors
    if (error) {
      console.error('Auth error:', error);
      router.push('/api/auth/login');
      return;
    }

    const checkUserStatus = async () => {
      if (!isLoading && user) {
        try {
          // For signup flow, go directly to onboarding
          if (isSignup) {
            router.push('/onboarding');
            return;
          }

          // Check onboarding status
          const response = await fetch('/api/onboarding', {
            credentials: 'include',
            headers: {
              'Accept': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Onboarding check failed');
          }

          const data = await response.json();

          // Determine redirect based on onboarding status
          if (data.error === 'Not authenticated' || !data.user?.app_metadata?.onboarded) {
            router.push('/onboarding');
          } else {
            router.push('/home');
          }
        } catch (error) {
          console.error('Error checking user status:', error);
          // On error, safely redirect to onboarding
          router.push('/onboarding');
        }
      }
    };

    checkUserStatus();
  }, [user, isLoading, router, isSignup, error]);

  // Show loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <h1 className="text-xl font-semibold">Setting up your account...</h1>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-semibold text-red-600">Authentication Error</h1>
          <p className="text-gray-600">Please try logging in again.</p>
          <button 
            onClick={() => router.push('/api/auth/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Default loading state
  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <h1 className="text-xl font-semibold">Preparing your dashboard...</h1>
      </div>
    </div>
  );
}