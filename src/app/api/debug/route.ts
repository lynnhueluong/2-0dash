import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      message: 'Debug API working',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      auth0Config: {
        hasSecret: !!process.env.AUTH0_SECRET,
        hasClientId: !!process.env.AUTH0_CLIENT_ID,
        hasClientSecret: !!process.env.AUTH0_CLIENT_SECRET,
        hasIssuer: !!process.env.AUTH0_ISSUER_BASE_URL,
        hasBaseUrl: !!process.env.AUTH0_BASE_URL,
        issuerUrl: process.env.AUTH0_ISSUER_BASE_URL,
        baseUrl: process.env.AUTH0_BASE_URL
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 