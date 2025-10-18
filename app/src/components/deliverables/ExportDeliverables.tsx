// Export Deliverables Component - UI for generating and downloading reports

import { useState } from 'react'
import { generateExecutiveDeck, downloadBlob } from '../../services/DeliverableService'

interface ExportDeliverablesProps {
  projectId: number
  projectName: string
}

export function ExportDeliverables({ projectId, projectName }: ExportDeliverablesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGeneratePowerPoint() {
    setGenerating(true)
    setError(null)

    try {
      const blob = await generateExecutiveDeck(projectId)
      const filename = `${projectName.replace(/[^a-z0-9]/gi, '_')}_Executive_Deck_${new Date().toISOString().split('T')[0]}.pptx`
      downloadBlob(blob, filename)

      // Success - close modal after a brief delay
      setTimeout(() => {
        setIsOpen(false)
      }, 1000)
    } catch (err) {
      console.error('Error generating PowerPoint:', err)
      setError('Failed to generate PowerPoint presentation. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="card flex items-start gap-4 text-left hover:border-primary-300 hover:shadow-md"
      >
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-pink-100">
          <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-900">Export Deliverables</h3>
          <p className="text-sm text-neutral-600">Generate professional reports</p>
        </div>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 p-6">
          <h2 className="text-2xl font-bold text-neutral-900">Export Deliverables</h2>
          <button
            onClick={() => setIsOpen(false)}
            disabled={generating}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* PowerPoint Export */}
          <div className="rounded-lg border-2 border-neutral-200 p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100">
                <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900">Executive Deck (PowerPoint)</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Professional presentation with project overview, assessment progress, four-corner framework, and key findings.
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  Includes: Title slide, executive summary, tier assessments, diagrams, recommendations, and next steps.
                </p>
                <button
                  onClick={handleGeneratePowerPoint}
                  disabled={generating}
                  className="btn-primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download PowerPoint
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* PDF Export - Coming Soon */}
          <div className="rounded-lg border-2 border-neutral-200 bg-neutral-50 p-4 opacity-60">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Technical Documentation (PDF)
                  <span className="ml-2 rounded-full bg-neutral-200 px-2 py-1 text-xs font-normal text-neutral-600">
                    Coming Soon
                  </span>
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Comprehensive technical documentation with detailed assessment responses and architecture diagrams.
                </p>
              </div>
            </div>
          </div>

          {/* Excel Export - Coming Soon */}
          <div className="rounded-lg border-2 border-neutral-200 bg-neutral-50 p-4 opacity-60">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Roadmap & Data (Excel)
                  <span className="ml-2 rounded-full bg-neutral-200 px-2 py-1 text-xs font-normal text-neutral-600">
                    Coming Soon
                  </span>
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Spreadsheet with roadmap timeline, task tracking, assessment data, and stakeholder information.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <h4 className="font-medium text-blue-900 mb-2">Export Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• All data is exported from your local browser storage</li>
              <li>• Complete more assessments for richer reports</li>
              <li>• Fill out the four-corner framework for visual diagrams</li>
              <li>• Exports work completely offline - no internet required</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-200 p-6">
          <button onClick={() => setIsOpen(false)} disabled={generating} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
