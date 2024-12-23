// src/app/api/onboarding/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSession } from '@auth0/nextjs-auth0';
import Airtable from 'airtable';

export const dynamic = 'force-dynamic';

const ALLOWED_ORIGINS = [
  'https://the20.co',
  'https://2-0dash.vercel.app',
  'http://localhost:3000'
];

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!);

function getCorsHeaders(origin: string | null) {
  const headers = new Headers({
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, X-Requested-With, Accept',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  });

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }

  return headers;
}

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get('origin');
    const session = await getSession(req, new NextResponse());
    
    if (!session?.user) {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      
      const headers = getCorsHeaders(origin);
      headers.forEach((value, key) => {
        response.headers.set(key, value);
      });
      
      return response;
    }

    const data = await req.json();
    const { name, city, tenKView, careerStage } = data;

    // Update Airtable record
    const record = await base('Users').create([
      {
        fields: {
          Name: name,
          City: city,
          'Career Stage': careerStage,
          'Ten K View': tenKView,
          Email: session.user.email,
          Auth0ID: session.user.sub,
        }
      }
    ]);

    // Create response with the redirect URL
    const response = NextResponse.json({
      success: true,
      redirectUrl: 'https://2-0dash.vercel.app/dashboard'
    });

    // Add CORS headers
    const headers = getCorsHeaders(origin);
    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error('Onboarding Error:', error);
    
    const response = NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
    
    const headers = getCorsHeaders(req.headers.get('origin'));
    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });
    
    return response;
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}