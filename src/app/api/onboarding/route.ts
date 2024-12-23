// src/app/api/onboarding/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import Airtable from 'airtable';

export const dynamic = 'force-dynamic';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!);

const ALLOWED_ORIGINS = [
  'https://the20.co',
  'https://2-0dash.vercel.app',
  'http://localhost:3000'
];

function getCorsHeaders(origin: string | null) {
  const headers = new Headers({
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  });

  // Only allow specific origins
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }

  return headers;
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin)
  });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  const headers = getCorsHeaders(origin);

  try {
    // Ensure request is authenticated
    const session = await getSession(req, new NextResponse());
    if (!session?.user) {
      return NextResponse.json(
        { 
          error: 'Not authenticated',
          redirectUrl: '/api/auth/login'
        },
        { status: 401, headers }
      );
    }

    const formData = await req.json();

    // Validate required fields
    const requiredFields = ['name', 'city', 'tenKView'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400, headers }
      );
    }

    // Update Auth0 metadata
    const auth0Response = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${session.user.sub}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.AUTH0_MANAGEMENT_API_TOKEN}`
        },
        body: JSON.stringify({
          user_metadata: { 
            onboarded: true,
            city: formData.city,
            careerStage: formData.careerStage
          }
        })
      }
    );

    if (!auth0Response.ok) {
      throw new Error('Failed to update Auth0 user metadata');
    }

    // Update or create Airtable record
    const records = await base('Member Rolodex Admin')
      .select({
        filterByFormula: `{Email} = '${session.user.email}'`
      })
      .firstPage();

    const recordData = {
      'Name': formData.name,
      'Email': session.user.email,
      'City': formData.city,
      '10,000-ft view': formData.tenKView,
      'Career Stage': formData.careerStage || '',
      'Last Updated': new Date().toISOString()
    };

    let airtableResponse;
    if (records.length > 0) {
      airtableResponse = await base('Member Rolodex Admin').update([{
        id: records[0].id,
        fields: recordData
      }]);
    } else {
      airtableResponse = await base('Member Rolodex Admin').create([{
        fields: recordData
      }]);
    }

    return NextResponse.json({
      success: true,
      redirectUrl: '/dashboard'
    }, { 
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Onboarding Error:', error);
    return NextResponse.json({
      error: 'Server error processing onboarding',
      redirectUrl: '/api/auth/login'
    }, { 
      status: 500,
      headers
    });
  }
}