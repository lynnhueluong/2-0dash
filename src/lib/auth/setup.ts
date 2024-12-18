// src/lib/auth/setup.ts
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

export function generateAuthSecret() {
  if (!process.env.AUTH0_SECRET) {
    const secret = createHash('sha256')
      .update(Date.now().toString())
      .digest('hex');
    process.env.AUTH0_SECRET = secret;
  }
  return process.env.AUTH0_SECRET;
}

export function handleAuthError(error: Error) {
  console.error('Auth error:', error);
  return NextResponse.json(
    { error: 'Authentication error occurred' },
    { status: 500 }
  );
}