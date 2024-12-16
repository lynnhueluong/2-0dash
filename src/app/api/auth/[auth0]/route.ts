import { handleAuth } from '@auth0/nextjs-auth0';

export const runtime = 'nodejs';
export const GET = handleAuth();
export const POST = handleAuth();
