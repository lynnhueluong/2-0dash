'use client';

import { UserProvider } from '@auth0/nextjs-auth0';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}