import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSubmissionByUserId, updateSubmission } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

// POST - Save post-event reflection and optionally update priorities
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const {
      eventAttended,
      reflection,
      prioritiesChanged,
      updatedPreferences,
    } = body as {
      eventAttended: string;
      reflection: string;
      prioritiesChanged: boolean;
      updatedPreferences?: Array<{
        preferenceId: string;
        newPriorityLevel: 'dealbreaker' | 'important' | 'nice-to-have';
      }>;
    };

    // Get existing submission
    const submission = await getSubmissionByUserId(session.user.sub);

    if (!submission?.id) {
      return NextResponse.json({ error: 'No submission found' }, { status: 404 });
    }

    // Update submission with event data
    await updateSubmission(submission.id, {
      event_attended: eventAttended,
      post_event_reflection: reflection,
      priorities_updated: prioritiesChanged,
    });

    // If priorities changed, update the preferences
    if (prioritiesChanged && updatedPreferences && updatedPreferences.length > 0) {
      // Update each preference via direct Airtable API
      for (const update of updatedPreferences) {
        await fetch(
          `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/User_Preferences/${update.preferenceId}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fields: {
                'Priority Level': update.newPriorityLevel,
              },
            }),
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: prioritiesChanged
        ? 'Reflection saved and priorities updated'
        : 'Reflection saved',
    });
  } catch (error) {
    console.error('Error saving reflection:', error);
    return NextResponse.json({ error: 'Failed to save reflection' }, { status: 500 });
  }
}

// GET - Get reflection prompts based on event type
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');

    // Return reflection prompts based on event type
    const prompts = getReflectionPrompts(eventType);

    return NextResponse.json({
      prompts,
    });
  } catch (error) {
    console.error('Error getting prompts:', error);
    return NextResponse.json({ error: 'Failed to get prompts' }, { status: 500 });
  }
}

function getReflectionPrompts(eventType: string | null): string[] {
  const basePrompts = [
    'What surprised you most about the conversations you had?',
    'Did meeting anyone change how you think about your priorities?',
    'What would you do differently if you could go back?',
  ];

  const eventSpecificPrompts: Record<string, string[]> = {
    networking: [
      'Who did you click with - and what does that tell you about who you want in your corner?',
      'Did anyone make you feel envious? What specifically about their situation?',
      'What question did you get asked that made you pause?',
    ],
    workshop: [
      'What exercise or moment made you uncomfortable? Why?',
      'Did you learn anything that contradicts what you thought you wanted?',
      'How does this change your "eat dirt number" for anything?',
    ],
    conference: [
      'Which talk or session actually changed how you think?',
      'Who did you wish you had talked to but didn\'t?',
      'What industry trend makes you worried about your current path?',
    ],
    default: [
      'Did anything happen that makes you want to reprioritize?',
      'What conversation are you still thinking about?',
      'If you could go back with a different one-liner about yourself - what would it be?',
    ],
  };

  const specific = eventSpecificPrompts[eventType || 'default'] || eventSpecificPrompts.default;

  return [...basePrompts, ...specific];
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
