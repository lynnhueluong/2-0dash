// app/api/protected/user-data/route.ts
import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS__REST_URL!,
  token: process.env.UPSTASH_REDIS__REST_TOKEN!
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const stateToken = req.headers.get('x-state-token');
    if (!stateToken) {
      return NextResponse.json({ error: 'Missing state token' }, { status: 401 });
    }

    // Verify state token from Redis
    const storedUserId = await redis.get(`state_token:${stateToken}`);
    if (!storedUserId || storedUserId !== session.user.sub) {
      return NextResponse.json({ error: 'Invalid state token' }, { status: 401 });
    }

    // If valid, delete the used token
    await redis.del(`state_token:${stateToken}`);

    return NextResponse.json({
      user: {
        email: session.user.email,
        name: session.user.name,
        sub: session.user.sub
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}