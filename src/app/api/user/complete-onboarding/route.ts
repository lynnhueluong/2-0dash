// src/app/api/auth/onboarding-status/route.ts
import { NextRequest } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import Airtable from 'airtable';

export const dynamic = 'force-dynamic';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!);

// Function to handle CORS
function corsResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    },
  });
}

// Handle OPTIONS preflight request
export async function OPTIONS() {
  return corsResponse(null, 204);
}

export async function POST(req: NextRequest) {
  try {
    // For testing, temporarily bypass session check
    // const session = await getSession();
    // if (!session?.user) {
    //   return corsResponse({ error: 'Not authenticated' }, 401);
    // }

    const formData = await req.json();
    
    // For testing, create a new record instead of looking up by email
    const record = await base('Member Rolodex Admin').create([
      {
        fields: {
          Name: formData.name,
          City: formData.city,
          '10,000-ft view': formData.tenKView,
          'Career Stage': formData.careerStage,
          'Career Stage Preference': formData.careerStagePreference,
          'Bread + Butter': formData.breadAndButter,
          '& - other things I do': formData.otherSkills,
          'Current Role': formData.currentRole,
          'Current Company': formData.currentCompany,
          // Add a temporary email for testing
          'Email': 'test@example.com'
        }
      }
    ]);

    return corsResponse({ success: true, data: record });

  } catch (error) {
    console.error('Error creating record:', error);
    return corsResponse({ error: 'Failed to create record' }, 500);
  }
}