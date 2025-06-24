import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import Airtable from 'airtable';

export const dynamic = 'force-dynamic';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!);

export async function GET(req: Request) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if the user has completed onboarding
    const isOnboardingCompleted = session.user.user_metadata?.onboardingCompleted || false;

    return NextResponse.json({
      isOnboardingCompleted
    }, {
      headers: {
        'Access-Control-Allow-Origin': 'https://dash.the20.co',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  } catch (error) {
    console.error('Onboarding check error:', error);
    return NextResponse.json(
      { error: 'Failed to check onboarding status' },
      { status: 500, headers: {
        'Access-Control-Allow-Origin': 'https://dash.the20.co',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }}
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const onboardingData = await request.json();
    
    // Save to Airtable
    const airtableResponse = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Auth0 ID': session.user.sub,
          'Email': session.user.email,
          'Name': onboardingData.name,
          'Preferred Name': onboardingData.preferredName,
          'Pronouns': onboardingData.pronouns,
          'Onboarding Data': JSON.stringify(onboardingData),
          'Onboarding Completed': true,
          'Created At': new Date().toISOString(),
          
          // Key fields for matching algorithm
          'Skills': onboardingData.skillsExpertise,
          'Work Style': onboardingData.workStyle,
          'Career Goals': onboardingData.careerAdvancement.join(', '),
          'Ideal Career': onboardingData.idealCareer,
          'Resource Preferences': onboardingData.resourceTypes.join(', '),
          'Current Role': onboardingData.currentRole,
          'Career Stage': determineCareerStage(onboardingData)
        }
      })
    });

    if (!airtableResponse.ok) {
      throw new Error('Failed to save to Airtable');
    }

    // Update Auth0 user metadata using Management API
    const managementToken = process.env.AUTH0_MANAGEMENT_API_TOKEN;
    const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '');
    
    if (managementToken && auth0Domain) {
      const updateResponse = await fetch(`https://${auth0Domain}/api/v2/users/${session.user.sub}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${managementToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_metadata: {
            onboardingCompleted: true,
            profileData: {
              name: onboardingData.name,
              preferredName: onboardingData.preferredName,
              pronouns: onboardingData.pronouns,
              careerStage: determineCareerStage(onboardingData),
              skills: extractSkills(onboardingData.skillsExpertise)
            }
          }
        })
      });

      if (!updateResponse.ok) {
        console.error('Failed to update Auth0 user metadata');
      }
    }

    return NextResponse.json({ 
      message: 'Onboarding completed successfully',
      redirectTo: '/home'
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function determineCareerStage(data: any): string {
  const currentRole = data.currentRole?.toLowerCase() || '';
  
  if (currentRole.includes('senior') || currentRole.includes('lead') || currentRole.includes('manager')) {
    return 'Advanced Career';
  } else if (currentRole.includes('junior') || currentRole.includes('intern') || currentRole.includes('entry')) {
    return 'Early Career';
  } else {
    return 'Mid-Career';
  }
}

function extractSkills(skillsText: string): string[] {
  const commonSkills = [
    'React', 'JavaScript', 'Python', 'Product Management', 'UX Design', 
    'Data Analysis', 'Marketing', 'Sales', 'Finance', 'Machine Learning',
    'Project Management', 'Leadership', 'Strategy', 'Operations'
  ];
  
  return commonSkills.filter(skill => 
    skillsText.toLowerCase().includes(skill.toLowerCase())
  );
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}