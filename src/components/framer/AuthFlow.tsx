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
        // Use window.location.href for more reliable redirect
        window.location.href = '/api/auth/login';
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    }
  }, [user, redirectUrl, router]);

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8">
          Third Space for Ambition
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Your career matching platform
        </p>
        
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
            className="w-full py-2 px-4 text-white rounded-lg transition-colors"
            style={{ backgroundColor: buttonColor }}
          >
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AuthFlow;