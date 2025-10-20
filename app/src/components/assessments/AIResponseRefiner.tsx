/**
 * AI Response Refiner Component
 *
 * Allows users to enhance their assessment responses using AI
 * - Expands vague answers into detailed responses
 * - Suggests follow-up questions for incomplete responses
 * - Shows before/after comparison with user approval
 */

import { useState } from 'react'
import { Sparkles, Check, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { getAIService } from '../../services/AIService'
import type { AssessmentResponse, Tier } from '../../types'

interface AIResponseRefinerProps {
  questionId: string
  questionText: string
  currentAnswer: string
  tier: Tier
  context?: AssessmentResponse[]
  onAccept: (refinedAnswer: string) => void
  onReject: () => void
}

export function AIResponseRefiner({
  questionId,
  questionText,
  currentAnswer,
  tier,
  context,
  onAccept,
  onReject,
}: AIResponseRefinerProps) {
  const [isRefining, setIsRefining] = useState(false)
  const [refinedAnswer, setRefinedAnswer] = useState<string | null>(null)
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])
  const [showFollowUps, setShowFollowUps] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const aiService = getAIService()

  const handleRefine = async () => {
    if (!currentAnswer || currentAnswer.trim().length < 3) {
      setError('Please provide an initial answer before refining')
      return
    }

    setIsRefining(true)
    setError(null)

    try {
      // Refine the response
      const refined = await aiService.refineResponse(questionText, currentAnswer, tier, context)
      setRefinedAnswer(refined)

      // Generate follow-up questions
      const followUps = await aiService.generateFollowUpQuestions(questionText, currentAnswer, tier)
      setFollowUpQuestions(followUps)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refine response')
      console.error('AI refinement error:', err)
    } finally {
      setIsRefining(false)
    }
  }

  const handleAccept = () => {
    if (refinedAnswer) {
      onAccept(refinedAnswer)
      setRefinedAnswer(null)
      setFollowUpQuestions([])
    }
  }

  const handleReject = () => {
    setRefinedAnswer(null)
    setFollowUpQuestions([])
    onReject()
  }

  const handleEdit = () => {
    if (refinedAnswer) {
      onAccept(refinedAnswer)
      setRefinedAnswer(null)
      setFollowUpQuestions([])
    }
  }

  if (!aiService.isAvailable()) {
    return (
      <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
        <p className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          AI enhancement available - Configure API key in Settings
        </p>
      </div>
    )
  }

  return (
    <div className="mt-2 space-y-3">
      {/* Refine Button */}
      {!refinedAnswer && (
        <button
          onClick={handleRefine}
          disabled={isRefining || !currentAnswer || currentAnswer.trim().length < 3}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {isRefining ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enhancing with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Enhance with AI
            </>
          )}
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Refined Response Comparison */}
      {refinedAnswer && (
        <div className="border border-purple-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="bg-purple-50 px-4 py-2 border-b border-purple-200">
            <h4 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI-Enhanced Response
            </h4>
          </div>

          <div className="p-4 space-y-4">
            {/* Before */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Original:</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                {currentAnswer}
              </p>
            </div>

            {/* After */}
            <div>
              <p className="text-xs font-medium text-purple-700 mb-1">Enhanced:</p>
              <p className="text-sm text-gray-900 bg-purple-50 p-3 rounded border border-purple-200 font-medium">
                {refinedAnswer}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleAccept}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Check className="w-4 h-4" />
                Accept
              </button>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={handleReject}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Questions */}
      {followUpQuestions.length > 0 && (
        <div className="border border-blue-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <button
            onClick={() => setShowFollowUps(!showFollowUps)}
            className="w-full bg-blue-50 px-4 py-2 border-b border-blue-200 flex items-center justify-between hover:bg-blue-100 transition-colors"
          >
            <h4 className="text-sm font-semibold text-blue-900">
              Suggested Follow-up Questions ({followUpQuestions.length})
            </h4>
            {showFollowUps ? (
              <ChevronUp className="w-4 h-4 text-blue-700" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-700" />
            )}
          </button>

          {showFollowUps && (
            <div className="p-4">
              <p className="text-xs text-gray-600 mb-3">
                These questions can help provide more complete information:
              </p>
              <ul className="space-y-2">
                {followUpQuestions.map((question, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-600 font-semibold mt-0.5">{idx + 1}.</span>
                    <span>{question}</span>
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
