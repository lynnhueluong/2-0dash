import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import {
  createSubmission,
  updateSubmission,
  getSubmissionByUserId,
} from '@/lib/airtable';
import type { Submission } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

// GET - Fetch current user's submission
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const submission = await getSubmissionByUserId(session.user.sub);

    return NextResponse.json({
      submission,
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 });
  }
}

// POST - Create or update submission
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body as {
      action: 'create' | 'update';
      data: Partial<Submission>;
    };

    if (action === 'create') {
      const submissionData: Partial<Submission> = {
        user_id: session.user.sub,
        created_at: new Date().toISOString(),
        status: 'in_progress',
        ...data,
      };

      const id = await createSubmission(submissionData);

      return NextResponse.json({
        success: true,
        submissionId: id,
      });
    }

    if (action === 'update') {
      const { recordId, ...updateData } = data as Partial<Submission> & { recordId?: string };

      if (!recordId) {
        // Find existing submission
        const existing = await getSubmissionByUserId(session.user.sub);
        if (!existing?.id) {
          return NextResponse.json({ error: 'No submission found to update' }, { status: 404 });
        }

        await updateSubmission(existing.id, updateData);
      } else {
        await updateSubmission(recordId, updateData);
      }

      return NextResponse.json({
        success: true,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error with submission:', error);
    return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 });
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
