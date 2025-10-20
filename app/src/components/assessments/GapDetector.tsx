/**
 * Gap Detector Component
 *
 * AI-powered analysis of missing information in assessments
 * - Identifies critical gaps in coverage
 * - Shows completion percentage by tier
 * - Provides recommendations for next steps
 */

import { useState, useEffect } from 'react'
import { AlertTriangle, TrendingUp, CheckCircle, Loader2, ChevronRight } from 'lucide-react'
import { getAIService } from '../../services/AIService'
import type { AssessmentResponse, Tier } from '../../types'
import { db } from '../../lib/database'

interface GapDetectorProps {
  projectId: number
  responses: AssessmentResponse[]
  onQuestionClick?: (questionId: string) => void
}

interface GapAnalysis {
  criticalGaps: string[]
  missingAreas: string[]
  coverageByTier: Record<Tier, number>
  recommendations: string[]
}

export function GapDetector({ projectId, responses, onQuestionClick }: GapDetectorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [autoRun, setAutoRun] = useState(false)

  const aiService = getAIService()

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    setError(null)

    try {
      // Get all interview questions
      const allQuestions = await db.interviewQuestions.toArray()

      // Run AI gap detection
      const result = await aiService.detectGaps(
        responses,
        allQuestions.map(q => ({
          id: q.id,
          question: q.question,
          tier: q.tier,
          priority: q.priority,
        }))
      )

      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze gaps')
      console.error('Gap analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Auto-run when responses reach 50%
  useEffect(() => {
    const checkAutoRun = async () => {
      if (autoRun) return

      const allQuestions = await db.interviewQuestions.toArray()
      const completionPct = (responses.length / allQuestions.length) * 100

      if (completionPct >= 50 && completionPct < 100 && aiService.isAvailable()) {
        setAutoRun(true)
        runAnalysis()
      }
    }

    checkAutoRun()
  }, [responses.length, autoRun])

  if (!aiService.isAvailable()) {
    return null // Don't show if AI is not configured
  }

  const getTierColor = (coverage: number): string => {
    if (coverage >= 80) return 'bg-green-500'
    if (coverage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getTierTextColor = (coverage: number): string => {
    if (coverage >= 80) return 'text-green-700'
    if (coverage >= 50) return 'text-yellow-700'
    return 'text-red-700'
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Assessment Gap Analysis
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered detection of missing critical information
          </p>
        </div>

        {!analysis && (
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing || responses.length === 0}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Analyze Gaps
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Coverage by Tier */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Coverage by Tier</h4>
            <div className="space-y-3">
              {Object.entries(analysis.coverageByTier).map(([tier, percentage]) => (
                <div key={tier}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{tier}</span>
                    <span className={`text-sm font-semibold ${getTierTextColor(percentage)}`}>
                      {Math.round(percentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getTierColor(percentage)} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Gaps */}
          {analysis.criticalGaps.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Critical Gaps
              </h4>
              <ul className="space-y-2">
                {analysis.criticalGaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-red-800">
                    <span className="text-red-600 font-bold mt-0.5">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Areas */}
          {analysis.missingAreas.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-900 mb-2">Missing Information</h4>
              <ul className="space-y-2">
                {analysis.missingAreas.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-yellow-800">
                    <span className="text-yellow-600 font-bold mt-0.5">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Recommended Next Steps
              </h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                    <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Re-analyze Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
            </button>
            <p className="text-xs text-gray-500">
              Last analyzed: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}

      {!analysis && !isAnalyzing && responses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm">Complete some assessment questions to enable gap analysis</p>
        </div>
      )}
    </div>
  )
}
