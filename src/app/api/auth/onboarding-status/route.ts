// src/app/api/auth/onboarding-status/route.ts
import { NextRequest } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import Airtable from 'airtable';

export const dynamic = 'force-dynamic';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!);

// Add your Framer canvas URL here
const allowedOrigins = [
  'https://project-dmklsn3yttooaux1sfgg.framercanvas.com',
  'http://localhost:3000',
  'https://2-0dash.vercel.app'
];

function getCorsHeaders(origin: string | null) {
  const headers = new Headers({
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  });

  // Check if the origin is in our allowed list
  if (origin && allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }

  return headers;
}

// Handle preflight requests
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  const headers = getCorsHeaders(origin);
  
  return new Response(null, {
    status: 204,
    headers
  });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  const headers = getCorsHeaders(origin);

  try {
    const session = await getSession();
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }), 
        { status: 401, headers }
      );
    }

    const formData = await req.json();
    
    // Find the record by email
    const records = await base('Member Rolodex Admin').select({
      filterByFormula: `{Email} = '${session.user.email}'`
    }).firstPage();

    if (records.length === 0) {
      return new Response(
        JSON.stringify({ error: 'User record not found' }), 
        { status: 404, headers }
      );
    }

    // Update the existing record
    const record = await base('Member Rolodex Admin').update([
      {
        id: records[0].id,
        fields: {
          Name: formData.name,
          City: formData.city,
          '10,000-ft view': formData.tenKView,
          'Career Stage': formData.careerStage,
          'Career Stage Preference': formData.careerStagePreference,
          'Bread + Butter': formData.breadAndButter,
          '& - other things I do': formData.otherSkills,
          'Current Role': formData.currentRole,
          'Current Company': formData.currentCompany
        }
      }
    ]);

    return new Response(
      JSON.stringify({ success: true, data: record }), 
      { headers }
    );

  } catch (error) {
    console.error('Error updating record:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update record' }), 
      { status: 500, headers }
    );
  }
}