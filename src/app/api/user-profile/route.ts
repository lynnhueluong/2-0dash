import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user data from Airtable
    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Users?filterByFormula={Auth0 ID}="${session.user.sub}"`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
      }
    );

    if (!airtableResponse.ok) {
      throw new Error('Failed to fetch from Airtable');
    }

    const airtableData = await airtableResponse.json();
    
    if (airtableData.records.length === 0) {
      return NextResponse.json({ message: 'User profile not found' }, { status: 404 });
    }

    const userRecord = airtableData.records[0];
    const onboardingData = JSON.parse(userRecord.fields['Onboarding Data'] || '{}');

    // Create user profile for dashboard
    const profile = {
      name: userRecord.fields['Preferred Name'] || userRecord.fields['Name'],
      email: session.user.email,
      pronouns: userRecord.fields['Pronouns'],
      careerStage: userRecord.fields['Career Stage'] || 'Mid-Career',
      skills: extractSkills(onboardingData.skillsExpertise || ''),
      industries: (onboardingData.interestedIndustries || '').split(',').map((s: string) => s.trim()),
      workStyle: onboardingData.workStyle,
      careerGoals: onboardingData.careerAdvancement || [],
      location: 'Austin, TX', // Extract from onboarding data if available
      onboardingData: onboardingData
    };

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
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