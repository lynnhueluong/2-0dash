// app/onboarding/components/ProgressiveProfileForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { ProgressiveProfileFormProps } from '../../../types/onboarding';


const STEPS = {
  BASIC_INFO: 'basic_info',
  IDENTITY: 'identity',
  CAREER: 'career',
  MATCHING: 'matching'
};

interface FormState {
  name: string;
  email: string;
  city: string;
  tenKView: string;
  careerStage: string;
  breadAndButter: string;
  otherSkills: string;
  currentRole: string;
  currentCompany: string;
  identityPreference: string[];
  pronouns: string;
  
}

export default function ProgressiveProfileForm({ 
  onComplete 
}: ProgressiveProfileFormProps = {}) {  const { user } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(STEPS.BASIC_INFO);
  const [stateToken, setStateToken] = useState('');
  const [formState, setFormState] = useState<FormState>({
    name: user?.name || '',
    email: user?.email || '',
    city: '',
    tenKView: '',
    careerStage: '',
    breadAndButter: '',
    otherSkills: '',
    currentRole: '',
    currentCompany: '',
    identityPreference: [],
    pronouns: '',
    
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep !== STEPS.MATCHING) {
      const nextStep = getNextStep(currentStep);
      setCurrentStep(nextStep);
      return;
    }

    try {
      // Get state token for submission
      const tokenResponse = await fetch('/api/auth/state-token');
      if (!tokenResponse.ok) throw new Error('Failed to get state token');
      const { stateToken } = await tokenResponse.json();

      // Submit profile data
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-state-token': stateToken
        },
        body: JSON.stringify(formState)
      });

      if (!response.ok) throw new Error('Profile submission failed');

      if (onComplete) {
        await onComplete(formState);
      } else {
        router.push('/home');
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };
    
  const getNextStep = (current: string) => {
    switch (current) {
      case STEPS.BASIC_INFO: return STEPS.IDENTITY;
      case STEPS.IDENTITY: return STEPS.CAREER;
      case STEPS.CAREER: return STEPS.MATCHING;
      default: return STEPS.MATCHING;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-8">
      {currentStep === STEPS.BASIC_INFO && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={formState.name}
              onChange={(e) => setFormState({...formState, name: e.target.value})}
              className="mt-1 block w-full rounded-md border p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={formState.email}
              onChange={(e) => setFormState({...formState, email: e.target.value})}
              className="mt-1 block w-full rounded-md border p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">City</label>
            <input
              type="text"
              value={formState.city}
              onChange={(e) => setFormState({...formState, city: e.target.value})}
              className="mt-1 block w-full rounded-md border p-2"
              required
            />
          </div>
        </div>
      )}

      {currentStep === STEPS.IDENTITY && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Pronouns</label>
            <select
              value={formState.pronouns}
              onChange={(e) => setFormState({...formState, pronouns: e.target.value})}
              className="mt-1 block w-full rounded-md border p-2"
            >
              <option value="">Select...</option>
              <option value="she/her">she/her</option>
              <option value="he/him">he/him</option>
              <option value="they/them">they/them</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Identity Preferences</label>
            {['Parent', 'Caretaker', 'Woman', 'Non-binary', 'LGBTQIA+'].map(pref => (
              <label key={pref} className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={formState.identityPreference.includes(pref)}
                  onChange={(e) => {
                    const newPrefs = e.target.checked
                      ? [...formState.identityPreference, pref]
                      : formState.identityPreference.filter(p => p !== pref);
                    setFormState({...formState, identityPreference: newPrefs});
                  }}
                  className="mr-2"
                />
                {pref}
              </label>
            ))}
          </div>
        </div>
      )}

      {currentStep === STEPS.CAREER && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Career Stage</label>
            <select
              value={formState.careerStage}
              onChange={(e) => setFormState({...formState, careerStage: e.target.value})}
              className="mt-1 block w-full rounded-md border p-2"
              required
            >
              <option value="">Select...</option>
              <option value="early">Early Career (0-3 years)</option>
              <option value="mid">Mid Career (3-7 years)</option>
              <option value="advanced">Advanced Career (7+ years)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Current Role</label>
            <input
              type="text"
              value={formState.currentRole}
              onChange={(e) => setFormState({...formState, currentRole: e.target.value})}
              className="mt-1 block w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Current Company</label>
            <input
              type="text"
              value={formState.currentCompany}
              onChange={(e) => setFormState({...formState, currentCompany: e.target.value})}
              className="mt-1 block w-full rounded-md border p-2"
            />
          </div>
        </div>
      )}

      {currentStep === STEPS.MATCHING && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Bread + Butter (What you do day-to-day)</label>
            <textarea
              value={formState.breadAndButter}
              onChange={(e) => setFormState({...formState, breadAndButter: e.target.value})}
              className="mt-1 block w-full rounded-md border p-2"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Other Skills</label>
            <textarea
              value={formState.otherSkills}
              onChange={(e) => setFormState({...formState, otherSkills: e.target.value})}
              className="mt-1 block w-full rounded-md border p-2"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">10,000-ft view</label>
            <textarea
              value={formState.tenKView}
              onChange={(e) => setFormState({...formState, tenKView: e.target.value})}
              className="mt-1 block w-full rounded-md border p-2"
              rows={3}
              required
            />
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        {currentStep !== STEPS.BASIC_INFO && (
          <button
            type="button"
            onClick={() => setCurrentStep(getPreviousStep(currentStep))}
            className="px-4 py-2 text-gray-600 border rounded"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded ml-auto"
        >
          {currentStep === STEPS.MATCHING ? 'Complete Profile' : 'Next'}
        </button>
      </div>
    </form>
  );
}

function getPreviousStep(current: string) {
  switch (current) {
    case STEPS.MATCHING: return STEPS.CAREER;
    case STEPS.CAREER: return STEPS.IDENTITY;
    case STEPS.IDENTITY: return STEPS.BASIC_INFO;
    default: return STEPS.BASIC_INFO;
  }
}