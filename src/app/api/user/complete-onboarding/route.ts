// src/app/api/auth/onboarding-status/route.ts
import { NextRequest } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import Airtable from 'airtable';

export const dynamic = 'force-dynamic';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!);


export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',  // Or your specific Framer domain
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

export async function POST(req: NextRequest) {

  const headers = {
    'Access-Control-Allow-Origin': '*',  // Or your specific Framer domain
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  try {
    const session = await getSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formData = await req.json();
    
    // First, find the record by email
    const records = await base('Member Rolodex Admin').select({
      filterByFormula: `{Email} = '${session.user.email}'`
    }).firstPage();

    if (records.length === 0) {
      return new Response(JSON.stringify({ error: 'User record not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update the existing record
    const record = await base('Member Rolodex Admin').update([
      {
        id: records[0].id,
        fields: {
          Name: formData.name,
          City: formData.city,
          '10,000-ft view': formData.tenKView,
          // Not updating email as it's our identifier
          // Email: session.user.email,
        }
      }
    ]);

    return new Response(JSON.stringify({
      success: true,
      data: record
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating record:', error);
    return new Response(JSON.stringify({ error: 'Failed to update record' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}