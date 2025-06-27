// Debug route to check Auth0 environment variables
import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    AUTH0_SECRET: process.env.AUTH0_SECRET ? 'SET' : 'NOT SET',
    AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL || 'NOT SET',
    AUTH0_BASE_URL: process.env.AUTH0_BASE_URL || 'NOT SET',
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID ? 'SET' : 'NOT SET',
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET ? 'SET' : 'NOT SET',
    AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
  };

  return NextResponse.json({
    message: 'Auth0 Environment Variables Check',
    environment: process.env.NODE_ENV,
    variables: envVars,
    timestamp: new Date().toISOString(),
  });
} 