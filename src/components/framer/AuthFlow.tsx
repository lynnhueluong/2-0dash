'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
  const [error, setError] = useState<string | null>(null);

  const handleAuth = useCallback(async () => {
    try {
      if (user) {
        router.push(redirectUrl);
      } else {
        router.push(`/api/auth/login?returnTo=${redirectUrl}`);
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    }
  }, [user, redirectUrl, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`w-full max-w-md mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {error && (
        <div className="mb-4 p-2 text-red-500 text-sm text-center">
          {error}
        </div>
      )}
      
      {showUserProfile && user ? (
        <div className="mb-6 text-center">
          {user.picture && (
            <div className="relative w-16 h-16 mx-auto mb-4">
              <Image
                src={user.picture}
                alt={user.name || 'User'}
                className="rounded-full"
                fill
                sizes="(max-width: 64px) 100vw"
                priority
              />
            </div>
          )}
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-sm opacity-75">{user.email}</p>
          <Button
            onClick={() => router.push('/api/auth/logout')}
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