// User & Auth
export type UserStage = 'inventory' | 'roadmap' | 'narrative' | 'complete'

export interface AppUser {
  id: string
  email: string
  name: string | null
  created_at: string
  updated_at: string
  current_stage: UserStage
  profile_completed: boolean
  referral_source: string | null
}

// Career Inventory (Stage 1)
export interface InventoryData {
  current_situation: string
  skills: string[]
  transferable_skills: string[]
  skill_gaps: string[]
  lifestyle_design: {
    hours_per_week: string
    location_preference: string
    income_target: string
    work_pace: string
    additional: string
  }
  target_role: {
    role_type: string
    industry: string
    company_size: string
    additional: string
  }
}

// 2.0 Roadmap (Stage 2)
export interface RoadmapData {
  priorities: string[]
  values: string[]
  philosophy: string
  dealbreakers: string[]
  concerns: string[]
  now_actions: string[] // next 90 days
  three_year_vision: string
}

// Career Narrative (Stage 3)
export interface NarrativeData {
  full_narrative: string
  elevator_pitch: string
  linkedin_summary: string
  interview_answer: string
}

// Ambition Profile
export interface AmbitionProfile {
  id: string
  user_id: string
  inventory_data: InventoryData | null
  roadmap_data: RoadmapData | null
  narrative_data: NarrativeData | null
  disambiguated_terms: Record<string, string>
  computed_tags: {
    identity_tags: string[]
    skill_areas: string[]
    problem_tags: string[]
    career_stage: string
    values_vector: string[]
  }
  version: number
  created_at: string
  updated_at: string
}

// Resources
export type ResourceType = 'tool' | 'book' | 'course' | 'community' | 'framework' | 'template' | 'office_hours'

export interface Resource {
  id: string
  name: string
  description: string
  url: string
  type: ResourceType
  categories: string[]
  career_stages: string[]
  identity_tags: string[]
  skill_areas: string[]
  problem_tags: string[]
  pricing: 'free' | 'freemium' | 'paid'
  submitted_by: string | null
  usage_count: number
  relevance_score: number
  created_at: string
}

// Matches
export interface Match {
  id: string
  user_id: string
  resource_id: string
  matched_at: string
  match_reason: {
    primary_reason: string
    tags_matched: string[]
    score_breakdown: Record<string, number>
  }
  match_score: number
  user_action: 'saved' | 'clicked' | 'dismissed' | null
  feedback: string | null
  resource?: Resource
}

// Session / Conversation
export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Session {
  id: string
  user_id: string
  stage: UserStage
  conversation_history: ConversationMessage[]
  progress_pct: number
  started_at: string
  last_active_at: string
}

// Chat
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isTyping?: boolean
}

// API types
export interface AIRequestBody {
  messages: ConversationMessage[]
  stage: UserStage
  profile?: Partial<AmbitionProfile>
}

export interface AIResponseChunk {
  type: 'text' | 'done' | 'error'
  content: string
}

export interface MatchRequestBody {
  userId: string
}

export interface MatchResponse {
  matches: Match[]
  total: number
}
