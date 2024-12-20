// src/app/dashboard/page.tsx
'use client';

import { useUser } from '@auth0/nextjs-auth0/client';

export default function DashboardPage() {
  const { user, error, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error.message}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">
        Please <a href="/api/auth/login" className="text-blue-500">log in</a>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to Dashboard</h1>
      <div>Logged in as: {user.email}</div>
    </div>
  );
}