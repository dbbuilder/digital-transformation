// Assessment Dashboard - Project-level overview with tier completion visualization

import { useEffect, useState } from 'react'
import { db } from '../../lib/database'
import type { Assessment, AssessmentResponse } from '../../types'

interface AssessmentDashboardProps {
  projectId: number
  onStartAssessment: (assessment: Assessment) => void
}

interface TierStats {
  tier: string
  totalQuestions: number
  answeredQuestions: number
  completionPercentage: number
  assessmentCount: number
}

interface PhaseStats {
  phase: string
  totalQuestions: number
  answeredQuestions: number
  completionPercentage: number
}

export function AssessmentDashboard({ projectId, onStartAssessment }: AssessmentDashboardProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [responses, setResponses] = useState<AssessmentResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [projectId])

  async function loadDashboardData() {
    setLoading(true)
    try {
      const allAssessments = await db.assessments.where('projectId').equals(projectId).toArray()
      const allResponses = await db.assessmentResponses.where('projectId').equals(projectId).toArray()

      setAssessments(allAssessments)
      setResponses(allResponses)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate tier-level statistics
  function calculateTierStats(): TierStats[] {
    const tiers = ['UI', 'API', 'DATA', 'CLOUD', 'AI']
    return tiers.map((tier) => {
      const tierAssessments = assessments.filter((a) => a.tier === tier)
      const tierResponses = responses.filter((r) =>
        tierAssessments.some((a) => a.id === r.assessmentId)
      )
      const answeredResponses = tierResponses.filter((r) => r.answer)

      // Get total questions for this tier across all phases
      const totalQuestions = tierResponses.length
      const answeredQuestions = answeredResponses.length
      const completionPercentage =
        totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0

      return {
        tier,
        totalQuestions,
        answeredQuestions,
        completionPercentage,
        assessmentCount: tierAssessments.length,
      }
    })
  }

  // Calculate phase-level statistics
  function calculatePhaseStats(): PhaseStats[] {
    const phases = ['DISCOVERY', 'FOUNDATION', 'MODERNIZATION', 'INTELLIGENCE', 'OPTIMIZATION']
    return phases.map((phase) => {
      const phaseAssessments = assessments.filter((a) => a.phase === phase)
      const phaseResponses = responses.filter((r) =>
        phaseAssessments.some((a) => a.id === r.assessmentId)
      )
      const answeredResponses = phaseResponses.filter((r) => r.answer)

      const totalQuestions = phaseResponses.length
      const answeredQuestions = answeredResponses.length
      const completionPercentage =
        totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0

      return {
        phase,
        totalQuestions,
        answeredQuestions,
        completionPercentage,
      }
    })
  }

  // Calculate overall statistics
  function calculateOverallStats() {
    const totalQuestions = responses.length
    const answeredQuestions = responses.filter((r) => r.answer).length
    const completionPercentage =
      totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0

    const completedAssessments = assessments.filter((a) => a.status === 'completed').length
    const inProgressAssessments = assessments.filter((a) => a.status === 'in_progress').length

    return {
      totalQuestions,
      answeredQuestions,
      completionPercentage,
      totalAssessments: assessments.length,
      completedAssessments,
      inProgressAssessments,
    }
  }

  // Get tier color
  function getTierColor(tier: string): string {
    const colors: Record<string, string> = {
      UI: 'bg-blue-500',
      API: 'bg-green-500',
      DATA: 'bg-purple-500',
      CLOUD: 'bg-orange-500',
      AI: 'bg-pink-500',
    }
    return colors[tier] || 'bg-neutral-500'
  }

  // Get incomplete assessments for quick access
  function getIncompleteAssessments(): Assessment[] {
    return assessments
      .filter((a) => a.status !== 'completed')
      .sort((a, b) => {
        // Sort by status (in_progress first) then by phase/tier
        if (a.status === 'in_progress' && b.status !== 'in_progress') return -1
        if (a.status !== 'in_progress' && b.status === 'in_progress') return 1
        return a.phase.localeCompare(b.phase)
      })
      .slice(0, 5)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-500">Loading dashboard...</div>
      </div>
    )
  }

  const overallStats = calculateOverallStats()
  const tierStats = calculateTierStats()
  const phaseStats = calculatePhaseStats()
  const incompleteAssessments = getIncompleteAssessments()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Assessment Dashboard</h2>
        <p className="text-neutral-600">Track your digital transformation interview progress</p>
      </div>

      {/* Overall Progress Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="text-sm font-medium text-neutral-600">Overall Progress</div>
          <div className="mt-2 text-3xl font-bold text-primary-600">
            {overallStats.completionPercentage}%
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            {overallStats.answeredQuestions} / {overallStats.totalQuestions} questions answered
          </div>
        </div>

        <div className="card">
          <div className="text-sm font-medium text-neutral-600">Assessments</div>
          <div className="mt-2 text-3xl font-bold text-neutral-900">
            {overallStats.totalAssessments}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            {overallStats.completedAssessments} completed, {overallStats.inProgressAssessments} in
            progress
          </div>
        </div>

        <div className="card">
          <div className="text-sm font-medium text-neutral-600">Current Phase</div>
          <div className="mt-2 text-xl font-bold text-neutral-900">Discovery</div>
          <div className="mt-1 text-xs text-neutral-500">
            {phaseStats[0]?.completionPercentage || 0}% complete
          </div>
        </div>

        <div className="card">
          <div className="text-sm font-medium text-neutral-600">Readiness Score</div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {Math.round(overallStats.completionPercentage * 0.85)}
          </div>
          <div className="mt-1 text-xs text-neutral-500">Based on interview completion</div>
        </div>
      </div>

      {/* Tier Completion Visualization */}
      <div className="card">
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">Completion by Tier</h3>
        <div className="space-y-4">
          {tierStats.map((stat) => (
            <div key={stat.tier}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${getTierColor(stat.tier)}`} />
                  <span className="font-medium text-neutral-900">{stat.tier}</span>
                  <span className="text-sm text-neutral-500">
                    ({stat.answeredQuestions}/{stat.totalQuestions})
                  </span>
                </div>
                <span className="text-sm font-semibold text-neutral-900">
                  {stat.completionPercentage}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                <div
                  className={`h-full transition-all duration-300 ${getTierColor(stat.tier)}`}
                  style={{ width: `${stat.completionPercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase Progress */}
      <div className="card">
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">Progress by Phase</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {phaseStats
            .filter((stat) => stat.totalQuestions > 0)
            .map((stat) => (
              <div key={stat.phase} className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-2 text-sm font-medium text-neutral-600">
                  {stat.phase.charAt(0) + stat.phase.slice(1).toLowerCase()}
                </div>
                <div className="mb-2 text-2xl font-bold text-neutral-900">
                  {stat.completionPercentage}%
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="h-full bg-primary-500 transition-all duration-300"
                    style={{ width: `${stat.completionPercentage}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-neutral-500">
                  {stat.answeredQuestions} / {stat.totalQuestions} questions
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Quick Access to Incomplete Assessments */}
      {incompleteAssessments.length > 0 && (
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">Continue Assessment</h3>
          <div className="space-y-2">
            {incompleteAssessments.map((assessment) => (
              <button
                key={assessment.id}
                onClick={() => onStartAssessment(assessment)}
                className="flex w-full items-center justify-between rounded-lg border border-neutral-200 p-4 text-left transition-colors hover:bg-neutral-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      assessment.status === 'in_progress' ? 'bg-yellow-500' : 'bg-neutral-300'
                    }`}
                  />
                  <div>
                    <div className="font-medium text-neutral-900">
                      {assessment.phase.charAt(0) + assessment.phase.slice(1).toLowerCase()} -{' '}
                      {assessment.tier}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {assessment.completionPercentage}% complete
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600">
                    {assessment.status === 'in_progress' ? 'Continue' : 'Start'}
                  </span>
                  <svg
                    className="h-5 w-5 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dual-Path Readiness Indicator */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card border-2 border-green-200 bg-green-50">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-green-900">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            AI-Free Path Readiness
          </h3>
          <div className="mb-1 text-3xl font-bold text-green-600">
            {Math.round(overallStats.completionPercentage * 0.9)}%
          </div>
          <div className="text-sm text-green-700">
            {overallStats.completionPercentage >= 70
              ? 'Ready to proceed with transformation'
              : 'Continue assessments to improve readiness'}
          </div>
        </div>

        <div className="card border-2 border-purple-200 bg-purple-50">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-purple-900">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            AI-Included Path Readiness
          </h3>
          <div className="mb-1 text-3xl font-bold text-purple-600">
            {Math.round(overallStats.completionPercentage * 0.8)}%
          </div>
          <div className="text-sm text-purple-700">
            {overallStats.completionPercentage >= 80
              ? 'AI governance requirements met'
              : 'Additional AI readiness questions required'}
          </div>
        </div>
      </div>
    </div>
  )
}
