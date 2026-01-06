import Airtable from 'airtable';

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID || 'appXmkamVKmDfjJG1');

// Table references
export const Tables = {
  Users: base('Users'),
  Submissions: base('Submissions'),
  Generations: base('Generations'),
  UserPreferences: base('User_Preferences'),
} as const;

// Types for Career Translator
export interface PortfolioPiece {
  id: string;
  name: string;
  type: 'full-time' | 'advisory' | 'teaching' | 'consulting' | 'creative' | 'other';
  description: string;
  skills_needed: string[];
  current_status: 'active' | 'building' | 'exploring';
}

export interface Preference {
  preference_id: string;
  submission_id: string;
  portfolio_piece: string;
  section: 'hopes' | 'worries' | 'interests' | 'skills';
  preference_name: string;
  priority_level: 'dealbreaker' | 'important' | 'nice-to-have';
  definition_text: string;
  minimum_threshold?: string;
  target?: string;
  dream?: string;
}

export interface Tension {
  id: string;
  type: 'time' | 'priority' | 'resource';
  conflicting_preferences: string[];
  description: string;
  resolution?: string;
  resolution_reasoning?: string;
}

export interface Submission {
  id?: string;
  user_id: string;
  created_at: string;
  status: 'in_progress' | 'completed' | 'paid';

  // Portfolio data
  portfolio_braindump: string;
  portfolio_pieces: PortfolioPiece[];
  portfolio_piece_1_name?: string;
  portfolio_piece_1_type?: string;
  portfolio_piece_1_skills?: string;
  portfolio_piece_2_name?: string;
  portfolio_piece_2_type?: string;
  portfolio_piece_2_skills?: string;
  portfolio_piece_3_name?: string;
  portfolio_piece_3_type?: string;
  portfolio_piece_3_skills?: string;

  // Skills categorization (waterfall)
  skills_have: string[];
  skills_can_learn: string[];
  skills_not_planning: string[];

  // Tensions
  tensions_detected: Tension[];
  tensions_resolved: boolean;

  // Generations (outputs)
  career_inventory?: string;
  roadmap_2_0?: string;
  career_narrative?: string;
  career_thesis?: string;
  translation_guide?: string;
  three_actions?: string[];

  // Event tracking
  event_attended?: string;
  post_event_reflection?: string;
  priorities_updated?: boolean;
}

// Helper functions for Airtable operations

export async function createSubmission(data: Partial<Submission>): Promise<string> {
  const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Submissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        'User ID': data.user_id,
        'Created At': data.created_at || new Date().toISOString(),
        'Status': data.status || 'in_progress',
        'Portfolio Braindump': data.portfolio_braindump,
        'Portfolio Pieces': JSON.stringify(data.portfolio_pieces || []),
        'Portfolio Piece 1 Name': data.portfolio_piece_1_name,
        'Portfolio Piece 1 Type': data.portfolio_piece_1_type,
        'Portfolio Piece 1 Skills': data.portfolio_piece_1_skills,
        'Portfolio Piece 2 Name': data.portfolio_piece_2_name,
        'Portfolio Piece 2 Type': data.portfolio_piece_2_type,
        'Portfolio Piece 2 Skills': data.portfolio_piece_2_skills,
        'Portfolio Piece 3 Name': data.portfolio_piece_3_name,
        'Portfolio Piece 3 Type': data.portfolio_piece_3_type,
        'Portfolio Piece 3 Skills': data.portfolio_piece_3_skills,
        'Skills Have': JSON.stringify(data.skills_have || []),
        'Skills Can Learn': JSON.stringify(data.skills_can_learn || []),
        'Skills Not Planning': JSON.stringify(data.skills_not_planning || []),
        'Tensions Detected': JSON.stringify(data.tensions_detected || []),
        'Tensions Resolved': data.tensions_resolved || false,
      }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create submission');
  }

  const result = await response.json();
  return result.id;
}

export async function updateSubmission(recordId: string, data: Partial<Submission>): Promise<void> {
  const fields: Record<string, unknown> = {};

  if (data.status) fields['Status'] = data.status;
  if (data.portfolio_braindump) fields['Portfolio Braindump'] = data.portfolio_braindump;
  if (data.portfolio_pieces) fields['Portfolio Pieces'] = JSON.stringify(data.portfolio_pieces);
  if (data.skills_have) fields['Skills Have'] = JSON.stringify(data.skills_have);
  if (data.skills_can_learn) fields['Skills Can Learn'] = JSON.stringify(data.skills_can_learn);
  if (data.skills_not_planning) fields['Skills Not Planning'] = JSON.stringify(data.skills_not_planning);
  if (data.tensions_detected) fields['Tensions Detected'] = JSON.stringify(data.tensions_detected);
  if (data.tensions_resolved !== undefined) fields['Tensions Resolved'] = data.tensions_resolved;
  if (data.career_inventory) fields['Career Inventory'] = data.career_inventory;
  if (data.roadmap_2_0) fields['Roadmap 2.0'] = data.roadmap_2_0;
  if (data.career_narrative) fields['Career Narrative'] = data.career_narrative;
  if (data.career_thesis) fields['Career Thesis'] = data.career_thesis;
  if (data.translation_guide) fields['Translation Guide'] = data.translation_guide;
  if (data.three_actions) fields['Three Actions'] = JSON.stringify(data.three_actions);
  if (data.event_attended) fields['Event Attended'] = data.event_attended;
  if (data.post_event_reflection) fields['Post Event Reflection'] = data.post_event_reflection;
  if (data.priorities_updated !== undefined) fields['Priorities Updated'] = data.priorities_updated;

  const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Submissions/${recordId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields })
  });

  if (!response.ok) {
    throw new Error('Failed to update submission');
  }
}

export async function getSubmissionByUserId(userId: string): Promise<Submission | null> {
  const response = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Submissions?filterByFormula={User ID}="${userId}"&sort[0][field]=Created At&sort[0][direction]=desc&maxRecords=1`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch submission');
  }

  const result = await response.json();
  if (result.records.length === 0) {
    return null;
  }

  const record = result.records[0];
  return {
    id: record.id,
    user_id: record.fields['User ID'],
    created_at: record.fields['Created At'],
    status: record.fields['Status'],
    portfolio_braindump: record.fields['Portfolio Braindump'],
    portfolio_pieces: JSON.parse(record.fields['Portfolio Pieces'] || '[]'),
    skills_have: JSON.parse(record.fields['Skills Have'] || '[]'),
    skills_can_learn: JSON.parse(record.fields['Skills Can Learn'] || '[]'),
    skills_not_planning: JSON.parse(record.fields['Skills Not Planning'] || '[]'),
    tensions_detected: JSON.parse(record.fields['Tensions Detected'] || '[]'),
    tensions_resolved: record.fields['Tensions Resolved'] || false,
    career_inventory: record.fields['Career Inventory'],
    roadmap_2_0: record.fields['Roadmap 2.0'],
    career_narrative: record.fields['Career Narrative'],
    career_thesis: record.fields['Career Thesis'],
    translation_guide: record.fields['Translation Guide'],
    three_actions: JSON.parse(record.fields['Three Actions'] || '[]'),
    event_attended: record.fields['Event Attended'],
    post_event_reflection: record.fields['Post Event Reflection'],
    priorities_updated: record.fields['Priorities Updated'],
  };
}

export async function createPreference(data: Preference): Promise<string> {
  const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/User_Preferences`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        'Preference ID': data.preference_id,
        'Submission ID': data.submission_id,
        'Portfolio Piece': data.portfolio_piece,
        'Section': data.section,
        'Preference Name': data.preference_name,
        'Priority Level': data.priority_level,
        'Definition Text': data.definition_text,
        'Minimum Threshold': data.minimum_threshold,
        'Target': data.target,
        'Dream': data.dream,
      }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create preference');
  }

  const result = await response.json();
  return result.id;
}

export async function getPreferencesBySubmission(submissionId: string): Promise<Preference[]> {
  const response = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/User_Preferences?filterByFormula={Submission ID}="${submissionId}"`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch preferences');
  }

  const result = await response.json();
  return result.records.map((record: { id: string; fields: Record<string, unknown> }) => ({
    preference_id: record.fields['Preference ID'] as string,
    submission_id: record.fields['Submission ID'] as string,
    portfolio_piece: record.fields['Portfolio Piece'] as string,
    section: record.fields['Section'] as Preference['section'],
    preference_name: record.fields['Preference Name'] as string,
    priority_level: record.fields['Priority Level'] as Preference['priority_level'],
    definition_text: record.fields['Definition Text'] as string,
    minimum_threshold: record.fields['Minimum Threshold'] as string | undefined,
    target: record.fields['Target'] as string | undefined,
    dream: record.fields['Dream'] as string | undefined,
  }));
}

// Tension detection helpers
export function detectTensions(preferences: Preference[]): Tension[] {
  const tensions: Tension[] = [];
  const dealbreakers = preferences.filter(p => p.priority_level === 'dealbreaker');

  // Time conflicts - check if hours across portfolio pieces exceed sustainable
  const timeRelated = preferences.filter(p =>
    p.preference_name.toLowerCase().includes('time') ||
    p.preference_name.toLowerCase().includes('hours') ||
    p.preference_name.toLowerCase().includes('availability')
  );

  if (timeRelated.length > 1) {
    tensions.push({
      id: `tension-time-${Date.now()}`,
      type: 'time',
      conflicting_preferences: timeRelated.map(p => p.preference_name),
      description: 'Your time commitments across portfolio pieces may exceed sustainable hours. Something has to give.',
    });
  }

  // Priority conflicts - HIGH salary + HIGH autonomy often trade off
  const salaryPref = dealbreakers.find(p =>
    p.preference_name.toLowerCase().includes('salary') ||
    p.preference_name.toLowerCase().includes('compensation')
  );
  const autonomyPref = dealbreakers.find(p =>
    p.preference_name.toLowerCase().includes('autonomy') ||
    p.preference_name.toLowerCase().includes('flexibility')
  );

  if (salaryPref && autonomyPref) {
    tensions.push({
      id: `tension-priority-${Date.now()}`,
      type: 'priority',
      conflicting_preferences: [salaryPref.preference_name, autonomyPref.preference_name],
      description: 'High compensation and high autonomy often trade off. Which one wins when they conflict?',
    });
  }

  // Resource conflicts - HIGH learning + LOW risk tolerance
  const learningPref = dealbreakers.find(p =>
    p.preference_name.toLowerCase().includes('learning') ||
    p.preference_name.toLowerCase().includes('growth')
  );
  const riskPref = preferences.find(p =>
    p.preference_name.toLowerCase().includes('risk') ||
    p.preference_name.toLowerCase().includes('stability')
  );

  if (learningPref && riskPref && riskPref.priority_level === 'dealbreaker') {
    tensions.push({
      id: `tension-resource-${Date.now()}`,
      type: 'resource',
      conflicting_preferences: [learningPref.preference_name, riskPref.preference_name],
      description: 'Maximum learning often requires taking risks. How do you balance growth with stability?',
    });
  }

  return tensions;
}

export default base;
