// Project List - Display all projects with filtering and search

import { useEffect, useState } from 'react'
import { db } from '../../lib/database'
import { ProjectCard } from './ProjectCard'
import type { Project } from '../../types'

interface ProjectListProps {
  onSelectProject: (project: Project) => void
  onCreateProject: () => void
}

export function ProjectList({ onSelectProject, onCreateProject }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [pathFilter, setPathFilter] = useState<string>('all')

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [projects, searchTerm, statusFilter, pathFilter])

  async function loadProjects() {
    setLoading(true)
    try {
      const allProjects = await db.projects.toArray()
      // Sort by most recently updated
      allProjects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      setProjects(allProjects)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  function applyFilters() {
    let filtered = [...projects]

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    // Transformation path filter
    if (pathFilter !== 'all') {
      filtered = filtered.filter((p) => p.transformationPath === pathFilter)
    }

    setFilteredProjects(filtered)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-500">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Projects</h2>
          <p className="text-neutral-600">Manage your digital transformation engagements</p>
        </div>
        <button onClick={onCreateProject} className="btn-primary">
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="text-sm font-medium text-neutral-600">Total Projects</div>
          <div className="mt-1 text-3xl font-bold text-neutral-900">{projects.length}</div>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-neutral-600">Active</div>
          <div className="mt-1 text-3xl font-bold text-green-600">
            {projects.filter((p) => p.status === 'active').length}
          </div>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-neutral-600">Completed</div>
          <div className="mt-1 text-3xl font-bold text-blue-600">
            {projects.filter((p) => p.status === 'completed').length}
          </div>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-neutral-600">On Hold</div>
          <div className="mt-1 text-3xl font-bold text-yellow-600">
            {projects.filter((p) => p.status === 'on_hold').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="archived">Archived</option>
          </select>

          {/* Path Filter */}
          <select
            value={pathFilter}
            onChange={(e) => setPathFilter(e.target.value)}
            className="rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="all">All Paths</option>
            <option value="UNDECIDED">Undecided</option>
            <option value="AI_INCLUDED">AI-Included</option>
            <option value="AI_FREE">AI-Free</option>
          </select>
        </div>
      </div>

      {/* Project List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <svg className="h-8 w-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-neutral-900">
            {searchTerm || statusFilter !== 'all' || pathFilter !== 'all'
              ? 'No projects match your filters'
              : 'No projects yet'}
          </h3>
          <p className="mb-6 text-neutral-600">
            {searchTerm || statusFilter !== 'all' || pathFilter !== 'all'
              ? 'Try adjusting your filters to see more projects.'
              : 'Create your first transformation project to get started.'}
          </p>
          <button onClick={onCreateProject} className="btn-primary">
            Create Project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onSelect={onSelectProject} />
          ))}
        </div>
      )}
    </div>
  )
}
