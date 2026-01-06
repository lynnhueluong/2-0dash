import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { createPreference, getPreferencesBySubmission, detectTensions } from '@/lib/airtable';
import type { Preference } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

// GET - Fetch preferences for a submission
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submissionId');

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID required' }, { status: 400 });
    }

    const preferences = await getPreferencesBySubmission(submissionId);

    // Also detect any tensions
    const tensions = detectTensions(preferences);

    return NextResponse.json({
      preferences,
      tensions,
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

// POST - Create new preferences
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { preferences } = body as { preferences: Preference[] };

    if (!preferences || !Array.isArray(preferences)) {
      return NextResponse.json({ error: 'Preferences array required' }, { status: 400 });
    }

    // Create all preferences
    const createdIds: string[] = [];
    for (const pref of preferences) {
      const id = await createPreference(pref);
      createdIds.push(id);
    }

    // Detect tensions after creating preferences
    const allPreferences = await getPreferencesBySubmission(preferences[0]?.submission_id);
    const tensions = detectTensions(allPreferences);

    return NextResponse.json({
      success: true,
      createdCount: createdIds.length,
      tensions,
    });
  } catch (error) {
    console.error('Error creating preferences:', error);
    return NextResponse.json({ error: 'Failed to create preferences' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
