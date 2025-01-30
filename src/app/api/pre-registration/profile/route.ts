// app/api/pre-registration/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { analyzeProfile } from '../../../../lib/profile-analyzer';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Analyze profile selections and calculate scores
    const analysis = analyzeProfile(data.selections);

    // Generate a temporary ID to reference this data later
    const tempProfileId = crypto.randomUUID();

    // Store in Airtable with temporary ID
    const AIRTABLE_API_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/PreRegistrationProfiles`;
    
    const airtableResponse = await fetch(AIRTABLE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [{
          fields: {
            tempProfileId,
            selections: JSON.stringify(data.selections),
            scores: JSON.stringify(analysis.scores),
            recommendedFormat: analysis.recommendedFormat,
            readinessScore: analysis.readinessScore,
            submittedAt: new Date().toISOString()
          }
        }]
      })
    });

    if (!airtableResponse.ok) {
      throw new Error('Failed to store profile');
    }

    return NextResponse.json({ 
      success: true,
      tempProfileId,
      recommendedFormat: analysis.recommendedFormat,
      readinessScore: analysis.readinessScore
    });

  } catch (error) {
    console.error('Profile submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}