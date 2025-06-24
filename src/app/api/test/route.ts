import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Test API working',
    hasAuth0Secret: !!process.env.AUTH0_SECRET,
    hasAuth0ClientId: !!process.env.AUTH0_CLIENT_ID,
    hasAuth0ClientSecret: !!process.env.AUTH0_CLIENT_SECRET,
    hasAuth0Issuer: !!process.env.AUTH0_ISSUER_BASE_URL,
    hasAuth0BaseUrl: !!process.env.AUTH0_BASE_URL,
    env: process.env.NODE_ENV
  });
} 