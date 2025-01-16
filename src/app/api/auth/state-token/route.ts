import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req, NextResponse.next());
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a unique state token
    const stateToken = uuidv4();

    // Store the state token in the user's session object
    session.user.stateToken = stateToken;

    // Update the session with the new state token
    await getSession(req, NextResponse.next());

    return NextResponse.json({ stateToken });
  } catch (error) {
    console.error('State token generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}