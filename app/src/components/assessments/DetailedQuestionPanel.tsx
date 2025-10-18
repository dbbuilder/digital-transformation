// Detailed Question Panel - Shows enhanced question with sub-questions and guidance

import { useState } from 'react'
import { getEnhancedQuestionMetadata } from '../../data/enhancedQuestions'
import type { Phase, Tier } from '../../types'

interface DetailedQuestionPanelProps {
  questionText: string
  phase: Phase
  tier: Tier
}

export function DetailedQuestionPanel({ questionText, phase, tier }: DetailedQuestionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const metadata = getEnhancedQuestionMetadata(questionText, phase, tier)

  if (!metadata) {
    return null
  }

  return (
    <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h4 className="font-bold text-indigo-900 text-lg">Detailed Interview Guide</h4>
          {metadata.criticalForSOW && (
            <span className="rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-bold border border-red-300">
              CRITICAL FOR SOW
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-indigo-700 hover:text-indigo-900 font-medium text-sm"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Detailed Question */}
          <div className="rounded-lg bg-white border-2 border-indigo-200 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                  ?
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-indigo-900 mb-2">WHAT TO ASK (Detailed Context)</div>
                <p className="text-sm text-neutral-800 leading-relaxed">{metadata.detailedQuestion}</p>
              </div>
            </div>
          </div>

          {/* Sub-Questions */}
          <div className="rounded-lg bg-white border-2 border-blue-200 p-4">
            <div className="flex items-start gap-3 mb-3">
              <svg className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <div className="font-semibold text-blue-900">SPECIFIC QUESTIONS TO ASK THE CLIENT</div>
            </div>
            <div className="space-y-2 ml-8">
              {metadata.subQuestions.map((q, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-neutral-700 flex-1">{q}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why It Matters */}
          <div className="rounded-lg bg-white border-2 border-purple-200 p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="font-semibold text-purple-900 mb-2">WHY THIS MATTERS</div>
                <p className="text-sm text-neutral-700 leading-relaxed">{metadata.whyItMatters}</p>
              </div>
            </div>
          </div>

          {/* What to Listen For */}
          <div className="rounded-lg bg-white border-2 border-green-200 p-4">
            <div className="flex items-start gap-3 mb-3">
              <svg className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <div className="font-semibold text-green-900 mb-3">WHAT TO LISTEN FOR</div>
                <div className="space-y-1">
                  {metadata.whatToListenFor.map((item, idx) => (
                    <div
                      key={idx}
                      className={`text-sm flex items-start gap-2 ${
                        item.includes('RED FLAG')
                          ? 'text-red-700 font-medium'
                          : 'text-neutral-700'
                      }`}
                    >
                      <span className="flex-shrink-0">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Good Example */}
            <div className="rounded-lg bg-green-50 border-2 border-green-300 p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-green-900 text-sm">✅ EXCELLENT ANSWER</span>
              </div>
              <p className="text-xs text-green-800 leading-relaxed">{metadata.exampleGoodAnswer}</p>
            </div>

            {/* Poor Example */}
            <div className="rounded-lg bg-red-50 border-2 border-red-300 p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-red-900 text-sm">❌ INSUFFICIENT ANSWER</span>
              </div>
              <p className="text-xs text-red-800 leading-relaxed">{metadata.examplePoorAnswer}</p>
            </div>
          </div>

          {/* Interviewer Tip */}
          <div className="rounded-lg bg-yellow-50 border-2 border-yellow-300 p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <p className="text-xs text-yellow-900">
                <strong>Pro Tip:</strong> Work through the numbered questions systematically. Don't skip ahead - each question builds context for the next. Ask for demonstrations and evidence. Your goal is to capture an answer that matches the "excellent" example quality.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
