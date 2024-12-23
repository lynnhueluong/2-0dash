// src/app/api/onboarding/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import Airtable from 'airtable';

export const dynamic = 'force-dynamic';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!);

const allowedOrigins = [
  'https://project-dmklsn3yttooaux1sfgg.framercanvas.com',
  'http://localhost:3000',
  'https://2-0dash.vercel.app',
  'https://the20.co'
];

function getCorsHeaders(origin: string | null) {
    const allowedOrigins = [
      'https://the20.co',
      'https://2-0dash.vercel.app',
      'http://localhost:3000'
    ];
  
    const headers = new Headers({
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Vary': 'Origin'
    });
  
    if (origin && allowedOrigins.includes(origin)) {
      headers.set('Access-Control-Allow-Origin', origin);
    }
  
    return headers;
  }
  
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
      const session = await getSession(req, new NextResponse());
      if (!session?.user) {
        return new Response(
          JSON.stringify({ error: 'Not authenticated' }), 
          { status: 401, headers }
        );
      }
  
      const formData = await req.json();
      
      // Update Auth0 user metadata directly
      const metadataResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${session.user.sub}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AUTH0_MANAGEMENT_API_TOKEN}`
        },
        body: JSON.stringify({
          app_metadata: { onboarded: true }
        })
      });
  
      if (!metadataResponse.ok) {
        throw new Error('Failed to update user metadata');
      }
      
      // Update or create Airtable record
      const records = await base('Member Rolodex Admin').select({
        filterByFormula: `{Email} = '${session.user.email}'`
      }).firstPage();
  
      const recordData = {
        Name: formData.name,
        City: formData.city,
        '10,000-ft view': formData.tenKView,
        'Career Stage': formData.careerStage,
        'Career Stage Preference': formData.careerStagePreference,
        'Bread + Butter': formData.breadAndButter,
        '& - other things I do': formData.otherSkills,
        'Current Role': formData.currentRole,
        'Current Company': formData.currentCompany,
        'Email': session.user.email
      };
  
      const record = records.length > 0
        ? await base('Member Rolodex Admin').update([
            { id: records[0].id, fields: recordData }
          ])
        : await base('Member Rolodex Admin').create([{ fields: recordData }]);
  
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: record,
          redirectUrl: 'https://the20.co/dashboard' 
        }), 
        { 
          status: 200,
          headers 
        }
      );
  
    } catch (error) {
      console.error('Error processing onboarding:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to process onboarding' }), 
        { status: 500, headers }
      );
    }
  }