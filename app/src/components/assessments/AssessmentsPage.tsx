// Assessments Page - Main container for assessments workflow

import { useState } from 'react'
import { AssessmentList } from './AssessmentList'
import { AssessmentDashboard } from './AssessmentDashboard'
import { EnhancedInterviewForm } from './EnhancedInterviewForm'
import type { Assessment } from '../../types'

interface AssessmentsPageProps {
  projectId: number
}

type ViewMode = 'dashboard' | 'list'

export function AssessmentsPage({ projectId }: AssessmentsPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)

  function handleBack() {
    setSelectedAssessment(null)
  }

  function handleComplete() {
    // Optionally show a completion message or navigate back
    setSelectedAssessment(null)
  }

  function handleStartAssessment(assessment: Assessment) {
    setSelectedAssessment(assessment)
  }

  // If an assessment is selected, show the interview form
  if (selectedAssessment) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <EnhancedInterviewForm
            assessment={selectedAssessment}
            onBack={handleBack}
            onComplete={handleComplete}
          />
        </div>
      </div>
    )
  }

  // Otherwise show dashboard or list view
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* View Switcher Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setViewMode('dashboard')}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              viewMode === 'dashboard'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            Assessment Matrix
          </button>
        </div>

        {/* Content */}
        {viewMode === 'dashboard' ? (
          <AssessmentDashboard projectId={projectId} onStartAssessment={handleStartAssessment} />
        ) : (
          <AssessmentList projectId={projectId} onSelectAssessment={handleStartAssessment} />
        )}
      </div>
    </div>
  )
}
