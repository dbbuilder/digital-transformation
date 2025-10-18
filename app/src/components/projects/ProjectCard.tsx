// Project Card - Display individual project in list view

import type { Project } from '../../types'

interface ProjectCardProps {
  project: Project
  onSelect: (project: Project) => void
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  // Calculate days since last update
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(project.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  )

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

  // Get phase color
  function getPhaseColor(phase: string): string {
    const colors: Record<string, string> = {
      DISCOVERY: 'bg-purple-100 text-purple-700',
      FOUNDATION: 'bg-blue-100 text-blue-700',
      MODERNIZATION: 'bg-green-100 text-green-700',
      INTELLIGENCE: 'bg-pink-100 text-pink-700',
      OPTIMIZATION: 'bg-orange-100 text-orange-700',
    }
    return colors[phase] || 'bg-neutral-100 text-neutral-700'
  }

  // Get transformation path icon
  function getPathIcon(path: string) {
    if (path === 'AI_INCLUDED') {
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      )
    }
    if (path === 'AI_FREE') {
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      )
    }
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )
  }

  return (
    <button
      onClick={() => onSelect(project)}
      className="group w-full rounded-lg border border-neutral-200 bg-white p-6 text-left shadow-sm transition-all hover:border-primary-300 hover:shadow-md"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-1 text-xl font-bold text-neutral-900 group-hover:text-primary-600">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-sm text-neutral-600 line-clamp-2">{project.description}</p>
          )}
        </div>
        <div className="ml-4 flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(project.status)}`}
          >
            {project.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Metadata */}
      <div className="mb-4 flex flex-wrap gap-2">
        <span
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getPhaseColor(project.currentPhase)}`}
        >
          {project.currentPhase.charAt(0) + project.currentPhase.slice(1).toLowerCase()}
        </span>
        <span
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
            project.transformationPath === 'AI_INCLUDED'
              ? 'bg-purple-100 text-purple-700'
              : project.transformationPath === 'AI_FREE'
                ? 'bg-green-100 text-green-700'
                : 'bg-neutral-100 text-neutral-700'
          }`}
        >
          {getPathIcon(project.transformationPath)}
          {project.transformationPath === 'UNDECIDED'
            ? 'Path Undecided'
            : project.transformationPath === 'AI_INCLUDED'
              ? 'AI-Included'
              : 'AI-Free'}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-neutral-500">
        <div className="flex items-center gap-4">
          <span>
            Created {new Date(project.createdAt).toLocaleDateString()}
          </span>
          <span>
            Updated {daysSinceUpdate === 0 ? 'today' : `${daysSinceUpdate}d ago`}
          </span>
        </div>
        <div className="flex items-center gap-1 text-primary-600 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="text-sm font-medium">View Details</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  )
}
