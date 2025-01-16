import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req, NextResponse.next());
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve the stored state token from the user's session
    const storedStateToken = session.user.stateToken;

    // Verify the state token from the request headers
    const requestStateToken = req.headers.get('x-state-token');
    if (!requestStateToken || requestStateToken !== storedStateToken) {
      return NextResponse.json({ error: 'Invalid state token' }, { status: 400 });
    }

    const data = await req.json();

    // Update user metadata in Auth0
    const response = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${session.user.sub}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AUTH0_MANAGEMENT_API_TOKEN}`,
      },
      body: JSON.stringify({
        user_metadata: {
          ...data,
          onboardingCompleted: true,
          onboardingCompletedAt: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Auth0 API error:', errorData);
      throw new Error('Failed to update profile');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}