'use client';

import React from 'react';

interface UserProfile {
  name: string;
  email: string;
  pronouns?: string;
  careerStage: string;
  skills: string[];
  industries: string[];
  workStyle: string;
  careerGoals: string[];
  location: string;
  onboardingData: any;
}

interface UnifiedDashboardProps {
  userProfile: UserProfile;
}

const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ userProfile }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userProfile.name}!
              </h1>
              <p className="text-gray-600 mt-1">
                {userProfile.careerStage} • {userProfile.location}
              </p>
            </div>
            <a
              href="/api/auth/logout"
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Logout
            </a>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{userProfile.name}</p>
                </div>
                {userProfile.pronouns && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Pronouns</label>
                    <p className="text-gray-900">{userProfile.pronouns}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{userProfile.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Career Stage</label>
                  <p className="text-gray-900">{userProfile.careerStage}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Work Style</label>
                  <p className="text-gray-900">{userProfile.workStyle}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills & Goals */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Key Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Career Goals</h3>
                  <div className="space-y-2">
                    {userProfile.careerGoals.map((goal, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Opportunities Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Opportunities</h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Finding opportunities for you...</h3>
              <p className="text-gray-600">
                We&apos;re analyzing your profile and preferences to find the best matches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard; 