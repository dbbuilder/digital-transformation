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
      <ProjectDetail
        project={selectedProject}
        onBack={handleBack}
        onEdit={handleEdit}
        onStartAssessments={onNavigateToAssessments}
      />
    )
  }

  return (
    <>
      <ProjectList onSelectProject={handleSelectProject} onCreateProject={handleCreateProject} />
      <CreateProjectModal />
    </>
  )
}
