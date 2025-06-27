//src/app/api/auth/[...auth0]/route.ts
import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  returnTo: '/onboarding'
});

export const dynamic = 'force-dynamic';