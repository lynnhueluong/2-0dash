// src/app/home/page.tsx
'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UnifiedDashboard from '@/components/UnifiedDashboard';

export default function HomePage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/api/auth/login');
      } else if (!user.user_metadata?.onboardingCompleted) {
        router.push('/onboarding');
      } else {
        fetchUserProfile();
      }
    }
  }, [user, isLoading, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user-profile');
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  if (isLoading || !user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return <UnifiedDashboard userProfile={userProfile} />;
}
