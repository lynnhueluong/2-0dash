'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import type { OnboardingFormData } from '@/types/onboarding';

export default function OnboardingForm() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();

  const [formData, setFormData] = useState<OnboardingFormData>({
    name: user?.name || '',
    email: user?.email || '',
    city: '',
    tenKView: '',
    careerStage: '',
    breadAndButter: '',
    otherSkills: '',
    currentRole: '',
    currentCompany: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/api/auth/login');
    }
  }, [user, isUserLoading, router]);

  // Prefill form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (field: keyof OnboardingFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Not authenticated. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('https://the20.co/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          name: formData.name || user.name,
          email: formData.email || user.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }


 
      router.push('/dashboard');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (isUserLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  // Ensure user is authenticated before rendering form
  if (!user) {
    return null;
  }

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
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full p-2 border rounded-md"
              required
              readOnly
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
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="careerStage" className="block text-sm font-medium">
              Career Stage
            </label>
            <select
              id="careerStage"
              value={formData.careerStage}
              onChange={(e) => handleInputChange('careerStage', e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select Career Stage</option>
              <option value="Early Career">Early Career</option>
              <option value="Mid Career">Mid Career</option>
              <option value="Senior">Senior</option>
              <option value="Executive">Executive</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="currentRole" className="block text-sm font-medium">
              Current Role
            </label>
            <input
              id="currentRole"
              type="text"
              value={formData.currentRole}
              onChange={(e) => handleInputChange('currentRole', e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="currentCompany" className="block text-sm font-medium">
              Current Company
            </label>
            <input
              id="currentCompany"
              type="text"
              value={formData.currentCompany}
              onChange={(e) => handleInputChange('currentCompany', e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tenKView" className="block text-sm font-medium">
              10,000-ft View (Your Professional Overview)
            </label>
            <textarea
              id="tenKView"
              value={formData.tenKView}
              onChange={(e) => handleInputChange('tenKView', e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={4}
              required
              placeholder="Briefly describe your professional journey, aspirations, and key strengths"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Complete Profile'}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}