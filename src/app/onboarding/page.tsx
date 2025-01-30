'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProgressiveProfileForm from '../onboarding/components/ProgressiveProfileForm';
import { OnboardingFormData } from '../../types/onboarding';

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [stateToken, setStateToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStateToken = async () => {
      try {
        // First check URL params
        const urlToken = searchParams.get('state_token');
        if (urlToken) {
          setStateToken(urlToken);
          return;
        }

        // If no token in URL, fetch from API
        const response = await fetch('/api/auth/state-token', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to get state token');
        }

        const data = await response.json();
        setStateToken(data.stateToken);
      } catch (error) {
        console.error('Error fetching state token:', error);
        setError('Failed to initialize onboarding');
      }
    };

    fetchStateToken();
  }, [searchParams]);

  const handleOnboardingComplete = async (formData: OnboardingFormData) => {
    try {
      setError(null);
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success && stateToken) {
        window.location.href = `https://auth.the20.co/continue?state_token=${stateToken}`;
      } else if (result.success) {
        router.push('/home');
      } else {
        setError(result.error || 'Onboarding failed');
      }
    } catch (error) {
      console.error('Onboarding failed', error);
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">2.0 Onboarding: Match Profile</h1>
        <p className="text-gray-600 mb-8">
          Our matching algorithm is based on several factors, including values, identity, career philosophy, etc. 
          How you prioritize them is a driving factor to get matched.
        </p>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            {error}
          </div>
        )}
        <ProgressiveProfileForm onComplete={handleOnboardingComplete} />
      </div>
    </div>
  );
}