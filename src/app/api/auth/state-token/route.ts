// app/api/auth/state-token/route.ts
import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS__REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Generate random bytes using Web Crypto API
    const randomBuffer = new Uint8Array(16);
    crypto.getRandomValues(randomBuffer);
    const randomString = Array.from(randomBuffer)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Generate state token using user ID and timestamp
    const stateToken = `${session.user.sub}_${Date.now()}_${randomString}`;
    
    // Store in Redis with 1 hour expiry
    await redis.set(`state_token:${stateToken}`, session.user.sub, {
      ex: 3600 // 1 hour expiry
    });

    return NextResponse.json({ stateToken });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}