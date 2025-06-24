'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, User, Target, Briefcase, Heart, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

const initialFormData = {
  name: '',
  preferredName: '',
  pronouns: '',
  currentRole: '',
  currentCompany: '',
  skillsExpertise: '',
  workStyle: '',
  careerAdvancement: [] as string[],
  idealCareer: '',
  resourceTypes: [] as string[],
  interestedIndustries: '',
  location: '',
  timezone: '',
  availability: '',
  goals: '',
  challenges: '',
  supportNeeded: ''
};

const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const steps = [
    { title: 'Basic Info', icon: User },
    { title: 'Career Goals', icon: Target },
    { title: 'Work Style', icon: Briefcase },
    { title: 'Preferences', icon: Heart },
    { title: 'Review', icon: Star }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field as keyof typeof prev] as string[], value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Redirect to home dashboard
        router.push('/home');
        router.refresh(); // Refresh to update middleware state
      } else {
        console.error('Onboarding submission failed');
      }
    } catch (error) {
      console.error('Error submitting onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Tell us about yourself</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Name
                </label>
                <input
                  type="text"
                  value={formData.preferredName}
                  onChange={(e) => handleInputChange('preferredName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pronouns
                </label>
                <input
                  type="text"
                  value={formData.pronouns}
                  onChange={(e) => handleInputChange('pronouns', e.target.value)}
                  placeholder="e.g., she/her, they/them, he/him"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Role *
                </label>
                <input
                  type="text"
                  value={formData.currentRole}
                  onChange={(e) => handleInputChange('currentRole', e.target.value)}
                  placeholder="e.g., Software Engineer, Product Manager"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Company
                </label>
                <input
                  type="text"
                  value={formData.currentCompany}
                  onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Career Goals & Aspirations</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills & Expertise *
                </label>
                <textarea
                  value={formData.skillsExpertise}
                  onChange={(e) => handleInputChange('skillsExpertise', e.target.value)}
                  placeholder="Describe your key skills, technical expertise, and areas of specialization..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ideal Career Path
                </label>
                <input
                  type="text"
                  value={formData.idealCareer}
                  onChange={(e) => handleInputChange('idealCareer', e.target.value)}
                  placeholder="e.g., Senior Product Manager, Engineering Director"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Career Advancement Goals (select all that apply)
                </label>
                <div className="space-y-2">
                  {['Skill Development', 'Leadership', 'Industry Transition', 'Entrepreneurship', 'Networking', 'Mentorship'].map((goal) => (
                    <label key={goal} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.careerAdvancement.includes(goal)}
                        onChange={(e) => handleArrayChange('careerAdvancement', goal, e.target.checked)}
                        className="mr-2"
                      />
                      {goal}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Work Style & Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Style *
                </label>
                <select
                  value={formData.workStyle}
                  onChange={(e) => handleInputChange('workStyle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select your work style</option>
                  <option value="Collaborative">Collaborative - I thrive in team environments</option>
                  <option value="Independent">Independent - I prefer working autonomously</option>
                  <option value="Hybrid">Hybrid - I adapt based on the project</option>
                  <option value="Leadership">Leadership - I enjoy guiding and mentoring others</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industries of Interest
                </label>
                <input
                  type="text"
                  value={formData.interestedIndustries}
                  onChange={(e) => handleInputChange('interestedIndustries', e.target.value)}
                  placeholder="e.g., Tech, Healthcare, Finance, Education"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Austin, TX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Resource Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Resource Types (select all that apply)
                </label>
                <div className="space-y-2">
                  {['Mentorship', 'Networking Events', 'Skill Workshops', 'Job Opportunities', 'Industry Insights', 'Peer Groups'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.resourceTypes.includes(type)}
                        onChange={(e) => handleArrayChange('resourceTypes', type, e.target.checked)}
                        className="mr-2"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Challenges
                </label>
                <textarea
                  value={formData.challenges}
                  onChange={(e) => handleInputChange('challenges', e.target.value)}
                  placeholder="What challenges are you currently facing in your career?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Support Needed
                </label>
                <textarea
                  value={formData.supportNeeded}
                  onChange={(e) => handleInputChange('supportNeeded', e.target.value)}
                  placeholder="What kind of support would be most valuable to you?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Review Your Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Basic Information</h3>
                <p className="text-gray-600">Name: {formData.name}</p>
                <p className="text-gray-600">Preferred Name: {formData.preferredName || 'Not specified'}</p>
                <p className="text-gray-600">Pronouns: {formData.pronouns || 'Not specified'}</p>
                <p className="text-gray-600">Current Role: {formData.currentRole}</p>
                <p className="text-gray-600">Company: {formData.currentCompany || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Career Goals</h3>
                <p className="text-gray-600">Skills: {formData.skillsExpertise}</p>
                <p className="text-gray-600">Ideal Career: {formData.idealCareer || 'Not specified'}</p>
                <p className="text-gray-600">Goals: {formData.careerAdvancement.join(', ') || 'None selected'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Preferences</h3>
                <p className="text-gray-600">Work Style: {formData.workStyle}</p>
                <p className="text-gray-600">Industries: {formData.interestedIndustries || 'Not specified'}</p>
                <p className="text-gray-600">Location: {formData.location || 'Not specified'}</p>
                <p className="text-gray-600">Resource Types: {formData.resourceTypes.join(', ') || 'None selected'}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted ? 'bg-blue-600 border-blue-600 text-white' :
                    isActive ? 'border-blue-600 text-blue-600' :
                    'border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {steps[currentStep].title}
            </h1>
            <p className="text-gray-600 mt-1">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center px-4 py-2 rounded-md ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Completing...
                </>
              ) : (
                <>
                  Complete Onboarding
                  <Check className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow; 