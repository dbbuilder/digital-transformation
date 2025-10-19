/**
 * Path Recommendation Component
 *
 * Displays AI-Included vs AI-Free transformation path recommendation
 * based on assessment responses and organizational readiness.
 */

import { useState, useEffect } from 'react'
import { db } from '../../lib/database'
import {
  recommendTransformationPath,
  generatePathComparison,
  type PathRecommendation as PathRec,
  type PathComparison,
} from '../../services/PathRecommendationEngine'
import type { Project, AssessmentResponse } from '../../types'

interface PathRecommendationProps {
  projectId: number
}

export function PathRecommendationView({ projectId }: PathRecommendationProps) {
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Project | null>(null)
  const [recommendation, setRecommendation] = useState<PathRec | null>(null)
  const [comparison, setComparison] = useState<PathComparison | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  useEffect(() => {
    loadRecommendation()
  }, [projectId])

  async function loadRecommendation() {
    setLoading(true)
    try {
      // Load project
      const proj = await db.projects.get(projectId)
      if (!proj) throw new Error('Project not found')
      setProject(proj)

      // Load all assessment responses
      const responses = await db.assessmentResponses.where('projectId').equals(projectId).toArray()

      // Generate recommendation
      const rec = await recommendTransformationPath(proj, responses)
      setRecommendation(rec)

      // Generate comparison
      const comp = generatePathComparison(rec)
      setComparison(comp)
    } catch (error) {
      console.error('Error loading recommendation:', error)
    } finally {
      setLoading(false)
    }
  }

  async function acceptRecommendation() {
    if (!project || !recommendation) return

    try {
      await db.projects.update(projectId, {
        transformationPath: recommendation.recommendedPath,
        updatedAt: new Date(),
      })
      alert(`Transformation path set to: ${recommendation.recommendedPath.replace('_', '-')}`)
      setProject({ ...project, transformationPath: recommendation.recommendedPath })
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Failed to update project path')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-500">Analyzing assessment data...</div>
      </div>
    )
  }

  if (!recommendation || !comparison) {
    return (
      <div className="card">
        <p className="text-neutral-600">Complete discovery assessments to generate path recommendation.</p>
      </div>
    )
  }

  const confidenceColor =
    recommendation.confidence === 'HIGH'
      ? 'text-green-700 bg-green-50 border-green-200'
      : recommendation.confidence === 'MEDIUM'
        ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
        : 'text-red-700 bg-red-50 border-red-200'

  const pathColor =
    recommendation.recommendedPath === 'AI_INCLUDED'
      ? 'bg-purple-50 border-purple-300'
      : 'bg-green-50 border-green-300'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Transformation Path Recommendation</h2>
        <p className="text-neutral-600">Based on your assessment responses and organizational readiness</p>
      </div>

      {/* Recommendation Card */}
      <div className={`rounded-lg border-2 p-6 ${pathColor}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h3 className="text-2xl font-bold text-neutral-900">
                Recommended Path: {recommendation.recommendedPath === 'AI_INCLUDED' ? 'AI-Included' : 'AI-Free'}
              </h3>
              <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${confidenceColor}`}>
                {recommendation.confidence} Confidence
              </span>
            </div>
            <div className="mb-4 flex items-center gap-2 text-neutral-700">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="font-medium">Overall Readiness Score: {recommendation.overallScore}/100</span>
            </div>
            <p className="text-neutral-800 leading-relaxed">{recommendation.justification}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          {project?.transformationPath !== recommendation.recommendedPath && (
            <button onClick={acceptRecommendation} className="btn-primary">
              Accept Recommendation
            </button>
          )}
          <button onClick={() => setShowComparison(!showComparison)} className="btn-secondary">
            {showComparison ? 'Hide' : 'Show'} Path Comparison
          </button>
        </div>
      </div>

      {/* Risk Flags */}
      {recommendation.riskFlags.length > 0 && (
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">Risk Flags & Mitigations</h3>
          <div className="space-y-3">
            {recommendation.riskFlags.map((flag, index) => {
              const severityColor =
                flag.severity === 'CRITICAL'
                  ? 'border-red-300 bg-red-50'
                  : flag.severity === 'HIGH'
                    ? 'border-orange-300 bg-orange-50'
                    : flag.severity === 'MEDIUM'
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-blue-300 bg-blue-50'

              const severityBadge =
                flag.severity === 'CRITICAL'
                  ? 'bg-red-600 text-white'
                  : flag.severity === 'HIGH'
                    ? 'bg-orange-600 text-white'
                    : flag.severity === 'MEDIUM'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-blue-600 text-white'

              return (
                <div key={index} className={`rounded-lg border p-4 ${severityColor}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${severityBadge}`}>
                      {flag.severity}
                    </span>
                    <span className="font-semibold text-neutral-900">{flag.category}</span>
                  </div>
                  <p className="mb-2 text-sm text-neutral-700">{flag.description}</p>
                  <div className="flex items-start gap-2 text-sm">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-neutral-700">
                      <strong>Mitigation:</strong> {flag.mitigation}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Readiness Scores */}
      <div className="card">
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">Readiness Assessment Breakdown</h3>
        <div className="space-y-4">
          {recommendation.readinessScores.map((score, index) => (
            <div key={index}>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-neutral-900">{score.category}</span>
                <span className="text-sm text-neutral-600">
                  {score.score}/100 (Weight: {Math.round(score.weight * 100)}%)
                </span>
              </div>
              <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                <div
                  className={`h-full transition-all ${
                    score.score >= 70
                      ? 'bg-green-600'
                      : score.score >= 50
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                  }`}
                  style={{ width: `${score.score}%` }}
                />
              </div>
              {score.findings.length > 0 && (
                <div className="mb-1">
                  <p className="mb-1 text-xs font-semibold text-neutral-700">Findings:</p>
                  <ul className="space-y-1 text-xs text-neutral-600">
                    {score.findings.map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span>•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {score.recommendations.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-neutral-700">Recommendations:</p>
                  <ul className="space-y-1 text-xs text-neutral-600">
                    {score.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span>→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Alternative Considerations */}
      {recommendation.alternativePathConsiderations.length > 0 && (
        <div className="card border-2 border-blue-200 bg-blue-50">
          <h3 className="mb-3 text-lg font-semibold text-blue-900">Alternative Path Considerations</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            {recommendation.alternativePathConsiderations.map((consideration, index) => (
              <li key={index} className="flex items-start gap-2">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{consideration}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Path Comparison (collapsible) */}
      {showComparison && comparison && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="mb-4 text-xl font-bold text-neutral-900">AI-Included vs AI-Free Comparison</h3>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-neutral-200">
                    <th className="p-3 text-left font-semibold text-neutral-900">Dimension</th>
                    <th className="p-3 text-left font-semibold text-purple-900">AI-Included</th>
                    <th className="p-3 text-left font-semibold text-green-900">AI-Free</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.keyDifferences.map((diff, index) => (
                    <tr key={index} className="border-b border-neutral-100">
                      <td className="p-3 font-medium text-neutral-800">{diff.dimension}</td>
                      <td
                        className={`p-3 text-sm ${
                          diff.advantage === 'AI_INCLUDED' ? 'bg-purple-50 font-semibold text-purple-900' : 'text-neutral-600'
                        }`}
                      >
                        {diff.aiIncluded}
                      </td>
                      <td
                        className={`p-3 text-sm ${
                          diff.advantage === 'AI_FREE' ? 'bg-green-50 font-semibold text-green-900' : 'text-neutral-600'
                        }`}
                      >
                        {diff.aiFree}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Path Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* AI-Included Path */}
            <div className="card border-2 border-purple-200">
              <h4 className="mb-4 text-lg font-bold text-purple-900">AI-Included Path Details</h4>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-neutral-900">Timeline:</p>
                  <p className="text-neutral-700">{comparison.aiIncluded.timeline}</p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Estimated Cost:</p>
                  <p className="text-neutral-700">{comparison.aiIncluded.estimatedCost}</p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Key Technologies:</p>
                  <ul className="mt-1 space-y-1 text-neutral-700">
                    {comparison.aiIncluded.keyTechnologies.map((tech, idx) => (
                      <li key={idx}>• {tech}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Benefits:</p>
                  <ul className="mt-1 space-y-1 text-green-700">
                    {comparison.aiIncluded.benefits.map((benefit, idx) => (
                      <li key={idx}>✓ {benefit}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Risks:</p>
                  <ul className="mt-1 space-y-1 text-red-700">
                    {comparison.aiIncluded.risks.map((risk, idx) => (
                      <li key={idx}>⚠ {risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* AI-Free Path */}
            <div className="card border-2 border-green-200">
              <h4 className="mb-4 text-lg font-bold text-green-900">AI-Free Path Details</h4>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-neutral-900">Timeline:</p>
                  <p className="text-neutral-700">{comparison.aiFree.timeline}</p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Estimated Cost:</p>
                  <p className="text-neutral-700">{comparison.aiFree.estimatedCost}</p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Key Technologies:</p>
                  <ul className="mt-1 space-y-1 text-neutral-700">
                    {comparison.aiFree.keyTechnologies.map((tech, idx) => (
                      <li key={idx}>• {tech}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Benefits:</p>
                  <ul className="mt-1 space-y-1 text-green-700">
                    {comparison.aiFree.benefits.map((benefit, idx) => (
                      <li key={idx}>✓ {benefit}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Risks:</p>
                  <ul className="mt-1 space-y-1 text-red-700">
                    {comparison.aiFree.risks.map((risk, idx) => (
                      <li key={idx}>⚠ {risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
