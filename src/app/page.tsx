// src/app/page.tsx
'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      {isLoading ? (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      ) : (
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Welcome</h1>
          <a
            href="/api/auth/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Login
          </a>
        </div>
      )}
    </main>
  );
}
