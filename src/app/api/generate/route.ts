import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import Anthropic from '@anthropic-ai/sdk';
import { getSubmissionByUserId, getPreferencesBySubmission, updateSubmission, Submission, Preference } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Brand voice instructions - CRITICAL
const BRAND_VOICE_INSTRUCTIONS = `
Use Lynn's direct, colloquial language throughout ALL outputs:
- Say "dealbreakers" not "priorities" or "requirements"
- Say "eat dirt number" not "minimum threshold" or "optimal target"
- Say "make-or-break" not "critical success factor" or "key metric"
- Use hyphens (-) NEVER em dashes (—)
- Keep it conversational and direct - like talking to a smart friend over coffee
- It's okay to be occasionally irreverent or use mild profanity where it fits
- Avoid corporate-speak: no "leverage", "synergy", "bandwidth", "circle back"
- Be specific and concrete, not vague and aspirational
- Call out BS directly - if something doesn't add up, say so
`;

// POST - Generate career translator outputs
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { type, submissionId } = body as {
      type: 'career_inventory' | 'roadmap' | 'narrative' | 'thesis' | 'translation_guide' | 'three_actions' | 'full';
      submissionId?: string;
    };

    // Get submission data
    const submission = submissionId
      ? await getSubmissionByUserId(session.user.sub)
      : await getSubmissionByUserId(session.user.sub);

    if (!submission) {
      return NextResponse.json({ error: 'No submission found' }, { status: 404 });
    }

    // Get preferences for this submission
    const preferences = submission.id
      ? await getPreferencesBySubmission(submission.id)
      : [];

    // Build context for Claude
    const context = buildContext(submission, preferences);

    let result: Record<string, string | string[]>;

    if (type === 'full') {
      // Generate all outputs
      result = await generateAllOutputs(context);

      // Save to submission
      if (submission.id) {
        await updateSubmission(submission.id, {
          career_inventory: result.career_inventory as string,
          roadmap_2_0: result.roadmap as string,
          career_narrative: result.narrative as string,
          career_thesis: result.thesis as string,
          translation_guide: result.translation_guide as string,
          three_actions: result.three_actions as string[],
          status: 'completed',
        });
      }
    } else {
      // Generate specific output
      result = await generateSpecificOutput(type, context);
    }

    return NextResponse.json({
      success: true,
      outputs: result,
    });
  } catch (error) {
    console.error('Error generating outputs:', error);
    return NextResponse.json({ error: 'Failed to generate outputs' }, { status: 500 });
  }
}

interface SubmissionContext {
  portfolioPieces: Array<{
    name: string;
    type: string;
    status: string;
    skills: string[];
  }>;
  skillsHave: string[];
  skillsCanLearn: string[];
  skillsNotPlanning: string[];
  preferences: Array<{
    piece: string;
    section: string;
    name: string;
    priority: string;
    definition: string;
    minimum?: string;
    target?: string;
    dream?: string;
  }>;
  tensions: Array<{
    type: string;
    description: string;
    resolution?: string;
    reasoning?: string;
  }>;
  braindump: string;
}

function buildContext(submission: Submission, preferences: Preference[]): SubmissionContext {
  return {
    portfolioPieces: (submission.portfolio_pieces || []).map(p => ({
      name: p.name,
      type: p.type,
      status: p.current_status,
      skills: p.skills_needed,
    })),
    skillsHave: submission.skills_have || [],
    skillsCanLearn: submission.skills_can_learn || [],
    skillsNotPlanning: submission.skills_not_planning || [],
    preferences: preferences.map(p => ({
      piece: p.portfolio_piece,
      section: p.section,
      name: p.preference_name,
      priority: p.priority_level,
      definition: p.definition_text,
      minimum: p.minimum_threshold,
      target: p.target,
      dream: p.dream,
    })),
    tensions: (submission.tensions_detected || []).map(t => ({
      type: t.type,
      description: t.description,
      resolution: t.resolution,
      reasoning: t.resolution_reasoning,
    })),
    braindump: submission.portfolio_braindump || '',
  };
}

async function generateAllOutputs(context: SubmissionContext): Promise<Record<string, string | string[]>> {
  const systemPrompt = `You are a career strategist helping multi-hyphenate professionals articulate their portfolio careers.

${BRAND_VOICE_INSTRUCTIONS}

You have access to the user's complete career data including their portfolio pieces, skills categorization, weighted preferences (with dealbreakers, targets, and eat dirt numbers), and any tensions they've resolved.

Generate all six outputs in one response, formatted as JSON with these keys:
- career_inventory: A clear map of their portfolio career (string)
- roadmap: Their context-specific 2.0 roadmap with dealbreakers defined (string)
- narrative: Multiple one-liners - one for each portfolio context (string with each one-liner on a new line)
- thesis: The through-line connecting all their pieces (string)
- translation_guide: How to explain their multi-hyphenate career to different audiences (string)
- three_actions: Exactly 3 concrete next steps (array of strings)

Each output should reference their specific data - skills they have vs need to learn, their actual dealbreakers and eat dirt numbers, the tensions they resolved and why.`;

  const userPrompt = `Here's my career data:

PORTFOLIO PIECES:
${context.portfolioPieces.map(p => `- ${p.name} (${p.type}, ${p.status}): Skills needed: ${p.skills.join(', ')}`).join('\n')}

SKILLS I HAVE:
${context.skillsHave.join(', ') || 'Not specified'}

SKILLS I CAN LEARN:
${context.skillsCanLearn.join(', ') || 'Not specified'}

SKILLS I'M NOT PLANNING TO GET:
${context.skillsNotPlanning.join(', ') || 'Not specified'}

MY PREFERENCES (by context):
${context.preferences.map(p => `- [${p.piece}] ${p.name} (${p.priority}): ${p.definition}${p.minimum ? ` | Eat dirt: ${p.minimum}` : ''}${p.target ? ` | Target: ${p.target}` : ''}`).join('\n')}

TENSIONS I RESOLVED:
${context.tensions.map(t => `- ${t.type}: ${t.description}\n  Resolution: ${t.resolution}\n  My reasoning: ${t.reasoning}`).join('\n\n') || 'No major tensions'}

ORIGINAL BRAINDUMP:
${context.braindump}

Generate all six outputs based on this data. Be specific - reference my actual skills, numbers, and priorities.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [
      { role: 'user', content: userPrompt },
    ],
    system: systemPrompt,
  });

  // Parse the JSON response
  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  // Extract JSON from the response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from response');
  }

  return JSON.parse(jsonMatch[0]);
}

async function generateSpecificOutput(
  type: 'career_inventory' | 'roadmap' | 'narrative' | 'thesis' | 'translation_guide' | 'three_actions',
  context: SubmissionContext
): Promise<Record<string, string | string[]>> {
  const prompts: Record<string, { system: string; user: string }> = {
    career_inventory: {
      system: `You are a career strategist creating a Career Inventory for a multi-hyphenate professional.

${BRAND_VOICE_INSTRUCTIONS}

Create a clear, visual map of their portfolio career that shows:
1. Each piece of their portfolio and how they relate
2. What skills they bring vs what they need
3. Their current status with each piece (active, building, exploring)

Make it scannable - use headers, bullets, and clear structure.`,
      user: `Create my Career Inventory based on this data:

PORTFOLIO PIECES:
${context.portfolioPieces.map(p => `- ${p.name} (${p.type}, ${p.status}): Skills: ${p.skills.join(', ')}`).join('\n')}

SKILLS I HAVE: ${context.skillsHave.join(', ')}
SKILLS I CAN LEARN: ${context.skillsCanLearn.join(', ')}
SKILLS I'M NOT PLANNING TO GET: ${context.skillsNotPlanning.join(', ')}

BRAINDUMP: ${context.braindump}`,
    },
    roadmap: {
      system: `You are a career strategist creating a 2.0 Roadmap for a multi-hyphenate professional.

${BRAND_VOICE_INSTRUCTIONS}

Create a context-specific roadmap that:
1. Shows their dealbreakers for each portfolio piece
2. Includes their "eat dirt numbers" - the minimum they need to not lose their mind
3. Highlights any tensions and how they resolved them
4. Prioritizes based on their actual rankings

Don't give generic advice - use their specific numbers and priorities.`,
      user: `Create my 2.0 Roadmap based on this data:

PORTFOLIO PIECES:
${context.portfolioPieces.map(p => `- ${p.name} (${p.type}, ${p.status})`).join('\n')}

MY PREFERENCES (by context):
${context.preferences.map(p => `- [${p.piece}] ${p.name} (${p.priority}): ${p.definition}${p.minimum ? ` | Eat dirt: ${p.minimum}` : ''}${p.target ? ` | Target: ${p.target}` : ''}`).join('\n')}

TENSIONS I RESOLVED:
${context.tensions.map(t => `- ${t.type}: ${t.description}\n  Resolution: ${t.resolution}\n  Reasoning: ${t.reasoning}`).join('\n\n')}`,
    },
    narrative: {
      system: `You are a career strategist creating Career Narrative one-liners for a multi-hyphenate professional.

${BRAND_VOICE_INSTRUCTIONS}

Create MULTIPLE one-liners - one for each portfolio context. Each one-liner should:
1. Be 1-2 sentences max
2. Be specific to that context (not generic)
3. Connect their skills to what they offer
4. Sound like something a human would actually say

Format: One one-liner per line, labeled with the context.`,
      user: `Create one-liners for each of my portfolio contexts:

PORTFOLIO PIECES:
${context.portfolioPieces.map(p => `- ${p.name} (${p.type}): Skills: ${p.skills.join(', ')}`).join('\n')}

SKILLS I HAVE: ${context.skillsHave.join(', ')}

BRAINDUMP: ${context.braindump}`,
    },
    thesis: {
      system: `You are a career strategist creating a Career Thesis for a multi-hyphenate professional.

${BRAND_VOICE_INSTRUCTIONS}

Create the through-line that connects all their portfolio pieces. This should:
1. Be 2-3 sentences that explain why their combination makes sense
2. Show what's unique about having this specific mix
3. Answer "why would someone hire/work with you across these different contexts?"

Don't be generic - reference their actual skills and pieces.`,
      user: `Create my Career Thesis based on:

PORTFOLIO PIECES:
${context.portfolioPieces.map(p => `- ${p.name} (${p.type}): ${p.skills.join(', ')}`).join('\n')}

SKILLS I HAVE: ${context.skillsHave.join(', ')}

BRAINDUMP: ${context.braindump}`,
    },
    translation_guide: {
      system: `You are a career strategist creating a Translation Guide for a multi-hyphenate professional.

${BRAND_VOICE_INSTRUCTIONS}

Create a guide that helps them explain their career to different audiences:
1. The cocktail party version (30 seconds)
2. The LinkedIn summary version
3. The "explaining to parents" version
4. The networking event version
5. The job interview version (for each portfolio piece)

Each version should be concrete and ready to use - not a template.`,
      user: `Create my Translation Guide based on:

PORTFOLIO PIECES:
${context.portfolioPieces.map(p => `- ${p.name} (${p.type}): ${p.skills.join(', ')}`).join('\n')}

SKILLS I HAVE: ${context.skillsHave.join(', ')}

BRAINDUMP: ${context.braindump}`,
    },
    three_actions: {
      system: `You are a career strategist creating 3 concrete action items for a multi-hyphenate professional.

${BRAND_VOICE_INSTRUCTIONS}

Create EXACTLY 3 actions that:
1. Are specific and actionable this week
2. Reference their actual priorities and dealbreakers
3. Move them toward their targets, not just feel-good busywork
4. Account for any tensions they've resolved

Format: Return as a JSON array of 3 strings.`,
      user: `Create my 3 action items based on:

PORTFOLIO PIECES:
${context.portfolioPieces.map(p => `- ${p.name} (${p.type}, ${p.status})`).join('\n')}

MY PRIORITIES:
${context.preferences.filter(p => p.priority === 'dealbreaker').map(p => `- ${p.name}: ${p.definition}`).join('\n')}

TENSIONS RESOLVED:
${context.tensions.map(t => `- ${t.resolution}`).join('\n')}`,
    },
  };

  const prompt = prompts[type];

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      { role: 'user', content: prompt.user },
    ],
    system: prompt.system,
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  // For three_actions, parse as JSON array
  if (type === 'three_actions') {
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return { [type]: JSON.parse(jsonMatch[0]) };
    }
  }

  return { [type]: content.text };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
