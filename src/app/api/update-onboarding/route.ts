// src/app/api/update-onboarding/route.ts
import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
  
      const { onboarded } = await request.json();
  
      // Use Auth0 Management API to update user metadata
      const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${session.user.sub}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AUTH0_MANAGEMENT_API_TOKEN}`
        },
        body: JSON.stringify({
          app_metadata: {
            onboarded: onboarded
        }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to update user: ${errorBody}`);
  }

  return NextResponse.json({ success: true });
} catch (error) {
  console.error('Error updating onboarding status:', error);
  return NextResponse.json({ error: 'Failed to update onboarding status' }, { status: 500 });
}
}