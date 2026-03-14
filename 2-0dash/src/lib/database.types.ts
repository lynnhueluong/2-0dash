export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          updated_at: string
          current_stage: string
          profile_completed: boolean
          referral_source: string | null
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      ambition_profiles: {
        Row: {
          id: string
          user_id: string
          inventory_data: Json | null
          roadmap_data: Json | null
          narrative_data: Json | null
          disambiguated_terms: Json
          computed_tags: Json
          version: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['ambition_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['ambition_profiles']['Insert']>
      }
      resources: {
        Row: {
          id: string
          name: string
          description: string
          url: string
          type: string
          categories: string[]
          career_stages: string[]
          identity_tags: string[]
          skill_areas: string[]
          problem_tags: string[]
          pricing: string
          submitted_by: string | null
          usage_count: number
          relevance_score: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['resources']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['resources']['Insert']>
      }
      matches: {
        Row: {
          id: string
          user_id: string
          resource_id: string
          matched_at: string
          match_reason: Json
          match_score: number
          user_action: string | null
          feedback: string | null
        }
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['matches']['Insert']>
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          stage: string
          conversation_history: Json
          progress_pct: number
          started_at: string
          last_active_at: string
        }
        Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
