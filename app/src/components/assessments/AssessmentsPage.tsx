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
      <EnhancedInterviewForm
        assessment={selectedAssessment}
        onBack={handleBack}
        onComplete={handleComplete}
      />
    )
  }

  // Otherwise show dashboard or list view
  return (
    <div className="space-y-6">
      {/* View Switcher Tabs - Mobile Optimized */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('dashboard')}
          className={`flex-1 sm:flex-none rounded-lg px-4 py-2 font-medium transition-colors text-sm sm:text-base ${
            viewMode === 'dashboard'
              ? 'bg-primary-500 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
          style={{ minHeight: '44px' }}
        >
          Dashboard
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 sm:flex-none rounded-lg px-4 py-2 font-medium transition-colors text-sm sm:text-base ${
            viewMode === 'list'
              ? 'bg-primary-500 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
          style={{ minHeight: '44px' }}
        >
          Matrix
        </button>
      </div>

      {/* Content */}
      {viewMode === 'dashboard' ? (
        <AssessmentDashboard projectId={projectId} onStartAssessment={handleStartAssessment} />
      ) : (
        <AssessmentList projectId={projectId} onSelectAssessment={handleStartAssessment} />
      )}
    </div>
  )
}
