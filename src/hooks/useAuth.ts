// src/hooks/useAuth.ts
import { useUser } from '@auth0/nextjs-auth0/client'; // This is all we need for user data
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useAuth = () => {
  const { user, error, isLoading } = useUser(); // useUser from Auth0 handles everything
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/api/auth/login');
    }
  }, [user, isLoading, router]);

  return { user, error, isLoading };
};