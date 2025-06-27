// src/app/onboarding/page.tsx - Onboarding page component
'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import OnboardingFlow from '@/components/OnboardingFlow';

export default function OnboardingPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push('/api/auth/login');
      } else if (user.user_metadata?.onboardingCompleted) {
        // Already completed onboarding, redirect to home
        router.push('/home');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.user_metadata?.onboardingCompleted) {
    return null; // Will redirect
  }

  return <OnboardingFlow />;
}