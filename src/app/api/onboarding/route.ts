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

function getCorsHeaders() {
    return {
        'Access-Control-Allow-Origin': 'https://the20.co',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true'
    };
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(),
    });
}

export async function POST(request: NextRequest) {
    try {
        // Add CORS headers to the response
        const response = new NextResponse();
        const headers = getCorsHeaders();
        Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        const session = await getSession(request, response);
        if (!session?.user) {
            return NextResponse.json(
                { 
                  error: 'Not authenticated',
                  redirectUrl: '/api/auth/login'
                },
                { status: 401, headers: getCorsHeaders() }
            );
        }

        const formData = await request.json();

        // Validate required fields
        const requiredFields = ['name', 'city', 'tenKView'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400, headers: getCorsHeaders() }
            );
        }

        // Update Auth0 metadata
        try {
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
                console.error('Failed to update Auth0 metadata:', await auth0Response.text());
            }
        } catch (auth0Error) {
            console.error('Auth0 metadata update error:', auth0Error);
            // Continue with Airtable update even if Auth0 update fails
        }

        // Update or create Airtable record
        try {
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

            if (records.length > 0) {
                await base('Member Rolodex Admin').update([{
                    id: records[0].id,
                    fields: recordData
                }]);
            } else {
                await base('Member Rolodex Admin').create([{
                    fields: recordData
                }]);
            }
        } catch (airtableError) {
            console.error('Airtable error:', airtableError);
            return NextResponse.json(
                { error: 'Failed to update member data' },
                { status: 500, headers: getCorsHeaders() }
            );
        }

        return NextResponse.json({
            success: true,
            redirectUrl: 'https://2-0dash.vercel.app/dashboard'
        }, { 
            status: 200,
            headers: getCorsHeaders()
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({
            error: 'Server error processing onboarding',
            redirectUrl: '/api/auth/login'
        }, { 
            status: 500,
            headers: getCorsHeaders()
        });
    }
}