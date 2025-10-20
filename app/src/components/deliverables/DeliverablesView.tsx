/**
 * Deliverables View Component
 *
 * Generate and download professional transformation deliverables
 * - PowerPoint executive deck
 * - SOW document (future)
 * - Roadmap Excel (future)
 */

import { useState } from 'react'
import { db } from '../../lib/database'
import { downloadExecutiveDeck, type PowerPointOptions } from '../../services/PowerPointGenerator'
import { recommendTransformationPath } from '../../services/PathRecommendationEngine'
import type { Project } from '../../types'

interface DeliverablesViewProps {
  projectId: number
}

export function DeliverablesView({ projectId }: DeliverablesViewProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [options, setOptions] = useState<PowerPointOptions>({
    consultantName: '',
    companyName: '',
  })

  useState(() => {
    loadProject()
  })

  async function loadProject() {
    const proj = await db.projects.get(projectId)
    if (proj) {
      setProject(proj)
      setOptions(prev => ({ ...prev, companyName: proj.name }))
    }
  }

  async function handleGeneratePowerPoint() {
    if (!project) return

    setGenerating(true)
    setResult(null)

    try {
      // Load project data
      const responses = await db.assessmentResponses.where('projectId').equals(projectId).toArray()

      // Generate path recommendation
      const pathRecommendation = await recommendTransformationPath(project, responses)

      // Generate PowerPoint
      await downloadExecutiveDeck(project, responses, pathRecommendation, options)

      setResult({
        success: true,
        message: 'Executive deck generated successfully! Check your downloads.',
      })
    } catch (error: any) {
      console.error('PowerPoint generation failed:', error)
      setResult({
        success: false,
        message: `Generation failed: ${error.message}`,
      })
    } finally {
      setGenerating(false)
      setTimeout(() => setResult(null), 5000)
    }
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <div className="text-neutral-500">Loading project...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Generate Deliverables</h1>
        <p className="text-neutral-600">
          Create professional transformation deliverables from your project data
        </p>
      </div>

      {/* PowerPoint Executive Deck */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg
              className="h-12 w-12 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-neutral-900 mb-2">PowerPoint Executive Deck</h2>
            <p className="text-sm text-neutral-600 mb-4">
              Professional 14-slide presentation covering assessment results, transformation path
              recommendation, roadmap, and next steps
            </p>

            <div className="bg-neutral-50 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">Included Slides:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-neutral-600">
                <li>• Title slide with project info</li>
                <li>• Executive summary with key metrics</li>
                <li>• Four-corner framework diagram</li>
                <li>• Current state assessment</li>
                <li>• Future state vision</li>
                <li>• Path recommendation (AI vs AI-Free)</li>
                <li>• UI tier roadmap</li>
                <li>• API tier roadmap</li>
                <li>• Data tier roadmap</li>
                <li>• Cloud tier roadmap</li>
                <li>• AI tier roadmap</li>
                <li>• Timeline & milestones</li>
                <li>• Risks & mitigation</li>
                <li>• Next steps & call-to-action</li>
              </ul>
            </div>

            {/* Customization Options */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Consultant Name (Optional)
                </label>
                <input
                  type="text"
                  value={options.consultantName || ''}
                  onChange={e => setOptions({ ...options, consultantName: e.target.value })}
                  placeholder="e.g., Jane Smith, Principal Consultant"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={options.companyName || ''}
                  onChange={e => setOptions({ ...options, companyName: e.target.value })}
                  placeholder="e.g., Acme Corporation"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>
            </div>

            <button
              onClick={handleGeneratePowerPoint}
              disabled={generating}
              className="btn-primary"
            >
              {generating ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
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
                  Generating Deck...
                </>
              ) : (
                <>
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Generate PowerPoint
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SOW Generator (Coming Soon) */}
      <div className="card opacity-60">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg
              className="h-12 w-12 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-neutral-700 mb-2">
              Statement of Work (SOW) Document
              <span className="ml-2 text-xs bg-neutral-200 text-neutral-600 px-2 py-1 rounded">
                Coming Soon
              </span>
            </h2>
            <p className="text-sm text-neutral-500 mb-4">
              Comprehensive SOW document with scope, deliverables, timeline, budget, and success
              criteria
            </p>
            <button disabled className="btn-secondary opacity-50 cursor-not-allowed">
              Generate SOW
            </button>
          </div>
        </div>
      </div>

      {/* Roadmap Excel (Coming Soon) */}
      <div className="card opacity-60">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg
              className="h-12 w-12 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-neutral-700 mb-2">
              Roadmap & Timeline (Excel)
              <span className="ml-2 text-xs bg-neutral-200 text-neutral-600 px-2 py-1 rounded">
                Coming Soon
              </span>
            </h2>
            <p className="text-sm text-neutral-500 mb-4">
              Detailed Gantt chart with tasks, dependencies, milestones, and resource allocation
            </p>
            <button disabled className="btn-secondary opacity-50 cursor-not-allowed">
              Export Roadmap
            </button>
          </div>
        </div>
      </div>

      {/* Result Message */}
      {result && (
        <div
          className={`rounded-lg p-4 ${
            result.success
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex gap-2">
            {result.success ? (
              <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <div className="flex-1 text-sm">{result.message}</div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card bg-blue-50 border-2 border-blue-200">
        <div className="flex gap-3">
          <svg
            className="h-6 w-6 flex-shrink-0 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Deliverable Generation Tips</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>
                • Complete your assessment first for richer content in generated deliverables
              </li>
              <li>
                • Use the Decision tab to finalize your transformation path recommendation
              </li>
              <li>• Generated PowerPoint files can be edited in Microsoft PowerPoint or Google Slides</li>
              <li>• Customize consultant name and company details before generating</li>
              <li>• Deliverables are generated entirely offline (no data sent to servers)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
