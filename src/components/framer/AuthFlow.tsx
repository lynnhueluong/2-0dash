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
  buttonText = "Get Started",
  buttonColor = "#0099ff",
  redirectUrl = "/dashboard",
  showUserProfile = true,
  theme = "light"
}: AuthFlowProps) => {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [error, setError] = useState<string | null>(null);

  const handleAuth = useCallback(async () => {
    try {
      if (user) {
        router.push(redirectUrl);
      } else {
        window.location.href = '/api/auth/login';
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    }
  }, [user, redirectUrl, router]);

  const containerContent = () => {
    if (isLoading) {
      return <div className="text-center py-4">Loading...</div>;
    }

    if (showUserProfile && user) {
      return (
        <div className="w-full text-center">
          <h1 className="text-3xl font-bold text-center mb-8">
            Third Space for Ambition
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Your career matching platform
          </p>
          
          <div className="mb-6">
            {user.picture && (
              <div className="relative w-16 h-16 mx-auto mb-4 overflow-hidden rounded-full">
                <Image
                  src={user.picture}
                  alt={user.name || 'User'}
                  className="rounded-full object-cover"
                  fill
                  sizes="(max-width: 64px) 100vw"
                  priority
                />
              </div>
            )}
            <h2 className="text-xl font-semibold mb-2">{user.name}</h2>
            <p className="text-sm text-gray-600 mb-4">{user.email}</p>
            <Button
              onClick={() => router.push('/api/auth/logout')}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Log Out
            </Button>
          </div>
        </div>
      );
    }

    return (
      <>
        <h1 className="text-3xl font-bold text-center mb-8">
          Third Space for Ambition
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Your career matching platform
        </p>
        <Button
          onClick={handleAuth}
          className="w-full py-2 px-4 text-white rounded-lg transition-colors"
          style={{ backgroundColor: buttonColor }}
        >
          {buttonText}
        </Button>
      </>
    );
  };

  return (
    <div className={`w-full max-w-md mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        {error && (
          <div className="mb-4 p-2 text-red-500 text-sm text-center">
            {error}
          </div>
        )}
        {containerContent()}
      </div>
    </div>
  );
};

export default AuthFlow;