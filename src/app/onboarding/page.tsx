// src/app/onboarding/page.tsx
'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function OnboardingPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: '',
    interests: [],
    preferences: {}
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/api/auth/login');
    return null;
  }

  const handleComplete = async () => {
    try {
      const response = await fetch('/api/user/complete-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {[1, 2, 3].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  {stepNumber}
                </div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Welcome to 2.0 Dash!</h2>
              <p className="text-gray-600">Let's get your profile set up.</p>
              <Button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Your Role</h2>
              {/* Add your role selection form fields here */}
              <Button
                onClick={() => setStep(3)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Continue
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Almost Done!</h2>
              {}
              <Button
                onClick={handleComplete}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Complete Setup
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}