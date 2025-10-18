// Projects Page - Main container for project management

import { useState } from 'react'
import { ProjectList } from './ProjectList'
import { ProjectDetail } from './ProjectDetail'
import { CreateProjectModal } from './CreateProjectModal'
import { useAppStore } from '../../stores/useAppStore'
import type { Project } from '../../types'

interface ProjectsPageProps {
  onNavigateToAssessments: (projectId: number) => void
}

export function ProjectsPage({ onNavigateToAssessments }: ProjectsPageProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const { setCreateProjectModalOpen } = useAppStore()

  function handleSelectProject(project: Project) {
    setSelectedProject(project)
  }

  function handleBack() {
    setSelectedProject(null)
  }

  function handleCreateProject() {
    setCreateProjectModalOpen(true)
  }

  function handleEdit(project: Project) {
    // TODO: Implement edit modal
    console.log('Edit project:', project)
  }

  if (selectedProject) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ProjectDetail
            project={selectedProject}
            onBack={handleBack}
            onEdit={handleEdit}
            onStartAssessments={onNavigateToAssessments}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ProjectList onSelectProject={handleSelectProject} onCreateProject={handleCreateProject} />
      </div>
      <CreateProjectModal />
    </div>
  )
}
