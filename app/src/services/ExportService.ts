// Export Service - JSON export/import for project backup and data portability

import { db } from '../lib/database'
import type {
  Project,
  Stakeholder,
  Assessment,
  AssessmentResponse,
  Roadmap,
  RoadmapPhase,
  FourCornerData,
  Document,
} from '../types'

export interface ProjectExport {
  version: string
  exportedAt: string
  project: Project
  stakeholders: Stakeholder[]
  assessments: Assessment[]
  assessmentResponses: AssessmentResponse[]
  roadmaps: Roadmap[]
  roadmapPhases: RoadmapPhase[]
  fourCornerData: FourCornerData[]
  documents: Document[]
}

/**
 * Export a complete project to JSON
 */
export async function exportProjectToJSON(projectId: number): Promise<Blob> {
  try {
    // Load all project data
    const project = await db.projects.get(projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    const [
      stakeholders,
      assessments,
      assessmentResponses,
      roadmaps,
      roadmapPhases,
      fourCornerData,
      documents,
    ] = await Promise.all([
      db.stakeholders.where('projectId').equals(projectId).toArray(),
      db.assessments.where('projectId').equals(projectId).toArray(),
      db.assessmentResponses.where('projectId').equals(projectId).toArray(),
      db.roadmaps.where('projectId').equals(projectId).toArray(),
      db.roadmapPhases.where('projectId').equals(projectId).toArray(),
      db.fourCornerData.where('projectId').equals(projectId).toArray(),
      db.documents.where('projectId').equals(projectId).toArray(),
    ])

    const exportData: ProjectExport = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      project,
      stakeholders,
      assessments,
      assessmentResponses,
      roadmaps,
      roadmapPhases,
      fourCornerData,
      documents,
    }

    const json = JSON.stringify(exportData, null, 2)
    return new Blob([json], { type: 'application/json' })
  } catch (error) {
    console.error('Error exporting project:', error)
    throw new Error('Failed to export project data')
  }
}

/**
 * Import a project from JSON
 */
export async function importProjectFromJSON(jsonContent: string): Promise<number> {
  try {
    const data: ProjectExport = JSON.parse(jsonContent)

    // Validate version
    if (!data.version) {
      throw new Error('Invalid export file: missing version')
    }

    // Validate required fields
    if (!data.project) {
      throw new Error('Invalid export file: missing project data')
    }

    // Start transaction
    return await db.transaction(
      'rw',
      db.projects,
      db.stakeholders,
      db.assessments,
      db.assessmentResponses,
      db.roadmaps,
      db.roadmapPhases,
      db.fourCornerData,
      db.documents,
      async () => {
        // Import project (remove old ID)
        const { id: _oldProjectId, ...projectData } = data.project
        const newProjectId = (await db.projects.add({
          ...projectData,
          createdAt: new Date(projectData.createdAt),
          updatedAt: new Date(),
        })) as number

        // Create ID mapping for foreign keys
        const assessmentIdMap = new Map<number, number>()
        const roadmapIdMap = new Map<number, number>()

        // Import stakeholders
        if (data.stakeholders && data.stakeholders.length > 0) {
          await db.stakeholders.bulkAdd(
            data.stakeholders.map((s) => {
              const { id: _oldId, ...stakeholderData } = s
              return {
                ...stakeholderData,
                projectId: newProjectId,
              }
            })
          )
        }

        // Import assessments and build ID map
        if (data.assessments && data.assessments.length > 0) {
          for (const assessment of data.assessments) {
            const { id: oldId, ...assessmentData } = assessment
            const newId = (await db.assessments.add({
              ...assessmentData,
              projectId: newProjectId,
              createdAt: new Date(assessmentData.createdAt),
              updatedAt: new Date(assessmentData.updatedAt),
              ...(assessmentData.completedAt && {
                completedAt: new Date(assessmentData.completedAt),
              }),
            })) as number
            if (oldId) {
              assessmentIdMap.set(oldId, newId)
            }
          }
        }

        // Import assessment responses with mapped IDs
        if (data.assessmentResponses && data.assessmentResponses.length > 0) {
          await db.assessmentResponses.bulkAdd(
            data.assessmentResponses.map((r) => {
              const { id: _oldId, ...responseData } = r
              const newAssessmentId = r.assessmentId
                ? assessmentIdMap.get(r.assessmentId) || r.assessmentId
                : undefined
              return {
                ...responseData,
                projectId: newProjectId,
                assessmentId: newAssessmentId,
                answeredAt: new Date(responseData.answeredAt),
                updatedAt: new Date(responseData.updatedAt),
              }
            })
          )
        }

        // Import roadmaps and build ID map
        if (data.roadmaps && data.roadmaps.length > 0) {
          for (const roadmap of data.roadmaps) {
            const { id: oldId, ...roadmapData } = roadmap
            const newId = (await db.roadmaps.add({
              ...roadmapData,
              projectId: newProjectId,
              startDate: roadmapData.startDate ? new Date(roadmapData.startDate) : undefined,
              endDate: roadmapData.endDate ? new Date(roadmapData.endDate) : undefined,
              createdAt: new Date(roadmapData.createdAt),
              updatedAt: new Date(roadmapData.updatedAt),
            })) as number
            if (oldId) {
              roadmapIdMap.set(oldId, newId)
            }
          }
        }

        // Import roadmap phases with mapped IDs
        if (data.roadmapPhases && data.roadmapPhases.length > 0) {
          await db.roadmapPhases.bulkAdd(
            data.roadmapPhases.map((p) => {
              const { id: _oldId, ...phaseData } = p
              const newRoadmapId = p.roadmapId
                ? roadmapIdMap.get(p.roadmapId) || p.roadmapId
                : undefined
              return {
                ...phaseData,
                projectId: newProjectId,
                roadmapId: newRoadmapId,
                createdAt: new Date(phaseData.createdAt),
                updatedAt: new Date(phaseData.updatedAt),
                ...(phaseData.completedAt && {
                  completedAt: new Date(phaseData.completedAt),
                }),
              }
            })
          )
        }

        // Import four-corner data
        if (data.fourCornerData && data.fourCornerData.length > 0) {
          await db.fourCornerData.bulkAdd(
            data.fourCornerData.map((f) => {
              const { id: _oldId, ...fourCornerItem } = f
              return {
                ...fourCornerItem,
                projectId: newProjectId,
                createdAt: new Date(fourCornerItem.createdAt),
                updatedAt: new Date(fourCornerItem.updatedAt),
              }
            })
          )
        }

        // Import documents
        if (data.documents && data.documents.length > 0) {
          await db.documents.bulkAdd(
            data.documents.map((d) => {
              const { id: _oldId, ...docData } = d
              return {
                ...docData,
                projectId: newProjectId,
                createdAt: new Date(docData.createdAt),
                ...(docData.updatedAt && { updatedAt: new Date(docData.updatedAt) }),
              }
            })
          )
        }

        return newProjectId
      }
    )
  } catch (error) {
    console.error('Error importing project:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to import project: ${error.message}`)
    }
    throw new Error('Failed to import project')
  }
}

/**
 * Export all data (entire database)
 */
export async function exportAllData(): Promise<Blob> {
  try {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      projects: await db.projects.toArray(),
      stakeholders: await db.stakeholders.toArray(),
      assessments: await db.assessments.toArray(),
      assessmentResponses: await db.assessmentResponses.toArray(),
      interviewQuestions: await db.interviewQuestions.toArray(),
      roadmaps: await db.roadmaps.toArray(),
      roadmapPhases: await db.roadmapPhases.toArray(),
      fourCornerData: await db.fourCornerData.toArray(),
      documents: await db.documents.toArray(),
      exports: await db.exports.toArray(),
    }

    const json = JSON.stringify(data, null, 2)
    return new Blob([json], { type: 'application/json' })
  } catch (error) {
    console.error('Error exporting all data:', error)
    throw new Error('Failed to export database')
  }
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
