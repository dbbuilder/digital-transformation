/**
 * Workflow Wizard Component
 *
 * Visual progress stepper for the complete DigiForm workflow
 * - Shows 5 stages: ASSESS → ANALYZE → DECIDE → PLAN → GENERATE
 * - Displays completion percentage per stage
 * - Auto-unlocks next stage when ready
 * - Provides "Resume" button for current stage
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  Brain,
  GitBranch,
  Calendar,
  FileText,
  CheckCircle,
  Circle,
  Lock,
  ChevronRight,
  TrendingUp
} from 'lucide-react'
import { db } from '../../lib/database'
import type { Project } from '../../types'

interface WorkflowStage {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  requiredCompletion: number // Percentage of previous stage required to unlock
  path: string // Route to navigate to
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 'assess',
    name: 'ASSESS',
    icon: ClipboardList,
    description: 'Complete discovery interview questions',
    requiredCompletion: 0, // Always unlocked
    path: '/assessments',
  },
  {
    id: 'analyze',
    name: 'ANALYZE',
    icon: Brain,
    description: 'Review AI-powered insights and gap analysis',
    requiredCompletion: 50, // Unlock at 50% assessment completion
    path: '/analyze',
  },
  {
    id: 'decide',
    name: 'DECIDE',
    icon: GitBranch,
    description: 'Choose transformation path (AI-Included or AI-Free)',
    requiredCompletion: 80, // Unlock at 80% assessment completion
    path: '/path-recommendation',
  },
  {
    id: 'plan',
    name: 'PLAN',
    icon: Calendar,
    description: 'Review roadmap and timeline',
    requiredCompletion: 100, // Unlock after path is selected
    path: '/roadmap',
  },
  {
    id: 'generate',
    name: 'GENERATE',
    icon: FileText,
    description: 'Generate deliverables and export documents',
    requiredCompletion: 100, // Unlock after roadmap reviewed
    path: '/deliverables',
  },
]

interface WorkflowWizardProps {
  project: Project
  compact?: boolean
}

export function WorkflowWizard({ project, compact = false }: WorkflowWizardProps) {
  const navigate = useNavigate()
  const [stageProgress, setStageProgress] = useState<Record<string, number>>({})
  const [currentStage, setCurrentStage] = useState<string>('assess')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    calculateProgress()
  }, [project.id])

  async function calculateProgress() {
    setLoading(true)
    try {
      const progress: Record<string, number> = {}

      // 1. ASSESS stage - based on answered questions
      const allQuestions = await db.interviewQuestions.toArray()
      const responses = await db.assessmentResponses
        .where('projectId')
        .equals(project.id!)
        .toArray()

      const assessCompletion = allQuestions.length > 0
        ? (responses.length / allQuestions.length) * 100
        : 0
      progress.assess = Math.round(assessCompletion)

      // 2. ANALYZE stage - unlocked at 50% assess, complete when gap analysis run
      if (assessCompletion >= 50) {
        // Check if they've viewed the analysis page (we'll track this via a flag or just assume ready)
        progress.analyze = assessCompletion >= 80 ? 100 : 50
      } else {
        progress.analyze = 0
      }

      // 3. DECIDE stage - unlocked at 80% assess, complete when path selected
      if (assessCompletion >= 80) {
        if (project.transformationPath && project.transformationPath !== 'UNDECIDED') {
          progress.decide = 100
        } else {
          progress.decide = 50 // Unlocked but not decided
        }
      } else {
        progress.decide = 0
      }

      // 4. PLAN stage - unlocked after path decided
      if (project.transformationPath && project.transformationPath !== 'UNDECIDED') {
        // Check if roadmap exists
        const roadmap = await db.roadmaps.where('projectId').equals(project.id!).first()
        progress.plan = roadmap ? 100 : 50
      } else {
        progress.plan = 0
      }

      // 5. GENERATE stage - unlocked after roadmap exists
      const roadmap = await db.roadmaps.where('projectId').equals(project.id!).first()
      if (roadmap) {
        // Check if any deliverables generated
        const deliverables = await db.deliverables.where('projectId').equals(project.id!).toArray()
        progress.generate = deliverables.length > 0 ? 100 : 50
      } else {
        progress.generate = 0
      }

      setStageProgress(progress)

      // Determine current stage (first incomplete stage)
      if (progress.generate < 100) {
        setCurrentStage('generate')
      } else if (progress.plan < 100) {
        setCurrentStage('plan')
      } else if (progress.decide < 100) {
        setCurrentStage('decide')
      } else if (progress.analyze < 100) {
        setCurrentStage('analyze')
      } else {
        setCurrentStage('assess')
      }
    } catch (error) {
      console.error('Error calculating workflow progress:', error)
    } finally {
      setLoading(false)
    }
  }

  function isStageUnlocked(stage: WorkflowStage, index: number): boolean {
    if (index === 0) return true // First stage always unlocked

    const previousStage = WORKFLOW_STAGES[index - 1]
    const previousProgress = stageProgress[previousStage.id] || 0

    return previousProgress >= stage.requiredCompletion
  }

  function getStageStatus(stage: WorkflowStage, index: number): 'completed' | 'in-progress' | 'locked' | 'available' {
    const progress = stageProgress[stage.id] || 0

    if (!isStageUnlocked(stage, index)) return 'locked'
    if (progress === 100) return 'completed'
    if (progress > 0) return 'in-progress'
    return 'available'
  }

  function getStageColor(status: 'completed' | 'in-progress' | 'locked' | 'available'): string {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'in-progress':
        return 'bg-blue-500'
      case 'available':
        return 'bg-gray-300'
      case 'locked':
        return 'bg-gray-200'
    }
  }

  function getStageTextColor(status: 'completed' | 'in-progress' | 'locked' | 'available'): string {
    switch (status) {
      case 'completed':
        return 'text-green-700'
      case 'in-progress':
        return 'text-blue-700'
      case 'available':
        return 'text-gray-700'
      case 'locked':
        return 'text-gray-400'
    }
  }

  function handleStageClick(stage: WorkflowStage, index: number) {
    const status = getStageStatus(stage, index)
    if (status === 'locked') return

    navigate(stage.path)
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (compact) {
    // Compact version for sidebar or header
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Workflow Progress</h3>
          <span className="text-xs text-gray-500">
            {Object.values(stageProgress).reduce((a, b) => a + b, 0) / WORKFLOW_STAGES.length}% Complete
          </span>
        </div>
        <div className="space-y-2">
          {WORKFLOW_STAGES.map((stage, index) => {
            const status = getStageStatus(stage, index)
            const progress = stageProgress[stage.id] || 0
            const Icon = stage.icon

            return (
              <div key={stage.id} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getStageColor(status)}`}>
                  {status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : status === 'locked' ? (
                    <Lock className="w-3 h-3 text-gray-400" />
                  ) : (
                    <Icon className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${getStageTextColor(status)}`}>
                      {stage.name}
                    </span>
                    <span className="text-xs text-gray-500">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div
                      className={`${getStageColor(status)} h-1 rounded-full transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Full version for main workflow page
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          Transformation Workflow
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Follow these stages to complete your digital transformation planning
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="relative">
        {/* Connection Lines */}
        <div className="absolute top-10 left-0 right-0 h-1 bg-gray-200 hidden md:block" style={{ left: '5%', right: '5%' }}></div>

        {/* Stages */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {WORKFLOW_STAGES.map((stage, index) => {
            const status = getStageStatus(stage, index)
            const progress = stageProgress[stage.id] || 0
            const Icon = stage.icon
            const isUnlocked = isStageUnlocked(stage, index)
            const isCurrent = stage.id === currentStage

            return (
              <div key={stage.id} className="relative">
                {/* Stage Card */}
                <button
                  onClick={() => handleStageClick(stage, index)}
                  disabled={!isUnlocked}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : status === 'completed'
                        ? 'border-green-300 bg-green-50 hover:shadow-md'
                        : status === 'locked'
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                          : 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  {/* Stage Number & Icon */}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStageColor(status)}`}>
                      {status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : status === 'locked' ? (
                        <Lock className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Icon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getStageTextColor(status)}`}>
                        {progress}%
                      </div>
                    </div>
                  </div>

                  {/* Stage Name */}
                  <h3 className={`font-bold text-sm mb-1 ${getStageTextColor(status)}`}>
                    {index + 1}. {stage.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-600 mb-3">
                    {stage.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getStageColor(status)} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Status Badge */}
                  <div className="mt-3">
                    {status === 'completed' && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                        <CheckCircle className="w-3 h-3" />
                        Complete
                      </span>
                    )}
                    {status === 'in-progress' && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700">
                        <Circle className="w-3 h-3 fill-current" />
                        In Progress
                      </span>
                    )}
                    {status === 'available' && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                        <ChevronRight className="w-3 h-3" />
                        Ready
                      </span>
                    )}
                    {status === 'locked' && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    )}
                  </div>

                  {/* Resume/Start Button for Current Stage */}
                  {isCurrent && isUnlocked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStageClick(stage, index)
                      }}
                      className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      {progress > 0 ? 'Resume' : 'Start'}
                    </button>
                  )}
                </button>

                {/* Connection Arrow (Desktop) */}
                {index < WORKFLOW_STAGES.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">📋 Next Steps:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          {stageProgress.assess < 80 && (
            <li>• Complete at least 80% of assessment questions to unlock path recommendation</li>
          )}
          {stageProgress.assess >= 80 && !project.transformationPath && (
            <li>• Review your assessment results and choose a transformation path</li>
          )}
          {project.transformationPath && project.transformationPath !== 'UNDECIDED' && stageProgress.plan < 100 && (
            <li>• Review and customize your transformation roadmap</li>
          )}
          {stageProgress.plan === 100 && stageProgress.generate < 100 && (
            <li>• Generate your executive deck and deliverables</li>
          )}
          {stageProgress.generate === 100 && (
            <li>✅ Workflow complete! Download your deliverables or start a new project.</li>
          )}
        </ul>
      </div>
    </div>
  )
}
