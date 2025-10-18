// SOW Preview Panel - Shows real-time preview of SOW generation

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { generateSOWPreview, type SOWPreview, type SOWSection } from '../../services/SOWPreviewService'
import { ApprovalTracker } from '../approvals/ApprovalTracker'
import { CurrentStakeholderSelector } from '../approvals/CurrentStakeholderSelector'
import {
  generateFinalSOW,
  downloadSOWDocument,
  checkSOWReadiness,
} from '../../services/SOWGenerationService'
import { db } from '../../lib/database'
import type { Assessment, InterviewResponse } from '../../types'

interface SOWPreviewPanelProps {
  assessment: Assessment
  responses: InterviewResponse[]
}

export function SOWPreviewPanel({ assessment, responses }: SOWPreviewPanelProps) {
  const [preview, setPreview] = useState<SOWPreview | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [showApprovals, setShowApprovals] = useState(false)
  const [currentStakeholderId, setCurrentStakeholderId] = useState<number | undefined>()
  const [allApproved, setAllApproved] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGenerationSuccess, setShowGenerationSuccess] = useState(false)

  useEffect(() => {
    async function loadPreview() {
      const sowPreview = await generateSOWPreview(assessment, responses)
      setPreview(sowPreview)
    }
    loadPreview()
  }, [assessment, responses])

  // Handle final SOW generation
  async function handleGenerateSOW(format: 'pdf' | 'pptx' | 'markdown') {
    if (!assessment.projectId || !assessment.id || !preview) return

    setIsGenerating(true)
    try {
      // Check readiness
      const readiness = await checkSOWReadiness(assessment.projectId, assessment.id)

      if (!readiness.ready) {
        alert(
          `SOW is not ready for generation:\n\n${readiness.issues.join('\n')}\n\nPlease complete all approvals first.`
        )
        setIsGenerating(false)
        return
      }

      // Get project data
      const project = await db.projects.get(assessment.projectId)
      if (!project) {
        alert('Project not found')
        setIsGenerating(false)
        return
      }

      // Generate document
      const document = await generateFinalSOW(project, assessment, preview, format)

      // Download
      downloadSOWDocument(document)

      // Show success message
      setShowGenerationSuccess(true)
      setTimeout(() => setShowGenerationSuccess(false), 5000)
    } catch (error) {
      console.error('Error generating SOW:', error)
      alert(`Failed to generate SOW: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle all approvals completed
  function handleAllApproved() {
    setAllApproved(true)
    // Auto-switch to content preview to show generation button
    setShowApprovals(false)
  }

  if (!preview) {
    return (
      <div className="card bg-neutral-50 border-2 border-neutral-300">
        <div className="flex items-center gap-2 text-neutral-600">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Generating SOW preview...</span>
        </div>
      </div>
    )
  }

  const sections: SOWSection[] = [
    preview.executiveSummary,
    preview.currentStateAssessment,
    preview.businessDrivers,
    preview.proposedSolution,
    preview.scopeAndDeliverables,
    preview.successCriteria,
    preview.timeline,
    preview.assumptions,
  ]

  return (
    <div className="space-y-4">
      {/* Header with overall completeness */}
      <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <h3 className="font-bold text-purple-900 text-lg">Statement of Work Preview</h3>
              <p className="text-sm text-purple-700">See how your responses translate to SOW content</p>
            </div>
          </div>
          {!showApprovals && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-purple-700 hover:text-purple-900 font-medium text-sm"
            >
              {isExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          )}
        </div>

        {/* View Toggle Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowApprovals(false)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              !showApprovals
                ? 'bg-purple-600 text-white'
                : 'bg-white text-purple-700 hover:bg-purple-100'
            }`}
          >
            📄 Content Preview
          </button>
          <button
            onClick={() => setShowApprovals(true)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              showApprovals
                ? 'bg-purple-600 text-white'
                : 'bg-white text-purple-700 hover:bg-purple-100'
            }`}
          >
            ✅ Approval Tracking
          </button>
        </div>

        {/* Completeness meter (only show in preview mode) */}
        {!showApprovals && (
          <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-purple-900">SOW Completeness</span>
              <span className={`font-bold ${getCompletenessColor(preview.completeness)}`}>
                {preview.completeness}%
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getCompletenessBarColor(preview.completeness)}`}
                style={{ width: `${preview.completeness}%` }}
              />
            </div>
            <p className="text-xs text-neutral-600 mt-2">
              {preview.readyForGeneration
                ? '✅ Ready to generate full SOW document'
                : '⚠️ Complete more questions to improve SOW quality'}
            </p>
          </div>
        )}
      </div>

      {/* Content Preview Mode */}
      {!showApprovals && (
        <>
          {/* Section cards */}
          <div className="space-y-3">
            {sections.map(section => (
              <SOWSectionCard
                key={section.id}
                section={section}
                isExpanded={isExpanded || selectedSection === section.id}
                onToggle={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
                responses={responses}
              />
            ))}
          </div>

          {/* Success message when all approved */}
          {showGenerationSuccess && (
            <div className="card bg-green-50 border-2 border-green-400 animate-pulse">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h4 className="font-bold text-green-900">SOW Document Generated Successfully!</h4>
                  <p className="text-sm text-green-800">Your file has been downloaded.</p>
                </div>
              </div>
            </div>
          )}

          {/* All approvals completed */}
          {allApproved && (
            <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400">
              <div className="flex items-start gap-3">
                <svg className="w-8 h-8 text-green-700 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h4 className="font-bold text-green-900 mb-2 text-lg">All Approvals Completed!</h4>
                  <p className="text-sm text-green-800 mb-4">
                    All required stakeholders have approved the SOW sections. You can now generate the final Statement of Work document.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleGenerateSOW('pdf')}
                      disabled={isGenerating}
                      className="btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? 'Generating...' : '📄 Generate PDF'}
                    </button>
                    <button
                      onClick={() => handleGenerateSOW('pptx')}
                      disabled={isGenerating}
                      className="btn-secondary bg-green-100 hover:bg-green-200 text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      📊 Generate PowerPoint
                    </button>
                    <button
                      onClick={() => handleGenerateSOW('markdown')}
                      disabled={isGenerating}
                      className="btn-secondary bg-green-100 hover:bg-green-200 text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      📝 Generate Markdown
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview ready (but not all approvals yet) */}
          {preview.readyForGeneration && !allApproved && (
            <div className="card bg-blue-50 border-2 border-blue-300">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-700 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h4 className="font-bold text-blue-900 mb-2">SOW Content Complete</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    You have collected sufficient detail to generate a comprehensive Statement of Work.
                    Switch to the <strong>Approval Tracking</strong> tab to get stakeholder sign-offs before generating the final document.
                  </p>
                  <button
                    onClick={() => setShowApprovals(true)}
                    className="btn-primary bg-blue-600 hover:bg-blue-700"
                  >
                    Go to Approval Tracking →
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Approval Tracking Mode */}
      {showApprovals && assessment.id && assessment.projectId && (
        <div className="space-y-4">
          {/* Current Stakeholder Selector */}
          <div className="card bg-white border-2 border-purple-200">
            <CurrentStakeholderSelector
              projectId={assessment.projectId}
              selectedStakeholderId={currentStakeholderId}
              onSelect={setCurrentStakeholderId}
            />
          </div>

          {/* Approval Tracker */}
          <ApprovalTracker
            projectId={assessment.projectId}
            assessmentId={assessment.id}
            currentStakeholderId={currentStakeholderId}
            onAllApproved={handleAllApproved}
          />
        </div>
      )}
    </div>
  )
}

interface SOWSectionCardProps {
  section: SOWSection
  isExpanded: boolean
  onToggle: () => void
  responses: InterviewResponse[]
}

function SOWSectionCard({ section, isExpanded, onToggle, responses }: SOWSectionCardProps) {
  const qualityConfig = {
    excellent: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-900',
      badgeColor: 'bg-green-100 text-green-800 border-green-400',
      icon: '✅',
    },
    good: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-900',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-400',
      icon: '👍',
    },
    'needs-work': {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-900',
      badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-400',
      icon: '⚠️',
    },
    missing: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-900',
      badgeColor: 'bg-red-100 text-red-800 border-red-400',
      icon: '❌',
    },
  }

  const config = qualityConfig[section.quality]
  const sourceResponses = responses.filter(r => section.sourceResponses.includes(r.id))

  return (
    <div className={`card ${config.bgColor} border-2 ${config.borderColor}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h4 className={`font-bold ${config.textColor}`}>{section.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${config.badgeColor}`}>
                {section.quality.replace('-', ' ').toUpperCase()}
              </span>
              {sourceResponses.length > 0 && (
                <span className="text-xs text-neutral-600">
                  {sourceResponses.length} response{sourceResponses.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`text-sm font-medium ${config.textColor}`}
        >
          {isExpanded ? '▲ Collapse' : '▼ Expand'}
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="space-y-3">
          {/* SOW Content Preview */}
          <div className="bg-white rounded-lg p-4 border-2 border-neutral-200">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </div>
          </div>

          {/* Source responses */}
          {sourceResponses.length > 0 && (
            <div className="bg-white rounded-lg p-4 border-2 border-neutral-200">
              <h5 className="font-semibold text-neutral-900 text-sm mb-2">
                📝 Based on these responses:
              </h5>
              <div className="space-y-2">
                {sourceResponses.map(response => (
                  <div key={response.id} className="text-xs bg-neutral-50 p-2 rounded border border-neutral-200">
                    <div className="font-medium text-neutral-700 mb-1">Q: {response.question}</div>
                    <div className="text-neutral-600">A: {response.response.substring(0, 150)}{response.response.length > 150 ? '...' : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvement suggestions */}
          {section.improvementSuggestions.length > 0 && (
            <div className="bg-white rounded-lg p-4 border-2 border-yellow-200">
              <h5 className="font-semibold text-yellow-900 text-sm mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                How to improve this section:
              </h5>
              <ul className="space-y-1">
                {section.improvementSuggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-xs text-yellow-800 flex items-start gap-2">
                    <span className="flex-shrink-0">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function getCompletenessColor(completeness: number): string {
  if (completeness >= 70) return 'text-green-700'
  if (completeness >= 40) return 'text-yellow-700'
  return 'text-red-700'
}

function getCompletenessBarColor(completeness: number): string {
  if (completeness >= 70) return 'bg-green-500'
  if (completeness >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}
