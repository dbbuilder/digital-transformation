// Assessment List Component - Shows all assessments for a project

import { useEffect, useState } from 'react'
import { db } from '../../lib/database'
import type { Assessment, Phase, Tier } from '../../types'

interface AssessmentListProps {
  projectId: number
  onSelectAssessment?: (assessment: Assessment) => void
}

export function AssessmentList({ projectId, onSelectAssessment }: AssessmentListProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAssessments()
  }, [projectId])

  async function loadAssessments() {
    setLoading(true)
    try {
      const data = await db.assessments
        .where('projectId')
        .equals(projectId)
        .toArray()

      setAssessments(data)
    } catch (error) {
      console.error('Error loading assessments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createAssessment(phase: Phase, tier: Tier) {
    try {
      const newAssessment: Assessment = {
        projectId,
        phase,
        tier,
        completionPercentage: 0,
        status: 'not_started',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const id = await db.assessments.add(newAssessment)
      const created = await db.assessments.get(id)

      if (created) {
        setAssessments([...assessments, created])
        onSelectAssessment?.(created)
      }
    } catch (error) {
      console.error('Error creating assessment:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-500">Loading assessments...</div>
      </div>
    )
  }

  const phases: Phase[] = ['DISCOVERY', 'FOUNDATION', 'MODERNIZATION', 'INTELLIGENCE', 'OPTIMIZATION']
  const tiers: Tier[] = ['UI', 'API', 'DATA', 'CLOUD', 'AI']

  // Group assessments by phase and tier
  const assessmentMap = new Map<string, Assessment>()
  assessments.forEach((a) => {
    const key = `${a.phase}-${a.tier}`
    assessmentMap.set(key, a)
  })

  function getStatusColor(status: Assessment['status']) {
    switch (status) {
      case 'not_started':
        return 'bg-neutral-200 text-neutral-700'
      case 'in_progress':
        return 'bg-primary-100 text-primary-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-neutral-200 text-neutral-700'
    }
  }

  function getStatusLabel(status: Assessment['status']) {
    switch (status) {
      case 'not_started':
        return 'Not Started'
      case 'in_progress':
        return 'In Progress'
      case 'completed':
        return 'Completed'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Assessments</h2>
        <p className="text-sm text-neutral-600">
          Complete assessments across all transformation tiers
        </p>
      </div>

      {/* Assessment Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-neutral-100">
              <th className="border border-neutral-300 px-4 py-3 text-left font-semibold text-neutral-900">
                Phase
              </th>
              {tiers.map((tier) => (
                <th
                  key={tier}
                  className="border border-neutral-300 px-4 py-3 text-center font-semibold text-neutral-900"
                >
                  {tier}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {phases.map((phase) => (
              <tr key={phase} className="hover:bg-neutral-50">
                <td className="border border-neutral-300 px-4 py-3 font-medium text-neutral-900">
                  {phase.charAt(0) + phase.slice(1).toLowerCase()}
                </td>
                {tiers.map((tier) => {
                  const key = `${phase}-${tier}`
                  const assessment = assessmentMap.get(key)

                  return (
                    <td key={tier} className="border border-neutral-300 px-2 py-2 text-center">
                      {assessment ? (
                        <button
                          onClick={() => onSelectAssessment?.(assessment)}
                          className="w-full rounded-lg px-3 py-2 text-sm transition-colors hover:opacity-80"
                        >
                          <div className={`rounded-lg px-3 py-2 ${getStatusColor(assessment.status)}`}>
                            <div className="font-medium">{getStatusLabel(assessment.status)}</div>
                            <div className="mt-1 text-xs">{assessment.completionPercentage}%</div>
                          </div>
                        </button>
                      ) : (
                        <button
                          onClick={() => createAssessment(phase, tier)}
                          className="w-full rounded-lg border-2 border-dashed border-neutral-300 px-3 py-2 text-sm text-neutral-600 transition-colors hover:border-primary-400 hover:text-primary-600"
                        >
                          + Start Assessment
                        </button>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="text-sm font-medium text-neutral-600">Total Assessments</div>
          <div className="mt-1 text-3xl font-bold text-neutral-900">
            {assessments.length}
            <span className="ml-2 text-base font-normal text-neutral-500">/ {phases.length * tiers.length}</span>
          </div>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-neutral-600">Completed</div>
          <div className="mt-1 text-3xl font-bold text-green-600">
            {assessments.filter((a) => a.status === 'completed').length}
          </div>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-neutral-600">In Progress</div>
          <div className="mt-1 text-3xl font-bold text-primary-600">
            {assessments.filter((a) => a.status === 'in_progress').length}
          </div>
        </div>
      </div>
    </div>
  )
}
