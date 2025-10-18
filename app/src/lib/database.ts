// Dexie.js Database for Offline-First Digital Transformation Planning

import Dexie, { type Table } from 'dexie'
import type {
  Project,
  Team,
  Stakeholder,
  Assessment,
  AssessmentResponse,
  InterviewQuestion,
  Roadmap,
  RoadmapPhase,
  FourCornerData,
  Document,
  Export,
  QuestionStakeholderAssignment,
  SOWSectionApproval,
  SOWApprovalWorkflow,
} from '../types'

export class TransformationDB extends Dexie {
  // Tables
  projects!: Table<Project, number>
  teams!: Table<Team, number>
  stakeholders!: Table<Stakeholder, number>
  assessments!: Table<Assessment, number>
  assessmentResponses!: Table<AssessmentResponse, number>
  interviewQuestions!: Table<InterviewQuestion, string>
  roadmaps!: Table<Roadmap, number>
  roadmapPhases!: Table<RoadmapPhase, number>
  fourCornerData!: Table<FourCornerData, number>
  documents!: Table<Document, number>
  exports!: Table<Export, number>
  questionStakeholderAssignments!: Table<QuestionStakeholderAssignment, number>
  sowSectionApprovals!: Table<SOWSectionApproval, number>
  sowApprovalWorkflows!: Table<SOWApprovalWorkflow, number>

  constructor() {
    super('TransformationDB')

    // Version 1: Original schema
    this.version(1).stores({
      // Projects: Main entity
      projects: '++id, name, transformationPath, currentPhase, status, createdAt, updatedAt',

      // Stakeholders: People involved in projects
      stakeholders: '++id, projectId, name, role',

      // Assessments: Interview templates per phase/tier
      assessments: '++id, projectId, phase, tier, status, completionPercentage',

      // Assessment Responses: User answers (flexible JSONB-like)
      assessmentResponses: '++id, assessmentId, projectId, questionId, answeredAt',

      // Interview Questions: Library of questions from CSV templates
      interviewQuestions: 'id, phase, tier, priority',

      // Roadmaps: 32-week transformation plans
      roadmaps: '++id, projectId, status, startDate',

      // Roadmap Phases: 12 phases with deliverables
      roadmapPhases: '++id, roadmapId, projectId, phaseNumber, status',

      // Four-Corner Framework: Current/Future state data
      fourCornerData: '++id, projectId, quadrant, tier, version',

      // Documents: File storage metadata
      documents: '++id, projectId, name, category, createdAt',

      // Exports: Generated reports
      exports: '++id, projectId, format, createdAt',
    })

    // Version 2: Add team management and approval workflows
    this.version(2).stores({
      // Existing tables (maintain indexes)
      projects: '++id, name, transformationPath, currentPhase, status, createdAt, updatedAt',
      stakeholders: '++id, projectId, teamId, name, role, reportsToId',
      assessments: '++id, projectId, phase, tier, status, completionPercentage',
      assessmentResponses: '++id, assessmentId, projectId, questionId, answeredBy, approvalStatus, answeredAt',
      interviewQuestions: 'id, phase, tier, priority',
      roadmaps: '++id, projectId, status, startDate',
      roadmapPhases: '++id, roadmapId, projectId, phaseNumber, status',
      fourCornerData: '++id, projectId, quadrant, tier, version',
      documents: '++id, projectId, name, category, createdAt',
      exports: '++id, projectId, format, createdAt',

      // New tables for team management
      teams: '++id, projectId, name, parentTeamId, leadStakeholderId',

      // New tables for stakeholder assignments and approvals
      questionStakeholderAssignments: '++id, projectId, questionId, phase, tier',
      sowSectionApprovals: '++id, projectId, assessmentId, sectionName, status',
      sowApprovalWorkflows: '++id, projectId, assessmentId, overallStatus',
    }).upgrade(tx => {
      // Migration: Update existing stakeholders to have new fields
      return tx.table('stakeholders').toCollection().modify(stakeholder => {
        if (!stakeholder.title) stakeholder.title = stakeholder.role
        if (!stakeholder.createdAt) stakeholder.createdAt = new Date()
        if (!stakeholder.updatedAt) stakeholder.updatedAt = new Date()
      })
    })
  }
}

// Create single instance
export const db = new TransformationDB()

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Initialize with sample data (first run)
export async function initializeDatabase() {
  const projectCount = await db.projects.count()

  if (projectCount === 0) {
    console.log('🗄️ Initializing database with sample data...')

    // Create sample project
    const projectId = await db.projects.add({
      name: 'Sample Transformation Project',
      description: 'A demo project to explore the planning system',
      transformationPath: 'UNDECIDED',
      currentPhase: 'DISCOVERY',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Add sample stakeholders
    await db.stakeholders.bulkAdd([
      {
        projectId,
        name: 'John Smith',
        role: 'CTO',
        department: 'Technology',
        email: 'john.smith@example.com',
      },
      {
        projectId,
        name: 'Jane Doe',
        role: 'Product Manager',
        department: 'Product',
        email: 'jane.doe@example.com',
      },
    ])

    // Load comprehensive interview questions from CSV files
    const { seedInterviewQuestions } = await import('./csvImporter')
    await seedInterviewQuestions()

    console.log('✅ Database initialized with sample project and interview questions')
  }
}

// Get project with related data
export async function getProjectWithDetails(projectId: number) {
  const project = await db.projects.get(projectId)
  if (!project) return null

  const [stakeholders, assessments, roadmap] = await Promise.all([
    db.stakeholders.where('projectId').equals(projectId).toArray(),
    db.assessments.where('projectId').equals(projectId).toArray(),
    db.roadmaps.where('projectId').equals(projectId).first(),
  ])

  return {
    ...project,
    stakeholders,
    assessments,
    roadmap,
  }
}

// Calculate project progress
export async function calculateProjectProgress(projectId: number) {
  const assessments = await db.assessments.where('projectId').equals(projectId).toArray()

  if (assessments.length === 0) return 0

  const totalCompletion = assessments.reduce((sum, a) => sum + a.completionPercentage, 0)
  return Math.round(totalCompletion / assessments.length)
}

// Search projects
export async function searchProjects(searchTerm: string) {
  const allProjects = await db.projects.toArray()

  if (!searchTerm.trim()) return allProjects

  const term = searchTerm.toLowerCase()

  return allProjects.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term)
  )
}

// Reload interview questions from CSV files
export async function reloadInterviewQuestions() {
  console.log('🔄 Reloading interview questions from CSV files...')

  // Clear existing questions
  await db.interviewQuestions.clear()

  // Reload from CSV files
  const { seedInterviewQuestions } = await import('./csvImporter')
  await seedInterviewQuestions()

  // Get count
  const count = await db.interviewQuestions.count()

  console.log(`✅ Reloaded ${count} interview questions`)
  return count
}

// Export all data for migration
export async function exportAllData() {
  const data = {
    projects: await db.projects.toArray(),
    stakeholders: await db.stakeholders.toArray(),
    assessments: await db.assessments.toArray(),
    assessmentResponses: await db.assessmentResponses.toArray(),
    roadmaps: await db.roadmaps.toArray(),
    roadmapPhases: await db.roadmapPhases.toArray(),
    fourCornerData: await db.fourCornerData.toArray(),
    documents: await db.documents.toArray(),
    exportedAt: new Date().toISOString(),
  }

  return data
}

// Import data (for migration from export)
export async function importData(data: any) {
  await db.transaction('rw', db.projects, db.stakeholders, db.assessments, async () => {
    if (data.projects) await db.projects.bulkAdd(data.projects)
    if (data.stakeholders) await db.stakeholders.bulkAdd(data.stakeholders)
    if (data.assessments) await db.assessments.bulkAdd(data.assessments)
    // ... import other tables
  })

  console.log('✅ Data imported successfully')
}

// Clear all data (for testing)
export async function clearAllData() {
  await db.transaction('rw', db.projects, db.stakeholders, db.assessments, async () => {
    await db.projects.clear()
    await db.stakeholders.clear()
    await db.assessments.clear()
    await db.assessmentResponses.clear()
    await db.roadmaps.clear()
    await db.roadmapPhases.clear()
    await db.fourCornerData.clear()
    await db.documents.clear()
    await db.exports.clear()
  })

  console.log('🗑️ All data cleared')
}
