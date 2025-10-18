// Interview Form Component - Displays questions and captures responses

import { useEffect, useState } from 'react'
import { db } from '../../lib/database'
import { getQuestionsByPhaseTier } from '../../lib/csvImporter'
import type { Assessment, InterviewQuestion, AssessmentResponse } from '../../types'

interface InterviewFormProps {
  assessment: Assessment
  onComplete?: () => void
  onBack?: () => void
}

export function InterviewForm({ assessment, onComplete, onBack }: InterviewFormProps) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [responses, setResponses] = useState<Map<string, AssessmentResponse>>(new Map())
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  useEffect(() => {
    loadQuestionsAndResponses()
  }, [assessment.id])

  async function loadQuestionsAndResponses() {
    setLoading(true)
    try {
      // Load questions for this phase/tier
      console.log(`Loading questions for ${assessment.phase} - ${assessment.tier}`)
      const qs = await getQuestionsByPhaseTier(assessment.phase, assessment.tier)
      console.log(`Found ${qs.length} questions:`, qs)
      setQuestions(qs)

      // Load existing responses
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

    try {
      const existingResponse = responses.get(question.id)

      if (existingResponse && existingResponse.id) {
        // Update existing response
        await db.assessmentResponses.update(existingResponse.id, {
          answer,
          notes,
          updatedAt: new Date(),
        })

        // Update local state
        const updated = await db.assessmentResponses.get(existingResponse.id)
        if (updated) {
          setResponses(new Map(responses.set(question.id, updated)))
        }
      } else {
        // Create new response
        const newResponse: AssessmentResponse = {
          assessmentId: assessment.id,
          projectId: assessment.projectId,
          questionId: question.id,
          questionText: question.question,
          answer,
          notes,
          priority: question.priority,
          answeredAt: new Date(),
          updatedAt: new Date(),
        }

        const id = await db.assessmentResponses.add(newResponse)
        const created = await db.assessmentResponses.get(id)

        if (created) {
          setResponses(new Map(responses.set(question.id, created)))
        }
      }

      // Update assessment completion percentage
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
    }
  }

  function handlePrevious() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

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

      {/* Question Card */}
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
                  {currentQuestion.priority}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">{currentQuestion.question}</h3>
            {currentQuestion.aiReadiness && (
              <div className="mt-2 rounded-lg bg-purple-50 p-3">
                <div className="text-xs font-medium text-purple-700">AI Readiness Consideration:</div>
                <div className="mt-1 text-sm text-purple-600">{currentQuestion.aiReadiness}</div>
              </div>
            )}
          </div>
        </div>

        {/* Response Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Your Response</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              rows={4}
              placeholder="Enter your response here..."
              value={(currentResponse?.answer as string) || ''}
              onChange={(e) => saveResponse(currentQuestion, e.target.value, currentResponse?.notes)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Notes / Evidence
              <span className="ml-2 text-xs font-normal text-neutral-500">(Optional)</span>
            </label>
            <textarea
              className="mt-1 w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              rows={3}
              placeholder="Add any supporting notes, evidence, or documentation links..."
              value={currentResponse?.notes || ''}
              onChange={(e) =>
                saveResponse(currentQuestion, (currentResponse?.answer as string) || '', e.target.value)
              }
            />
          </div>
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
                onClick={() => setCurrentQuestionIndex(index)}
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
    </div>
  )
}
