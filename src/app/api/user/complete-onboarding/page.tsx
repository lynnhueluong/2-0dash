// src/app/user/complete-onboarding/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingForm from '@/components/framer/OnboardingForm';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function CompleteOnboarding() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    // Check onboarding status
    const checkStatus = async () => {
      const response = await fetch('/api/auth/onboarding-status');
      const data = await response.json();

      // If user is already onboarded, redirect to dashboard
      if (data.isOnboarded) {
        router.push('/dashboard');
      }
    };

    if (user) {
      checkStatus();
    }
  }, [user, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/api/auth/login');
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Complete Your Profile</h1>
      <OnboardingForm />
    </div>
  );
}