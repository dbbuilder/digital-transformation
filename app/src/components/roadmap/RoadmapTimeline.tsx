// Roadmap Timeline - 32-week transformation timeline visualization

import { useEffect, useState } from 'react'
import { db } from '../../lib/database'
import type { Project, Roadmap, RoadmapPhase } from '../../types'

interface RoadmapTimelineProps {
  projectId: number
}

interface PhaseTemplate {
  phaseNumber: number
  name: string
  weekStart: number
  weekEnd: number
  duration: number
  description: string
  keyDeliverables: string[]
  dependencies: number[]
}

// Standard 32-week transformation roadmap template
const PHASE_TEMPLATES: PhaseTemplate[] = [
  {
    phaseNumber: 1,
    name: 'Discovery & Assessment',
    weekStart: 1,
    weekEnd: 4,
    duration: 4,
    description: 'Conduct stakeholder interviews, assess current state, define future vision',
    keyDeliverables: [
      'Stakeholder interviews completed',
      'Current state assessment',
      'Four-corner framework draft',
      'Transformation path recommendation',
    ],
    dependencies: [],
  },
  {
    phaseNumber: 2,
    name: 'Architecture Planning',
    weekStart: 5,
    weekEnd: 8,
    duration: 4,
    description: 'Design future-state architecture across all five tiers',
    keyDeliverables: [
      'Target architecture diagrams',
      'Technology stack decisions',
      'Integration patterns defined',
      'Security & compliance framework',
    ],
    dependencies: [1],
  },
  {
    phaseNumber: 3,
    name: 'Foundation Setup',
    weekStart: 9,
    weekEnd: 12,
    duration: 4,
    description: 'Establish cloud platform, CI/CD, and data foundation',
    keyDeliverables: [
      'Cloud infrastructure provisioned',
      'CI/CD pipeline operational',
      'Base data platform deployed',
      'DevOps practices established',
    ],
    dependencies: [2],
  },
  {
    phaseNumber: 4,
    name: 'API Layer Development',
    weekStart: 13,
    weekEnd: 16,
    duration: 4,
    description: 'Build API gateway, authentication, and core services',
    keyDeliverables: [
      'API gateway deployed',
      'Authentication/authorization',
      'Core microservices',
      'API documentation',
    ],
    dependencies: [3],
  },
  {
    phaseNumber: 5,
    name: 'Data Migration - Phase 1',
    weekStart: 13,
    weekEnd: 18,
    duration: 6,
    description: 'Migrate critical data, establish pipelines, implement quality checks',
    keyDeliverables: [
      'Data migration scripts',
      'ETL/ELT pipelines',
      'Data quality monitoring',
      'Initial data migrated',
    ],
    dependencies: [3],
  },
  {
    phaseNumber: 6,
    name: 'UI Components & Design System',
    weekStart: 17,
    weekEnd: 20,
    duration: 4,
    description: 'Build component library, design tokens, and accessibility framework',
    keyDeliverables: [
      'Design system established',
      'Component library',
      'Accessibility testing',
      'Responsive patterns',
    ],
    dependencies: [4],
  },
  {
    phaseNumber: 7,
    name: 'Core Application Development',
    weekStart: 19,
    weekEnd: 24,
    duration: 6,
    description: 'Develop primary user journeys and business workflows',
    keyDeliverables: [
      'User workflows implemented',
      'Business logic deployed',
      'Integration testing',
      'Performance baseline',
    ],
    dependencies: [4, 6],
  },
  {
    phaseNumber: 8,
    name: 'AI/ML Integration',
    weekStart: 21,
    weekEnd: 26,
    duration: 6,
    description: 'Implement AI features, ML Ops, and intelligent automation (AI-Included path)',
    keyDeliverables: [
      'ML models deployed',
      'AI governance framework',
      'Evaluation harness',
      'Human-in-loop workflows',
    ],
    dependencies: [5, 7],
  },
  {
    phaseNumber: 9,
    name: 'Testing & Quality Assurance',
    weekStart: 25,
    weekEnd: 28,
    duration: 4,
    description: 'Comprehensive testing, security audits, performance optimization',
    keyDeliverables: [
      'Test automation suite',
      'Security audit completed',
      'Performance testing',
      'Bug resolution',
    ],
    dependencies: [7, 8],
  },
  {
    phaseNumber: 10,
    name: 'User Acceptance Testing',
    weekStart: 27,
    weekEnd: 29,
    duration: 3,
    description: 'Stakeholder validation, pilot user testing, feedback incorporation',
    keyDeliverables: [
      'UAT completed',
      'User feedback integrated',
      'Training materials',
      'Go-live approval',
    ],
    dependencies: [9],
  },
  {
    phaseNumber: 11,
    name: 'Deployment & Cutover',
    weekStart: 30,
    weekEnd: 31,
    duration: 2,
    description: 'Production deployment, data cutover, go-live support',
    keyDeliverables: [
      'Production deployment',
      'Data cutover completed',
      'Monitoring enabled',
      'Support team ready',
    ],
    dependencies: [10],
  },
  {
    phaseNumber: 12,
    name: 'Hypercare & Optimization',
    weekStart: 32,
    weekEnd: 32,
    duration: 1,
    description: 'Post-launch support, issue resolution, performance tuning',
    keyDeliverables: [
      'Issue resolution',
      'Performance optimization',
      'User support',
      'Lessons learned',
    ],
    dependencies: [11],
  },
]

export function RoadmapTimeline({ projectId }: RoadmapTimelineProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [roadmapPhases, setRoadmapPhases] = useState<RoadmapPhase[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhase, setSelectedPhase] = useState<PhaseTemplate | null>(null)

  useEffect(() => {
    loadRoadmapData()
  }, [projectId])

  async function loadRoadmapData() {
    setLoading(true)
    try {
      const [projectData, roadmapData, phasesData] = await Promise.all([
        db.projects.get(projectId),
        db.roadmaps.where('projectId').equals(projectId).first(),
        db.roadmapPhases.where('projectId').equals(projectId).toArray(),
      ])

      setProject(projectData || null)
      setRoadmap(roadmapData || null)
      setRoadmapPhases(phasesData)
    } catch (error) {
      console.error('Error loading roadmap:', error)
    } finally {
      setLoading(false)
    }
  }

  async function initializeRoadmap() {
    if (!project) return

    try {
      // Create roadmap
      const roadmapId = await db.roadmaps.add({
        projectId,
        name: `${project.name} - Transformation Roadmap`,
        startDate: new Date(),
        endDate: new Date(Date.now() + 32 * 7 * 24 * 60 * 60 * 1000), // 32 weeks from now
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Create phases from template
      const phases = PHASE_TEMPLATES.map((template) => ({
        roadmapId: roadmapId as number,
        projectId,
        phaseNumber: template.phaseNumber,
        name: template.name,
        weekStart: template.weekStart,
        weekEnd: template.weekEnd,
        duration: template.duration,
        description: template.description,
        deliverables: template.keyDeliverables,
        status: 'not_started' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      await db.roadmapPhases.bulkAdd(phases)

      // Reload data
      await loadRoadmapData()
    } catch (error) {
      console.error('Error initializing roadmap:', error)
    }
  }

  function getWeekColor(weekNumber: number): string {
    // Color code based on phase
    const phase = PHASE_TEMPLATES.find(
      (p) => weekNumber >= p.weekStart && weekNumber <= p.weekEnd
    )
    if (!phase) return 'bg-neutral-200'

    const colors = [
      'bg-purple-300',
      'bg-blue-300',
      'bg-cyan-300',
      'bg-green-300',
      'bg-lime-300',
      'bg-yellow-300',
      'bg-orange-300',
      'bg-red-300',
      'bg-pink-300',
      'bg-violet-300',
      'bg-indigo-300',
      'bg-neutral-300',
    ]

    return colors[(phase.phaseNumber - 1) % colors.length]
  }

  function getPhaseStatus(phaseNumber: number): string {
    const phase = roadmapPhases.find((p) => p.phaseNumber === phaseNumber)
    return phase?.status || 'not_started'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-500">Loading roadmap...</div>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <svg className="h-8 w-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-neutral-900">No roadmap yet</h3>
          <p className="mb-6 text-neutral-600">
            Create a 32-week transformation roadmap to guide your implementation.
          </p>
          <button onClick={initializeRoadmap} className="btn-primary">
            Create Roadmap
          </button>
        </div>

        {/* Roadmap Preview */}
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">
            What's in the Transformation Roadmap?
          </h3>
          <div className="space-y-3">
            {PHASE_TEMPLATES.slice(0, 5).map((phase) => (
              <div key={phase.phaseNumber} className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                  {phase.phaseNumber}
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900">
                    {phase.name} <span className="text-sm text-neutral-500">(Weeks {phase.weekStart}-{phase.weekEnd})</span>
                  </h4>
                  <p className="text-sm text-neutral-600">{phase.description}</p>
                </div>
              </div>
            ))}
            <p className="text-sm italic text-neutral-500">...and 7 more phases</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">32-Week Transformation Roadmap</h2>
          <p className="text-neutral-600">
            {roadmap.startDate ? new Date(roadmap.startDate).toLocaleDateString() : 'Start date not set'} -
            {roadmap.endDate ? new Date(roadmap.endDate).toLocaleDateString() : 'End date not set'}
          </p>
        </div>
        <button className="btn-secondary">
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export Roadmap
        </button>
      </div>

      {/* Timeline Visualization */}
      <div className="card">
        <h3 className="mb-4 text-sm font-semibold text-neutral-700">32-Week Timeline</h3>

        {/* Week markers */}
        <div className="mb-2 flex gap-1">
          {Array.from({ length: 32 }, (_, i) => i + 1).map((week) => (
            <div
              key={week}
              className={`flex-1 rounded ${getWeekColor(week)} h-8 flex items-center justify-center text-xs font-medium text-neutral-800`}
              title={`Week ${week}`}
            >
              {week}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {PHASE_TEMPLATES.map((phase) => (
            <div key={phase.phaseNumber} className="flex items-center gap-1">
              <div className={`h-3 w-3 rounded ${getWeekColor(phase.weekStart)}`} />
              <span className="text-neutral-600">Phase {phase.phaseNumber}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900">Transformation Phases</h3>

        {PHASE_TEMPLATES.map((phase) => {
          const status = getPhaseStatus(phase.phaseNumber)
          const isActive = selectedPhase?.phaseNumber === phase.phaseNumber

          return (
            <div
              key={phase.phaseNumber}
              className={`card cursor-pointer transition-all ${
                isActive ? 'ring-2 ring-primary-500' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedPhase(isActive ? null : phase)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${getWeekColor(phase.weekStart)} text-lg font-bold text-neutral-800`}>
                    {phase.phaseNumber}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold text-neutral-900">{phase.name}</h4>
                      <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                        Weeks {phase.weekStart}-{phase.weekEnd}
                      </span>
                      {status === 'completed' && (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          Completed
                        </span>
                      )}
                      {status === 'in_progress' && (
                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-neutral-600">{phase.description}</p>

                    {/* Expanded view */}
                    {isActive && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <h5 className="mb-2 text-sm font-semibold text-neutral-900">Key Deliverables</h5>
                          <ul className="space-y-1">
                            {phase.keyDeliverables.map((deliverable, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-neutral-700">
                                <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {deliverable}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {phase.dependencies.length > 0 && (
                          <div>
                            <h5 className="mb-2 text-sm font-semibold text-neutral-900">Dependencies</h5>
                            <div className="flex flex-wrap gap-2">
                              {phase.dependencies.map((dep) => (
                                <span key={dep} className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                                  Phase {dep}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-neutral-500">
                  {phase.duration} week{phase.duration > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
