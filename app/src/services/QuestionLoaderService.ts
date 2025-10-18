// Question Loader Service - Loads comprehensive interview questions from CSV files

import Papa from 'papaparse'
import type { InterviewQuestion, Phase } from '../types'

interface CSVRow {
  Phase: string
  Track: string
  Tier: string
  Question: string
  'Notes / Evidence': string
  'Priority (H/M/L)': string
  'AI Readiness / Applicability': string
}

const CSV_FILES = [
  { file: 'Interview_Templates_Discovery_AI.csv', phase: 'DISCOVERY' as Phase },
  { file: 'Interview_Templates_Foundation_AI.csv', phase: 'FOUNDATION' as Phase },
  { file: 'Interview_Templates_Modernization_AI.csv', phase: 'MODERNIZATION' as Phase },
  { file: 'Interview_Templates_Intelligence_AI.csv', phase: 'INTELLIGENCE' as Phase },
]

function mapPhaseFromCSV(csvPhase: string): Phase {
  const normalized = csvPhase.toLowerCase()
  if (normalized.includes('discovery')) return 'DISCOVERY'
  if (normalized.includes('foundation')) return 'FOUNDATION'
  if (normalized.includes('modernization')) return 'MODERNIZATION'
  if (normalized.includes('intelligence')) return 'INTELLIGENCE'
  return 'OPTIMIZATION' // fallback
}

function mapTierFromCSV(csvTier: string): 'UI' | 'API' | 'DATA' | 'CLOUD' | 'AI' {
  const normalized = csvTier.toLowerCase()
  if (normalized.includes('ui')) return 'UI'
  if (normalized.includes('api') || normalized.includes('mid-tier')) return 'API'
  if (normalized.includes('data')) return 'DATA'
  if (normalized.includes('cloud')) return 'CLOUD'
  if (normalized.includes('ai') || normalized.includes('external')) return 'AI'
  return 'UI' // fallback
}

function mapPriorityFromCSV(csvPriority: string): 'HIGH' | 'MEDIUM' | 'LOW' {
  const normalized = csvPriority.toUpperCase().trim()
  if (normalized === 'H' || normalized === 'HIGH') return 'HIGH'
  if (normalized === 'L' || normalized === 'LOW') return 'LOW'
  return 'MEDIUM'
}

export async function loadAllQuestions(): Promise<Omit<InterviewQuestion, 'id'>[]> {
  const allQuestions: Omit<InterviewQuestion, 'id'>[] = []

  for (const { file, phase } of CSV_FILES) {
    try {
      const response = await fetch(`/data/${file}`)
      const csvText = await response.text()

      const result = Papa.parse<CSVRow>(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
      })

      for (const row of result.data) {
        // Skip empty or header rows
        if (!row.Question || row.Question.trim() === '' || row.Question === 'Question') {
          continue
        }

        const question: Omit<InterviewQuestion, 'id'> = {
          phase: phase,
          track: row.Track?.toUpperCase() === 'BUSINESS' ? 'BUSINESS' : 'TECHNICAL',
          tier: mapTierFromCSV(row.Tier),
          question: row.Question.trim(),
          notes: row['Notes / Evidence']?.trim() || '',
          priority: mapPriorityFromCSV(row['Priority (H/M/L)'] || 'M'),
          aiReadiness: row['AI Readiness / Applicability']?.trim() || '',
          sourceFile: file,
        }

        allQuestions.push(question)
      }
    } catch (error) {
      console.error(`Error loading ${file}:`, error)
    }
  }

  console.log(`Loaded ${allQuestions.length} questions from CSV files`)
  return allQuestions
}

// Get questions for a specific phase
export async function getQuestionsByPhase(phase: Phase): Promise<Omit<InterviewQuestion, 'id'>[]> {
  const allQuestions = await loadAllQuestions()
  return allQuestions.filter((q) => q.phase === phase)
}

// Get questions for a specific tier
export async function getQuestionsByTier(
  tier: 'UI' | 'API' | 'DATA' | 'CLOUD' | 'AI'
): Promise<Omit<InterviewQuestion, 'id'>[]> {
  const allQuestions = await loadAllQuestions()
  return allQuestions.filter((q) => q.tier === tier)
}

// Get questions for a specific track
export async function getQuestionsByTrack(
  track: 'BUSINESS' | 'TECHNICAL'
): Promise<Omit<InterviewQuestion, 'id'>[]> {
  const allQuestions = await loadAllQuestions()
  return allQuestions.filter((q) => q.track === track)
}

// Statistics about loaded questions
export async function getQuestionStatistics() {
  const allQuestions = await loadAllQuestions()

  const byPhase = allQuestions.reduce(
    (acc, q) => {
      acc[q.phase] = (acc[q.phase] || 0) + 1
      return acc
    },
    {} as Record<Phase, number>
  )

  const byTier = allQuestions.reduce(
    (acc, q) => {
      acc[q.tier] = (acc[q.tier] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const byTrack = allQuestions.reduce(
    (acc, q) => {
      acc[q.track] = (acc[q.track] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return {
    total: allQuestions.length,
    byPhase,
    byTier,
    byTrack,
  }
}
