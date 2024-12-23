import React, { useState, FormEvent } from 'react';

interface FormData {
  name: string;
  city: string;
  tenKView: string;
  careerStage: string;
  email: string;
}

const OnboardingForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formElement = event.target as HTMLFormElement;
    const formData = new FormData(formElement);
    
    const data: FormData = {
      name: formData.get('Name') as string,
      city: formData.get('City') as string,
      tenKView: formData.get('10,000-ft view') as string,
      careerStage: formData.get('Career Stage') as string,
      email: formData.get('email') as string
    };

    try {
      const response = await fetch('https://2-0dash.vercel.app/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit form');
      }

      const result = await response.json();
      
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'An error occurred during submission');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-6">
          {/* Existing form fields will be handled by Framer */}
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full p-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default OnboardingForm;