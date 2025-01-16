// app/onboarding/page.tsx
import ProgressiveProfileForm from '../onboarding/components/ProgressiveProfileForm';

export default function OnboardingPage() {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">2.0 Onboarding: Match Profile</h1>
        <p className="text-gray-600 mb-8">
          Our matching algorithm is based on several factors, including values, identity, career philosophy, etc. 
          How you prioritize them is a driving factor to get matched.
        </p>
        <ProgressiveProfileForm />
      </div>
    </div>
  );
}