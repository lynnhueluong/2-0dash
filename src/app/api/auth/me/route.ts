// app/api/auth/me/route.ts
import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const session = await getSession();
  const isLocal = process.env.NODE_ENV === 'development';
  const baseUrl = isLocal ? 'http://localhost:3000' : 'https://2-0dash.vercel.app';
  
  if (!session) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${baseUrl}/api/auth/login`
      }
    });
  }

  return NextResponse.json(session.user);
}