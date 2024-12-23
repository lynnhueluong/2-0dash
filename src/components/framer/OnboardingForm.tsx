'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Card, CardHeader, CardContent } from 'src/components/ui/card';
import type { OnboardingFormData } from '@/types/onboarding';

export default function OnboardingForm() {
  const { user, isLoading } = useUser();
  const [formData, setFormData] = useState<OnboardingFormData>({
    name: user?.name || '',
    email: user?.email || '',
    city: '',
    tenKView: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/api/auth/login';
    }
  }, [user, isLoading]);


  const handleInputChange = (field: keyof OnboardingFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please log in first');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('https://2-0dash.vercel.app/api/auth/onboarding-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          email: user.email
        })
      });

    if (!response.ok) throw new Error('Submission failed');

    await fetch('/api/update-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ onboarded: true })
      });

    // Handle successful submission
    window.location.href = '/dashboard';

  } catch (err) {
    setError(err instanceof Error ? err.message : 'Something went wrong');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <Card className="max-w-2xl mx-auto p-4">
      <CardHeader>
        <h2 className="text-2xl font-bold">Complete Your Profile</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="city" className="block text-sm font-medium">
              City
            </label>
            <input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tenKView" className="block text-sm font-medium">
              10,000-ft view
            </label>
            <textarea
              id="tenKView"
              value={formData.tenKView}
              onChange={(e) => handleInputChange('tenKView', e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={4}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}