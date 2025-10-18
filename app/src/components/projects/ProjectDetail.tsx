// Project Detail - Detailed view of a single project with quick access to all features

import { useEffect, useState } from 'react'
import { db } from '../../lib/database'
import { ExportDeliverables } from '../deliverables/ExportDeliverables'
import { RoadmapTimeline } from '../roadmap/RoadmapTimeline'
import { ProjectBackup } from './ProjectBackup'
import type { Project, Stakeholder, Assessment } from '../../types'

interface ProjectDetailProps {
  project: Project
  onBack: () => void
  onEdit: (project: Project) => void
  onStartAssessments: (projectId: number) => void
}

type ViewMode = 'overview' | 'roadmap'

export function ProjectDetail({ project, onBack, onEdit, onStartAssessments }: ProjectDetailProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjectData()
  }, [project.id])

  async function loadProjectData() {
    if (!project.id) return

    setLoading(true)
    try {
      const [stakeholderData, assessmentData] = await Promise.all([
        db.stakeholders.where('projectId').equals(project.id).toArray(),
        db.assessments.where('projectId').equals(project.id).toArray(),
      ])

      setStakeholders(stakeholderData)
      setAssessments(assessmentData)
    } catch (error) {
      console.error('Error loading project data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate assessment progress
  const completedAssessments = assessments.filter((a) => a.status === 'completed').length
  const totalAssessments = assessments.length
  const assessmentProgress =
    totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0

  // Get phase color
  function getPhaseColor(phase: string): string {
    const colors: Record<string, string> = {
      DISCOVERY: 'bg-purple-100 text-purple-700 border-purple-200',
      FOUNDATION: 'bg-blue-100 text-blue-700 border-blue-200',
      MODERNIZATION: 'bg-green-100 text-green-700 border-green-200',
      INTELLIGENCE: 'bg-pink-100 text-pink-700 border-pink-200',
      OPTIMIZATION: 'bg-orange-100 text-orange-700 border-orange-200',
    }
    return colors[phase] || 'bg-neutral-100 text-neutral-700 border-neutral-200'
  }

  // Get status color
  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      on_hold: 'bg-yellow-100 text-yellow-700',
      archived: 'bg-neutral-100 text-neutral-700',
    }
    return colors[status] || 'bg-neutral-100 text-neutral-700'
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button onClick={onBack} className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Projects
      </button>

      {/* View Switcher Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('overview')}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            viewMode === 'overview'
              ? 'bg-primary-500 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setViewMode('roadmap')}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            viewMode === 'roadmap'
              ? 'bg-primary-500 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          Roadmap
        </button>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'roadmap' && project.id ? (
        <RoadmapTimeline projectId={project.id} />
      ) : (
        <>
          {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(project.status)}`}
              >
                {project.status.replace('_', ' ').toUpperCase()}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getPhaseColor(project.currentPhase)}`}
              >
                {project.currentPhase.charAt(0) + project.currentPhase.slice(1).toLowerCase()}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-neutral-900">{project.name}</h2>
            {project.description && (
              <p className="mt-2 text-neutral-600">{project.description}</p>
            )}
          </div>
          <button onClick={() => onEdit(project)} className="btn-secondary">
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Project
          </button>
        </div>

        {/* Metadata */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <div className="text-sm font-medium text-neutral-600">Transformation Path</div>
            <div className="mt-1 text-lg font-semibold text-neutral-900">
              {project.transformationPath === 'AI_INCLUDED'
                ? 'AI-Included'
                : project.transformationPath === 'AI_FREE'
                  ? 'AI-Free'
                  : 'Undecided'}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-neutral-600">Created</div>
            <div className="mt-1 text-lg font-semibold text-neutral-900">
              {new Date(project.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-neutral-600">Last Updated</div>
            <div className="mt-1 text-lg font-semibold text-neutral-900">
              {new Date(project.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          onClick={() => project.id && onStartAssessments(project.id)}
          className="card flex items-start gap-4 text-left hover:border-primary-300 hover:shadow-md"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100">
            <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900">Assessments</h3>
            <p className="text-sm text-neutral-600">{assessmentProgress}% complete</p>
          </div>
        </button>

        <button className="card flex items-start gap-4 text-left hover:border-primary-300 hover:shadow-md">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900">Four-Corner Diagram</h3>
            <p className="text-sm text-neutral-600">Visualize transformation</p>
          </div>
        </button>

        <button
          onClick={() => setViewMode('roadmap')}
          className="card flex items-start gap-4 text-left hover:border-primary-300 hover:shadow-md"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900">Roadmap</h3>
            <p className="text-sm text-neutral-600">32-week timeline</p>
          </div>
        </button>

        <button className="card flex items-start gap-4 text-left hover:border-primary-300 hover:shadow-md">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100">
            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900">Stakeholders</h3>
            <p className="text-sm text-neutral-600">{stakeholders.length} people</p>
          </div>
        </button>

        {project.id && (
          <>
            <ProjectBackup projectId={project.id} projectName={project.name} />
            <ExportDeliverables projectId={project.id} projectName={project.name} />
          </>
        )}
      </div>

      {/* Stakeholders */}
      {stakeholders.length > 0 && (
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">Stakeholders</h3>
          <div className="space-y-3">
            {stakeholders.map((stakeholder) => (
              <div
                key={stakeholder.id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold">
                    {stakeholder.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-neutral-900">{stakeholder.name}</div>
                    <div className="text-sm text-neutral-600">
                      {stakeholder.role}
                      {stakeholder.department && ` • ${stakeholder.department}`}
                    </div>
                  </div>
                </div>
                {stakeholder.email && (
                  <a
                    href={`mailto:${stakeholder.email}`}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {stakeholder.email}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessment Progress */}
      {assessments.length > 0 && (
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">Assessment Progress</h3>
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-neutral-600">Overall Completion</span>
              <span className="text-sm font-semibold text-neutral-900">{assessmentProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ width: `${assessmentProgress}%` }}
              />
            </div>
          </div>
          <div className="text-sm text-neutral-600">
            {completedAssessments} of {totalAssessments} assessments completed
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}
