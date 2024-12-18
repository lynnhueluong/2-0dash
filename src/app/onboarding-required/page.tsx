// src/app/onboarding-required/page.tsx
export default function OnboardingRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Onboarding Required</h1>
        <p className="mb-4">Please complete the onboarding process to continue.</p>
        <a 
          href="/api/auth/login" 
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Onboarding
        </a>
      </div>
    </div>
  );
}