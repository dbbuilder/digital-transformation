// Stakeholder Suggestion Service - Intelligently suggest stakeholders for questions

import { db } from '../lib/database'
import type { Stakeholder, Tier, Phase } from '../types'

export interface StakeholderSuggestion {
  stakeholder: Stakeholder
  reason: string
  confidence: 'high' | 'medium' | 'low'
  score: number
}

/**
 * Suggest stakeholders who should answer a question based on tier, phase, and content
 */
export async function suggestStakeholdersForQuestion(
  projectId: number,
  tier: Tier,
  phase: Phase,
  questionText: string
): Promise<StakeholderSuggestion[]> {
  const stakeholders = await db.stakeholders.where('projectId').equals(projectId).toArray()

  if (stakeholders.length === 0) {
    return []
  }

  const suggestions: StakeholderSuggestion[] = []

  for (const stakeholder of stakeholders) {
    let score = 0
    const reasons: string[] = []

    // Primary: Check if stakeholder has knowledge in this tier
    if (stakeholder.knowledgeAreas?.includes(tier)) {
      score += 50
      reasons.push(`${tier} expertise`)
    }

    // Check specializations for keywords
    if (stakeholder.specializations && stakeholder.specializations.length > 0) {
      const questionLower = questionText.toLowerCase()
      const matchingSpecs = stakeholder.specializations.filter(spec =>
        questionLower.includes(spec.toLowerCase())
      )
      if (matchingSpecs.length > 0) {
        score += matchingSpecs.length * 10
        reasons.push(`Specialization: ${matchingSpecs.join(', ')}`)
      }
    }

    // Boost score if they're RESPONSIBLE or ACCOUNTABLE
    if (stakeholder.involvementLevel === 'RESPONSIBLE' || stakeholder.involvementLevel === 'ACCOUNTABLE') {
      score += 20
      reasons.push(stakeholder.involvementLevel)
    }

    // Boost if their responsibilities match question content
    if (stakeholder.responsibilities && stakeholder.responsibilities.length > 0) {
      const questionLower = questionText.toLowerCase()
      const matchingResp = stakeholder.responsibilities.filter(resp =>
        questionLower.includes(resp.toLowerCase()) || resp.toLowerCase().includes(tier.toLowerCase())
      )
      if (matchingResp.length > 0) {
        score += matchingResp.length * 15
        reasons.push(`Responsible for: ${matchingResp[0]}`)
      }
    }

    // Phase-specific boosting
    if (phase === 'DISCOVERY' && stakeholder.role.toLowerCase().includes('product')) {
      score += 15
      reasons.push('Product role in Discovery phase')
    } else if (phase === 'FOUNDATION' && stakeholder.role.toLowerCase().includes('architect')) {
      score += 15
      reasons.push('Architect role in Foundation phase')
    } else if (phase === 'INTELLIGENCE' && tier === 'AI') {
      score += 20
      reasons.push('AI phase alignment')
    }

    // Only include stakeholders with some relevance
    if (score > 0) {
      let confidence: 'high' | 'medium' | 'low' = 'low'
      if (score >= 60) confidence = 'high'
      else if (score >= 30) confidence = 'medium'

      suggestions.push({
        stakeholder,
        reason: reasons.join(' • '),
        confidence,
        score,
      })
    }
  }

  // Sort by score descending
  suggestions.sort((a, b) => b.score - a.score)

  return suggestions
}

/**
 * Suggest who should approve a response
 */
export async function suggestApproversForQuestion(
  projectId: number,
  tier: Tier,
  questionText: string
): Promise<Stakeholder[]> {
  const stakeholders = await db.stakeholders.where('projectId').equals(projectId).toArray()

  // Filter stakeholders who can approve things related to this tier
  const approvers = stakeholders.filter(s => {
    if (!s.canApprove || s.canApprove.length === 0) return false

    // Check if their approval authority matches this tier or question content
    const tierMatch = s.canApprove.some(approval =>
      approval.toLowerCase().includes(tier.toLowerCase())
    )

    const contentMatch = s.canApprove.some(approval =>
      questionText.toLowerCase().includes(approval.toLowerCase())
    )

    return tierMatch || contentMatch || s.involvementLevel === 'APPROVER'
  })

  return approvers
}

/**
 * Suggest who should be consulted for a response
 */
export async function suggestConsultantsForQuestion(
  projectId: number,
  tier: Tier
): Promise<Stakeholder[]> {
  const stakeholders = await db.stakeholders.where('projectId').equals(projectId).toArray()

  // Get stakeholders marked as CONSULTED or who have relevant knowledge
  return stakeholders.filter(s =>
    s.involvementLevel === 'CONSULTED' ||
    (s.knowledgeAreas?.includes(tier) && s.involvementLevel !== 'INFORMED')
  )
}

/**
 * Get all stakeholders with knowledge in a specific tier
 */
export async function getStakeholdersWithTierKnowledge(
  projectId: number,
  tier: Tier
): Promise<Stakeholder[]> {
  const stakeholders = await db.stakeholders.where('projectId').equals(projectId).toArray()
  return stakeholders.filter(s => s.knowledgeAreas?.includes(tier))
}

/**
 * Get team members for a stakeholder
 */
export async function getTeamMembers(
  projectId: number,
  teamId: number
): Promise<Stakeholder[]> {
  return await db.stakeholders.where('teamId').equals(teamId).toArray()
}

/**
 * Auto-assign stakeholders to all questions in an assessment
 */
export async function autoAssignStakeholdersToAssessment(
  projectId: number,
  assessmentId: number,
  phase: Phase,
  tier: Tier,
  questionIds: string[]
): Promise<void> {
  const assignments = []

  for (const questionId of questionIds) {
    // Get the actual question text
    const question = await db.interviewQuestions.get(questionId)
    if (!question) continue

    const suggestions = await suggestStakeholdersForQuestion(
      projectId,
      tier,
      phase,
      question.question
    )

    if (suggestions.length === 0) continue

    // Take top 3 suggestions
    const topSuggestions = suggestions.slice(0, 3)
    const hasKnowledge = topSuggestions.map(s => s.stakeholder.id!).filter(Boolean)

    // Get approvers
    const approvers = await suggestApproversForQuestion(projectId, tier, question.question)
    const mustApprove = approvers.map(a => a.id!).filter(Boolean)

    // Get consultants
    const consultants = await suggestConsultantsForQuestion(projectId, tier)
    const consulted = consultants.slice(0, 2).map(c => c.id!).filter(Boolean)

    // Assign top suggestion as responsible
    const responsible = suggestions[0]?.stakeholder.id ? [suggestions[0].stakeholder.id] : []

    // Assign highest-ranking approver as accountable
    const accountableStakeholder = approvers.find(a =>
      a.role.toLowerCase().includes('lead') ||
      a.role.toLowerCase().includes('director') ||
      a.role.toLowerCase().includes('cto') ||
      a.role.toLowerCase().includes('manager')
    ) || approvers[0]
    const accountable = accountableStakeholder?.id

    assignments.push({
      projectId,
      questionId,
      phase,
      tier,
      hasKnowledge,
      responsible,
      accountable,
      consulted,
      informed: [], // Can be customized later
      mustApprove,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  // Bulk insert assignments
  if (assignments.length > 0) {
    await db.questionStakeholderAssignments.bulkAdd(assignments)
  }
}
