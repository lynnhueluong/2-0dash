import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import type { UserStage, ConversationMessage, AmbitionProfile } from './types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Load prompt files
function loadPrompt(filename: string): string {
  const promptPath = path.join(process.cwd(), 'src', 'prompts', filename)
  try {
    return fs.readFileSync(promptPath, 'utf-8')
  } catch {
    return ''
  }
}

const prompts = {
  persona: () => loadPrompt('persona.md'),
  disambiguation: () => loadPrompt('disambiguation.md'),
  inventory: () => loadPrompt('inventory.md'),
  roadmap: () => loadPrompt('roadmap.md'),
  narrative: () => loadPrompt('narrative.md'),
}

// Build system prompt for a given stage
export function buildSystemPrompt(stage: UserStage, profile?: Partial<AmbitionProfile>): string {
  const persona = prompts.persona()
  const disambiguation = prompts.disambiguation()

  let stagePrompt = ''
  if (stage === 'inventory') stagePrompt = prompts.inventory()
  else if (stage === 'roadmap') stagePrompt = prompts.roadmap()
  else if (stage === 'narrative') stagePrompt = prompts.narrative()

  let contextSection = ''
  if (profile && stage !== 'inventory') {
    if (stage === 'roadmap' && profile.inventory_data) {
      contextSection = `
## Member's Career Inventory (already collected — use this as context):
${JSON.stringify(profile.inventory_data, null, 2)}

## Disambiguated Terms So Far:
${JSON.stringify(profile.disambiguated_terms || {}, null, 2)}
`
    } else if (stage === 'narrative' && profile.inventory_data && profile.roadmap_data) {
      contextSection = `
## Member's Career Inventory:
${JSON.stringify(profile.inventory_data, null, 2)}

## Member's 2.0 Roadmap:
${JSON.stringify(profile.roadmap_data, null, 2)}

## Disambiguated Terms:
${JSON.stringify(profile.disambiguated_terms || {}, null, 2)}
`
    }
  }

  return [persona, disambiguation, stagePrompt, contextSection].filter(Boolean).join('\n\n---\n\n')
}

// Stream a response from Claude
export async function streamAIResponse(
  messages: ConversationMessage[],
  stage: UserStage,
  profile?: Partial<AmbitionProfile>
): Promise<ReadableStream<string>> {
  const systemPrompt = buildSystemPrompt(stage, profile)

  const anthropicMessages = messages.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const stream = new ReadableStream<string>({
    async start(controller) {
      try {
        // Use the raw SDK stream - cast params to any to allow thinking
        const params = {
          model: 'claude-opus-4-6',
          max_tokens: 4096,
          system: systemPrompt,
          messages: anthropicMessages,
        }
        const response = anthropic.messages.stream(params)

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(event.delta.text)
          }
        }

        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })

  return stream
}

// Extract structured data from conversation (used to populate profile fields)
export async function extractProfileData(
  stage: UserStage,
  conversationHistory: ConversationMessage[]
): Promise<Record<string, unknown>> {
  const extractionPrompts: Record<string, string> = {
    inventory: `Based on this Career Inventory conversation, extract structured data. Return valid JSON with these exact keys: current_situation (string), skills (string[]), transferable_skills (string[]), skill_gaps (string[]), lifestyle_design (object with: hours_per_week, location_preference, income_target, work_pace, additional), target_role (object with: role_type, industry, company_size, additional). Only include information actually mentioned. Return ONLY the JSON, no explanation.`,
    roadmap: `Based on this 2.0 Roadmap conversation, extract structured data. Return valid JSON with these exact keys: priorities (string[]), values (string[]), philosophy (string), dealbreakers (string[]), concerns (string[]), now_actions (string[]), three_year_vision (string). Return ONLY the JSON.`,
    narrative: `Based on this Career Narrative conversation, extract structured data. Return valid JSON with these exact keys: full_narrative (string), elevator_pitch (string, max 2 sentences), linkedin_summary (string, 3-5 sentences), interview_answer (string, 4-6 sentences starting with "Tell me about yourself" format). Return ONLY the JSON.`,
  }

  const prompt = extractionPrompts[stage]
  if (!prompt) return {}

  const conversationText = conversationHistory
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n')

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `${prompt}\n\nCONVERSATION:\n${conversationText}`,
    }],
  })

  const textBlock = response.content.find(b => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') return {}

  try {
    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return {}
    return JSON.parse(jsonMatch[0])
  } catch {
    return {}
  }
}

// Extract disambiguated terms from conversation
export async function extractDisambiguatedTerms(
  conversationHistory: ConversationMessage[]
): Promise<Record<string, string>> {
  const conversationText = conversationHistory
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n')

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `From this conversation, identify any vague career terms that were defined personally by the member (growth, leadership, impact, success, flexibility, etc.). For each term found, capture the member's personal definition. Return a JSON object where keys are the terms and values are the member's personal definition (1-2 sentences). If none found, return {}. Return ONLY the JSON.\n\nCONVERSATION:\n${conversationText}`,
    }],
  })

  const textBlock = response.content.find(b => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') return {}

  try {
    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return {}
    return JSON.parse(jsonMatch[0])
  } catch {
    return {}
  }
}
