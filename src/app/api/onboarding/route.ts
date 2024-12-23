// src/app/api/onboarding/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import Airtable from 'airtable';

export const dynamic = 'force-dynamic';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!);

function getCorsHeaders(origin: string | null) {

    return new Headers({
        'Access-Control-Allow-Origin': 'https://the20.co',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': 'true'
    });
}

export async function OPTIONS(req: NextRequest) {
    return new Response(null, {
        status: 204,
        headers: getCorsHeaders(req.headers.get('origin'))
    });
}

export async function POST(req: NextRequest) {
    const headers = getCorsHeaders(req.headers.get('origin'));
    
    try {
        const session = await getSession(req, new NextResponse());
        
        if (!session?.user) {
            return new Response(
                JSON.stringify({ 
                    error: 'Not authenticated',
                    redirectUrl: 'https://2-0dash.vercel.app/api/auth/login' 
                }),
                { status: 401, headers }
            );
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
            'Email': session.user.email, // Add email field
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

        const record = records.length > 0
            ? await base('Member Rolodex Admin').update([
                { id: records[0].id, fields: recordData }
            ])
            : await base('Member Rolodex Admin').create([{ fields: recordData }]);

        return new Response(
            JSON.stringify({ 
                success: true, 
                data: record,
                redirectUrl: 'https://2-0dash.vercel.app/dashboard' 
            }), 
            { status: 200, headers }
        );

    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ 
                error: 'Server error',
                redirectUrl: 'https://2-0dash.vercel.app/api/auth/login'
            }),
            { status: 500, headers }
        );
    }
}