import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    inventory: 'Career Inventory',
    roadmap: '2.0 Roadmap',
    narrative: 'Career Narrative',
    complete: 'Complete',
  }
  return labels[stage] || stage
}

export function getStageNumber(stage: string): number {
  const nums: Record<string, number> = {
    inventory: 1,
    roadmap: 2,
    narrative: 3,
    complete: 3,
  }
  return nums[stage] || 1
}

export function getStageProgress(stage: string): number {
  const progress: Record<string, number> = {
    inventory: 33,
    roadmap: 66,
    narrative: 90,
    complete: 100,
  }
  return progress[stage] || 0
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
