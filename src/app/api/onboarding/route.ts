import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import Airtable from 'airtable';

export const dynamic = 'force-dynamic';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!);

// Add GET handler
export async function GET(req: NextRequest) {
  const session = await getSession(req, new NextResponse());
  
  if (!session?.user) {
    return NextResponse.json({ 
      error: 'Not authenticated',
      redirectUrl: 'https://2-0dash.vercel.app/api/auth/login' 
    }, { status: 401 });
  }

  return NextResponse.json({ 
    success: true,
    user: session.user
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req, new NextResponse());
    
    if (!session?.user) {
        return NextResponse.json({
          error: 'Not authenticated',
          redirectUrl: 'https://2-0dash.vercel.app/api/auth/login'
        }, { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': 'https://the20.co',
            'Access-Control-Allow-Credentials': 'true'
          }
        });
    }

    const formData = await req.json();
    
    // Update Auth0 user metadata
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
      console.error('Metadata update failed:', await metadataResponse.text());
      throw new Error('Failed to update user metadata');
    }
    
    const records = await base('Member Rolodex Admin').select({
      filterByFormula: `{Email} = '${session.user.email}'`
    }).firstPage();

    const recordData = {
      'Name': formData.name, 
      'City': formData.city,
      '10,000-ft view': formData.tenKView, 
      'Career Stage': formData.careerStage,
      'Email': session.user.email,
      ...(formData.careerStagePreference && {
        'Career Stage Preference': formData.careerStagePreference
      }),
      ...(formData.breadAndButter && {
        'Bread + Butter': formData.breadAndButter
      }),
      ...(formData.otherSkills && {
        '& - other things I do': formData.otherSkills
      }),
      ...(formData.currentRole && {
        'Current Role': formData.currentRole
      }),
      ...(formData.currentCompany && {
        'Current Company': formData.currentCompany
      })
    };

    let record;
    if (records.length > 0) {
      record = await base('Member Rolodex Admin').update([
        { id: records[0].id, fields: recordData }
      ]);
    } else {
      record = await base('Member Rolodex Admin').create([
        { fields: recordData }
      ]);
    }

    return NextResponse.json({
        success: true,
        redirectUrl: 'https://2-0dash.vercel.app/dashboard'
      }, {
        headers: {
          'Access-Control-Allow-Origin': 'https://the20.co',
          'Access-Control-Allow-Credentials': 'true'
        }
      });
    } catch (error: any) {
      return NextResponse.json({
        error: error.message || 'Server error',
        redirectUrl: 'https://2-0dash.vercel.app/api/auth/login'
      }, { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': 'https://the20.co',
          'Access-Control-Allow-Credentials': 'true'
        }
      });
    }
}

// Add OPTIONS handler for CORS
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}