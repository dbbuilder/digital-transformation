// Enhanced Interview Form - Comprehensive guidance for interviewers

import { useEffect, useState } from 'react'
import { db } from '../../lib/database'
import { getQuestionsByPhaseTier } from '../../lib/csvImporter'
import { scoreResponseQuality, tierGuidanceTemplates } from '../../data/questionGuidance'
import { ReferenceMaterialsPanel } from './ReferenceMaterialsPanel'
import { DetailedQuestionPanel } from './DetailedQuestionPanel'
import { SOWPreviewPanel } from './SOWPreviewPanel'
import { StakeholderSelector } from './StakeholderSelector'
import type { Assessment, InterviewQuestion, AssessmentResponse, InterviewResponse } from '../../types'

interface EnhancedInterviewFormProps {
  assessment: Assessment
  onComplete?: () => void
  onBack?: () => void
}

export function EnhancedInterviewForm({ assessment, onComplete, onBack }: EnhancedInterviewFormProps) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [responses, setResponses] = useState<Map<string, AssessmentResponse>>(new Map())
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showGuidance, setShowGuidance] = useState(false) // Start minimized
  const [showDetailedQuestion, setShowDetailedQuestion] = useState(false) // Start minimized
  const [showReferenceMaterials, setShowReferenceMaterials] = useState(false) // Start minimized
  const [responseQuality, setResponseQuality] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'interview' | 'sow-preview'>('interview')
  const [selectedStakeholder, setSelectedStakeholder] = useState<number | undefined>(undefined)

  useEffect(() => {
    loadQuestionsAndResponses()
  }, [assessment.id])

  async function loadQuestionsAndResponses() {
    setLoading(true)
    try {
      const qs = await getQuestionsByPhaseTier(assessment.phase, assessment.tier)
      setQuestions(qs)

      if (assessment.id) {
        const existingResponses = await db.assessmentResponses
          .where('assessmentId')
          .equals(assessment.id)
          .toArray()

        const responseMap = new Map<string, AssessmentResponse>()
        existingResponses.forEach((r) => {
          responseMap.set(r.questionId, r)
        })
        setResponses(responseMap)
      }
    } catch (error) {
      console.error('Error loading questions and responses:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveResponse(question: InterviewQuestion, answer: string, notes?: string) {
    if (!assessment.id || !assessment.projectId) return

    // Score the response
    const quality = scoreResponseQuality(answer)
    setResponseQuality(quality)

    try {
      const existingResponse = responses.get(question.id)

      if (existingResponse && existingResponse.id) {
        await db.assessmentResponses.update(existingResponse.id, {
          answer,
          notes,
          answeredBy: selectedStakeholder,
          updatedAt: new Date(),
        })

        const updated = await db.assessmentResponses.get(existingResponse.id)
        if (updated) {
          setResponses(new Map(responses.set(question.id, updated)))
        }
      } else {
        const newResponse: AssessmentResponse = {
          assessmentId: assessment.id,
          projectId: assessment.projectId,
          questionId: question.id,
          questionText: question.question,
          answer,
          notes,
          priority: question.priority,
          answeredBy: selectedStakeholder,
          answeredAt: new Date(),
          updatedAt: new Date(),
        }

        const id = await db.assessmentResponses.add(newResponse)
        const created = await db.assessmentResponses.get(id)

        if (created) {
          setResponses(new Map(responses.set(question.id, created)))
        }
      }

      await updateAssessmentProgress()
    } catch (error) {
      console.error('Error saving response:', error)
    }
  }

  async function updateAssessmentProgress() {
    if (!assessment.id) return

    const totalQuestions = questions.length
    const answeredQuestions = Array.from(responses.values()).filter((r) => r.answer).length
    const completionPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0

    const status = completionPercentage === 0 ? 'not_started' : completionPercentage === 100 ? 'completed' : 'in_progress'

    await db.assessments.update(assessment.id, {
      completionPercentage,
      status,
      updatedAt: new Date(),
      ...(status === 'completed' && { completedAt: new Date() }),
    })
  }

  function handleNext() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setResponseQuality(null) // Reset quality for new question
    }
  }

  function handlePrevious() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setResponseQuality(null)
    }
  }

  // Load stakeholder for current question when question changes
  useEffect(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex]
      const currentResponse = responses.get(currentQuestion.id)
      setSelectedStakeholder(currentResponse?.answeredBy)
    }
  }, [currentQuestionIndex, questions, responses])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-500">Loading interview questions...</div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-neutral-600">No interview questions available for this phase and tier.</p>
        <button onClick={onBack} className="btn-secondary mt-4">
          Back to Assessments
        </button>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentResponse = responses.get(currentQuestion.id)
  const answeredCount = Array.from(responses.values()).filter((r) => r.answer).length
  const progress = Math.round((answeredCount / questions.length) * 100)

  // Get tier-specific guidance
  const tierGuidance = tierGuidanceTemplates[assessment.tier]
  const trackGuidance = currentQuestion.track === 'BUSINESS' ? tierGuidance.business : tierGuidance.technical

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={onBack} className="mb-2 text-sm text-primary-600 hover:text-primary-700">
            ← Back to Assessments
          </button>
          <h2 className="text-2xl font-bold text-neutral-900">
            {assessment.phase.charAt(0) + assessment.phase.slice(1).toLowerCase()} - {assessment.tier}
          </h2>
          <p className="text-sm text-neutral-600 mt-1">{trackGuidance}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-neutral-600">Progress</div>
          <div className="text-2xl font-bold text-primary-600">{progress}%</div>
          <div className="text-xs text-neutral-500">
            {answeredCount} / {questions.length} answered
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full bg-primary-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 border-b border-neutral-200">
        <button
          onClick={() => setViewMode('interview')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            viewMode === 'interview'
              ? 'border-primary-500 text-primary-700'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          📋 Interview Questions
        </button>
        <button
          onClick={() => setViewMode('sow-preview')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            viewMode === 'sow-preview'
              ? 'border-primary-500 text-primary-700'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          📄 SOW Preview
          {Array.from(responses.values()).filter(r => r.answer).length > 0 && (
            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
              {Array.from(responses.values()).filter(r => r.answer).length}
            </span>
          )}
        </button>
      </div>

      {/* Interview Questions View */}
      {viewMode === 'interview' && (
        <>
          {/* Question Card - MOVED TO TOP */}
      <div className="card">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                {currentQuestion.track}
              </span>
              {currentQuestion.priority && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    currentQuestion.priority === 'HIGH'
                      ? 'bg-red-100 text-red-700'
                      : currentQuestion.priority === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                  }`}
                >
                  {currentQuestion.priority} PRIORITY
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">{currentQuestion.question}</h3>
            {currentQuestion.aiReadiness && (
              <div className="mt-2 rounded-lg bg-purple-50 p-3 border border-purple-200">
                <div className="text-xs font-medium text-purple-700">🤖 AI Readiness Consideration:</div>
                <div className="mt-1 text-sm text-purple-600">{currentQuestion.aiReadiness}</div>
              </div>
            )}
          </div>
        </div>

        {/* Stakeholder Selector - Always Visible */}
        {assessment.projectId && (
          <div className="mb-4 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
            <StakeholderSelector
              projectId={assessment.projectId}
              tier={assessment.tier}
              phase={assessment.phase}
              questionText={currentQuestion.question}
              selectedStakeholderId={selectedStakeholder}
              onSelect={setSelectedStakeholder}
              compact={true}
            />
          </div>
        )}

        {/* Response Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Your Response
              <span className="ml-2 text-xs text-neutral-500">(Aim for specific, detailed answers)</span>
            </label>
            <textarea
              className="mt-1 w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              rows={6}
              placeholder="Document specific details: current state, problems, metrics, desired outcomes, tools/technologies, and business impact..."
              value={(currentResponse?.answer as string) || ''}
              onChange={(e) => saveResponse(currentQuestion, e.target.value, currentResponse?.notes)}
            />
          </div>

          {/* Response Quality Feedback */}
          {responseQuality && currentResponse?.answer && (
            <div className={`rounded-lg border-2 p-4 ${
              responseQuality.score >= 70
                ? 'bg-green-50 border-green-300'
                : responseQuality.score >= 40
                  ? 'bg-yellow-50 border-yellow-300'
                  : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold flex items-center gap-2">
                  {responseQuality.score >= 70 ? (
                    <>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-green-900">Great response!</span>
                    </>
                  ) : responseQuality.score >= 40 ? (
                    <>
                      <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-yellow-900">Good, but could be better</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-900">Needs more detail</span>
                    </>
                  )}
                </div>
                <div className="text-2xl font-bold">
                  <span className={
                    responseQuality.score >= 70
                      ? 'text-green-700'
                      : responseQuality.score >= 40
                        ? 'text-yellow-700'
                        : 'text-red-700'
                  }>{responseQuality.score}%</span>
                </div>
              </div>

              {responseQuality.feedback.length > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="text-sm font-medium text-neutral-700">Suggestions to improve:</div>
                  {responseQuality.feedback.map((fb: string, idx: number) => (
                    <div key={idx} className="text-sm text-neutral-600">• {fb}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Notes / Evidence / Follow-up
              <span className="ml-2 text-xs text-neutral-500">(Links, screenshots, documentation)</span>
            </label>
            <textarea
              className="mt-1 w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              rows={3}
              placeholder="Add links to documentation, screenshot URLs, follow-up questions, or any additional evidence..."
              value={currentResponse?.notes || ''}
              onChange={(e) =>
                saveResponse(currentQuestion, (currentResponse?.answer as string) || '', e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* Reference Materials Section - All Start Minimized */}
      <div className="space-y-3">
        {/* Detailed Question Guide */}
        <div className="rounded-lg border-2 border-neutral-200 bg-white overflow-hidden">
          <button
            onClick={() => setShowDetailedQuestion(!showDetailedQuestion)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium text-neutral-900">Detailed Question Guide</span>
            </div>
            <svg
              className={`w-5 h-5 text-neutral-500 transition-transform ${showDetailedQuestion ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showDetailedQuestion && (
            <div className="border-t border-neutral-200">
              <DetailedQuestionPanel
                questionText={currentQuestion.question}
                phase={assessment.phase}
                tier={assessment.tier}
              />
            </div>
          )}
        </div>

        {/* Reference Materials */}
        <div className="rounded-lg border-2 border-neutral-200 bg-white overflow-hidden">
          <button
            onClick={() => setShowReferenceMaterials(!showReferenceMaterials)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="font-medium text-neutral-900">Reference Materials</span>
            </div>
            <svg
              className={`w-5 h-5 text-neutral-500 transition-transform ${showReferenceMaterials ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showReferenceMaterials && (
            <div className="border-t border-neutral-200">
              <ReferenceMaterialsPanel
                questionText={currentQuestion.question}
                phase={assessment.phase}
                tier={assessment.tier}
              />
            </div>
          )}
        </div>

        {/* Interview Guidance */}
        <div className="rounded-lg border-2 border-neutral-200 bg-white overflow-hidden">
          <button
            onClick={() => setShowGuidance(!showGuidance)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="font-medium text-neutral-900">Interview Guidance</span>
            </div>
            <svg
              className={`w-5 h-5 text-neutral-500 transition-transform ${showGuidance ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showGuidance && (
            <div className="p-4 border-t border-neutral-200">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  How to Get Quality Responses
                </h4>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* What to Ask */}
                  <div className="rounded-lg bg-white p-4 border border-blue-200">
                    <div className="text-sm font-semibold text-blue-900 mb-2">💬 Key Talking Points</div>
                    <ul className="text-sm text-neutral-700 space-y-1">
                      <li>• "Tell me about your current {assessment.tier} setup..."</li>
                      <li>• "What are your biggest challenges with {assessment.tier}?"</li>
                      <li>• "How do you measure success for {assessment.tier}?"</li>
                      <li>• "Can you show me examples or walk me through the process?"</li>
                    </ul>
                  </div>

                  {/* What to Document */}
                  <div className="rounded-lg bg-white p-4 border border-blue-200">
                    <div className="text-sm font-semibold text-blue-900 mb-2">📝 Information to Capture</div>
                    <ul className="text-sm text-neutral-700 space-y-1">
                      <li>• Specific tool names and versions</li>
                      <li>• Quantifiable metrics (time, cost, volume, etc.)</li>
                      <li>• Current state AND desired future state</li>
                      <li>• Business impact and pain points</li>
                    </ul>
                  </div>

                  {/* Evidence to Collect */}
                  <div className="rounded-lg bg-white p-4 border border-blue-200">
                    <div className="text-sm font-semibold text-blue-900 mb-2">🗂️ Supporting Evidence</div>
                    <ul className="text-sm text-neutral-700 space-y-1">
                      <li>• Screenshots or diagrams</li>
                      <li>• Analytics or reports</li>
                      <li>• Config files or documentation</li>
                      <li>• User feedback or tickets</li>
                    </ul>
                  </div>

                  {/* Red Flags */}
                  <div className="rounded-lg bg-white p-4 border border-red-100">
                    <div className="text-sm font-semibold text-red-900 mb-2">⚠️ Red Flags to Avoid</div>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Vague answers like "improve things"</li>
                      <li>• No metrics or measurements</li>
                      <li>• Missing current vs future state</li>
                      <li>• No stakeholder consensus</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Previous
        </button>

        <div className="text-sm text-neutral-600">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>

        {currentQuestionIndex === questions.length - 1 ? (
          <button onClick={onComplete} className="btn-primary">
            Complete Assessment
          </button>
        ) : (
          <button onClick={handleNext} className="btn-primary">
            Next →
          </button>
        )}
      </div>

      {/* Quick Jump */}
      <div className="card">
        <h4 className="mb-3 text-sm font-semibold text-neutral-900">Quick Jump to Question</h4>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, index) => {
            const hasResponse = responses.get(q.id)?.answer
            return (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentQuestionIndex(index)
                  setResponseQuality(null)
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : hasResponse
                      ? 'border-green-300 bg-green-100 text-green-700 hover:bg-green-200'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
      </div>
        </>
      )}

      {/* SOW Preview View */}
      {viewMode === 'sow-preview' && (
        <SOWPreviewPanel
          assessment={assessment}
          responses={convertToInterviewResponses(Array.from(responses.values()), questions)}
        />
      )}
    </div>
  )
}

// Helper function to convert AssessmentResponse to InterviewResponse
function convertToInterviewResponses(
  assessmentResponses: AssessmentResponse[],
  questions: InterviewQuestion[]
): InterviewResponse[] {
  return assessmentResponses
    .filter(r => r.answer) // Only include answered questions
    .map(r => {
      const question = questions.find(q => q.id === r.questionId)
      return {
        id: r.id || 0,
        question: r.questionText,
        response: r.answer as string,
        notes: r.notes,
        tier: question?.tier || 'UI',
        phase: question?.phase || 'DISCOVERY',
        track: question?.track || 'BUSINESS',
      } as InterviewResponse
    })
}
