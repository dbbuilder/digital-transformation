// CSV Interview Template Import Service

import Papa from 'papaparse'
import { db } from './database'
import type { InterviewQuestion, Phase, Tier, Priority } from '../types'

interface CSVRow {
  Phase: string
  Track: string
  Tier: string
  Question: string
  'Notes / Evidence': string
  'Priority (H/M/L)': string
  'AI Readiness / Applicability': string
}

/**
 * Parse CSV interview template and convert to InterviewQuestion array
 */
export function parseInterviewCSV(csvContent: string): InterviewQuestion[] {
  const result = Papa.parse<CSVRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  })

  const questions: InterviewQuestion[] = []

  for (const row of result.data) {
    // Skip empty or invalid rows
    if (!row.Question || row.Question.trim() === '' || row.Question === 'Question') {
      continue
    }

    // Map CSV row to InterviewQuestion
    const question: InterviewQuestion = {
      id: crypto.randomUUID(),
      phase: mapPhase(row.Phase),
      track: row.Track?.toUpperCase() === 'BUSINESS' ? 'BUSINESS' : 'TECHNICAL',
      tier: mapTier(row.Tier),
      question: row.Question.trim(),
      notes: row['Notes / Evidence']?.trim() || '',
      priority: mapPriority(row['Priority (H/M/L)'] || ''),
      aiReadiness: row['AI Readiness / Applicability']?.trim() || '',
      sourceFile: '', // Will be set by importer
    }

    questions.push(question)
  }

  return questions
}

/**
 * Map CSV phase name to Phase enum
 */
function mapPhase(phaseStr: string): Phase {
  const normalized = phaseStr.toLowerCase()

  if (normalized.includes('discovery')) return 'DISCOVERY'
  if (normalized.includes('foundation')) return 'FOUNDATION'
  if (normalized.includes('modernization')) return 'MODERNIZATION'
  if (normalized.includes('intelligence')) return 'INTELLIGENCE'
  if (normalized.includes('optimization')) return 'OPTIMIZATION'

  return 'DISCOVERY' // Default fallback
}

/**
 * Map CSV tier name to Tier enum
 */
function mapTier(tierStr: string): Tier {
  const normalized = tierStr.toLowerCase()

  if (normalized.includes('ui')) return 'UI'
  if (normalized.includes('api') || normalized.includes('mid-tier')) return 'API'
  if (normalized.includes('data')) return 'DATA'
  if (normalized.includes('cloud')) return 'CLOUD'
  if (normalized.includes('ai') || normalized.includes('external')) return 'AI'

  return 'UI' // Default fallback
}

/**
 * Map CSV priority to Priority enum
 */
function mapPriority(priorityStr: string): Priority {
  const normalized = priorityStr.toUpperCase()

  if (normalized === 'H' || normalized === 'HIGH') return 'HIGH'
  if (normalized === 'L' || normalized === 'LOW') return 'LOW'

  return 'MEDIUM' // Default fallback (including empty values)
}

/**
 * Import interview questions from CSV content into database
 */
export async function importInterviewQuestions(
  csvContent: string,
  sourceFileName: string
): Promise<number> {
  const questions = parseInterviewCSV(csvContent)

  // Set source file name
  questions.forEach((q) => {
    q.sourceFile = sourceFileName
  })

  // Import to database
  await db.interviewQuestions.bulkAdd(questions)

  return questions.length
}

/**
 * Load all interview templates from public CSV files
 * This should be called on first app initialization
 */
export async function seedInterviewQuestions(): Promise<void> {
  // Check if already seeded
  const existingCount = await db.interviewQuestions.count()
  if (existingCount > 0) {
    console.log('✅ Interview questions already seeded')
    return
  }

  console.log('📚 Seeding interview questions from CSV templates...')

  const templates = [
    { file: 'Interview_Templates_Discovery_AI.csv', phase: 'Discovery' },
    { file: 'Interview_Templates_Foundation_AI.csv', phase: 'Foundation' },
    { file: 'Interview_Templates_Modernization_AI.csv', phase: 'Modernization' },
    { file: 'Interview_Templates_Intelligence_AI.csv', phase: 'Intelligence' },
  ]

  let totalImported = 0

  for (const template of templates) {
    try {
      // Fetch CSV from public directory
      const response = await fetch(`/data/${template.file}`)

      if (!response.ok) {
        console.warn(`⚠️ Could not load ${template.file}`)
        continue
      }

      const csvContent = await response.text()
      const count = await importInterviewQuestions(csvContent, template.file)

      totalImported += count
      console.log(`✅ Imported ${count} questions from ${template.file}`)
    } catch (error) {
      console.error(`❌ Error importing ${template.file}:`, error)
    }
  }

  console.log(`✅ Total interview questions imported: ${totalImported}`)
}

/**
 * Get all questions for a specific phase and tier
 */
export async function getQuestionsByPhaseTier(
  phase: Phase,
  tier: Tier
): Promise<InterviewQuestion[]> {
  // Query by phase first, then filter by tier in memory
  const phaseQuestions = await db.interviewQuestions
    .where('phase')
    .equals(phase)
    .toArray()

  return phaseQuestions.filter((q) => q.tier === tier)
}

/**
 * Get all questions for a specific phase
 */
export async function getQuestionsByPhase(phase: Phase): Promise<InterviewQuestion[]> {
  return db.interviewQuestions.where('phase').equals(phase).toArray()
}

/**
 * Get all questions for a specific tier
 */
export async function getQuestionsByTier(tier: Tier): Promise<InterviewQuestion[]> {
  return db.interviewQuestions.where('tier').equals(tier).toArray()
}

/**
 * Search questions by text
 */
export async function searchQuestions(searchTerm: string): Promise<InterviewQuestion[]> {
  const allQuestions = await db.interviewQuestions.toArray()

  if (!searchTerm.trim()) return allQuestions

  const term = searchTerm.toLowerCase()

  return allQuestions.filter(
    (q) =>
      q.question.toLowerCase().includes(term) ||
      q.notes?.toLowerCase().includes(term) ||
      q.aiReadiness?.toLowerCase().includes(term)
  )
}
