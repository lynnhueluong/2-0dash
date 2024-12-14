'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from '@/components/ui/button';

interface AuthFlowProps {
  buttonText: string;
  buttonColor: string;
  redirectUrl: string;
  showUserProfile: boolean;
  theme: 'light' | 'dark';
}

const AuthFlow = ({
  buttonText,
  buttonColor,
  redirectUrl,
  showUserProfile,
  theme
}: AuthFlowProps) => {
  const router = useRouter();
  const { user, isLoading } = useUser();

  const handleAuth = useCallback(async () => {
    if (user) {
      router.push(redirectUrl);
    } else {
      // Uses the Next.js Auth0 API route for login
      window.location.href = '/api/auth/login';
    }
  }, [user, redirectUrl, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`w-full max-w-md mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {showUserProfile && user ? (
        <div className="mb-6 text-center">
          {user.picture && (
            <img
              src={user.picture}
              alt={user.name || 'User'}
              className="w-16 h-16 rounded-full mx-auto mb-4"
            />
          )}
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-sm opacity-75">{user.email}</p>
          <Button
            onClick={() => window.location.href = '/api/auth/logout'}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white"
          >
            Log Out
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleAuth}
          className={`w-full py-2 px-4 rounded-lg transition-colors ${
            buttonColor ? buttonColor : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {buttonText || 'Get Started'}
        </Button>
      )}
    </div>
  );
};

export default AuthFlow;