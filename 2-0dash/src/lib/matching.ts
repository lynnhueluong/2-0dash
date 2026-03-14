import type { AmbitionProfile, Resource } from './types'

interface MatchScore {
  total: number
  breakdown: Record<string, number>
  reasons: string[]
}

// Core scoring algorithm from scoping doc
export function scoreResource(resource: Resource, profile: AmbitionProfile): MatchScore {
  const tags = profile.computed_tags || {
    identity_tags: [],
    skill_areas: [],
    problem_tags: [],
    career_stage: '',
    values_vector: [],
  }

  const breakdown: Record<string, number> = {}
  const reasons: string[] = []

  // score += 3.0 * overlap(identity_tags, values_vector)
  const identityOverlap = overlap(resource.identity_tags, tags.values_vector)
  breakdown.identity_values = 3.0 * identityOverlap
  if (identityOverlap > 0) reasons.push(`Aligns with your values and identity`)

  // score += 2.5 * overlap(problem_tags, dealbreaker_concerns)
  const dealbreakers = (profile.roadmap_data?.dealbreakers || [])
    .concat(profile.roadmap_data?.concerns || [])
    .map(d => d.toLowerCase())
  const problemOverlap = overlapStrings(resource.problem_tags, dealbreakers)
  breakdown.problem_match = 2.5 * problemOverlap
  if (problemOverlap > 0) reasons.push(`Addresses your specific concerns`)

  // score += 2.0 * overlap(skill_areas, skills_can_learn)
  const skillGaps = (profile.inventory_data?.skill_gaps || []).map(s => s.toLowerCase())
  const skillOverlap = overlapStrings(resource.skill_areas, skillGaps)
  breakdown.skill_match = 2.0 * skillOverlap
  if (skillOverlap > 0) reasons.push(`Helps close your skill gaps`)

  // score += 1.5 * overlap(categories, disambiguated_terms)
  const disambiguatedKeys = Object.keys(profile.disambiguated_terms || {}).map(k => k.toLowerCase())
  const catOverlap = overlapStrings(resource.categories, disambiguatedKeys)
  breakdown.category_match = 1.5 * catOverlap
  if (catOverlap > 0) reasons.push(`Matches your defined priorities`)

  // score += 1.0 (career_stage match)
  const careerStage = tags.career_stage || ''
  if (resource.career_stages.includes(careerStage)) {
    breakdown.stage_match = 1.0
    reasons.push(`Right for your career stage`)
  } else {
    breakdown.stage_match = 0
  }

  // score += 0.5 * log(usage_count + 1)
  breakdown.popularity = 0.5 * Math.log(resource.usage_count + 1)

  const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0)

  return { total, breakdown, reasons }
}

function overlap(arr1: string[], arr2: string[]): number {
  if (!arr1.length || !arr2.length) return 0
  const set2 = new Set(arr2.map(s => s.toLowerCase()))
  const matched = arr1.filter(s => set2.has(s.toLowerCase())).length
  return matched / Math.max(arr1.length, arr2.length)
}

function overlapStrings(resourceTags: string[], profileTerms: string[]): number {
  if (!resourceTags.length || !profileTerms.length) return 0
  const matched = resourceTags.filter(tag =>
    profileTerms.some(term =>
      tag.toLowerCase().includes(term.toLowerCase()) ||
      term.toLowerCase().includes(tag.toLowerCase())
    )
  ).length
  return matched / Math.max(resourceTags.length, profileTerms.length)
}

// Match resources to a profile, return top N with reasons
export function matchResources(
  resources: Resource[],
  profile: AmbitionProfile,
  topN: number = 10
): Array<{ resource: Resource; score: MatchScore }> {
  const scored = resources
    .map(resource => ({ resource, score: scoreResource(resource, profile) }))
    .filter(({ score }) => score.total > 0)
    .sort((a, b) => b.score.total - a.score.total)
    .slice(0, topN)

  return scored
}

// Compute tags from profile data (run after each stage completes)
export function computeProfileTags(profile: Partial<AmbitionProfile>): AmbitionProfile['computed_tags'] {
  const tags: AmbitionProfile['computed_tags'] = {
    identity_tags: [],
    skill_areas: [],
    problem_tags: [],
    career_stage: 'mid',
    values_vector: [],
  }

  if (profile.inventory_data) {
    tags.skill_areas = [
      ...(profile.inventory_data.skills || []),
      ...(profile.inventory_data.transferable_skills || []),
    ].map(s => s.toLowerCase()).slice(0, 10)
  }

  if (profile.roadmap_data) {
    tags.values_vector = (profile.roadmap_data.values || [])
      .concat(profile.roadmap_data.priorities || [])
      .map(v => v.toLowerCase())
      .slice(0, 10)

    tags.problem_tags = (profile.roadmap_data.concerns || [])
      .concat(profile.roadmap_data.dealbreakers || [])
      .map(c => c.toLowerCase())
      .slice(0, 10)
  }

  // Infer career stage from context (simple heuristic)
  const situation = profile.inventory_data?.current_situation?.toLowerCase() || ''
  if (situation.includes('entry') || situation.includes('first job') || situation.includes('recent grad')) {
    tags.career_stage = 'early'
  } else if (situation.includes('senior') || situation.includes('director') || situation.includes('vp') || situation.includes('executive')) {
    tags.career_stage = 'senior'
  } else {
    tags.career_stage = 'mid'
  }

  return tags
}
