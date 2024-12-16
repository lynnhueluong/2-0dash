// src/app/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the Framer component with SSR disabled
const AuthFlow = dynamic(
  () => import('@/components/framer/AuthFlow'),
  { ssr: false } // Disable SSR for Framer component
);

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-white to-gray-100">
      <Suspense fallback={
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      }>
        <AuthFlow
          buttonText="Get Started"
          buttonColor="#0099ff"
          redirectUrl="/dashboard"
          showUserProfile={true}
          theme="light"
        />
      </Suspense>
    </main>
  );
}