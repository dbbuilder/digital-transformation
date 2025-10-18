// TypeScript types for the Digital Transformation Planning System

export type TransformationPath = 'AI_INCLUDED' | 'AI_FREE' | 'UNDECIDED'

export type Phase =
  | 'DISCOVERY'
  | 'FOUNDATION'
  | 'MODERNIZATION'
  | 'INTELLIGENCE'
  | 'OPTIMIZATION'

export type Tier = 'UI' | 'API' | 'DATA' | 'CLOUD' | 'AI'

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived'

export type AssessmentStatus = 'not_started' | 'in_progress' | 'completed'

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'

export type RoadmapPhaseStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'

export type FourCornerQuadrant =
  | 'FUTURE_UI'
  | 'CURRENT_UI'
  | 'FUTURE_DATA'
  | 'CURRENT_DATA'

// =====================================================
// CORE ENTITIES
// =====================================================

export interface Project {
  id?: number
  name: string
  description?: string
  transformationPath: TransformationPath
  currentPhase: Phase
  status: ProjectStatus
  startDate?: Date
  targetCompletionDate?: Date
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

// =====================================================
// TEAM & STAKEHOLDER MANAGEMENT
// =====================================================

export type InvolvementLevel =
  | 'RESPONSIBLE' // Person doing the work
  | 'ACCOUNTABLE' // Person accountable for the work (RACI)
  | 'CONSULTED' // People whose opinions are sought
  | 'INFORMED' // People who are kept informed
  | 'APPROVER' // Person who must approve before proceeding

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested'

export interface Team {
  id?: number
  projectId: number
  name: string
  description?: string
  parentTeamId?: number // For hierarchical teams
  leadStakeholderId?: number // Team lead
  responsibilities?: string[] // What this team is responsible for
  knowledgeAreas?: string[] // What this team knows about (UI, APIs, Data, etc.)
  approvalAuthority?: string[] // What this team can approve
  createdAt: Date
  updatedAt: Date
}

export interface Stakeholder {
  id?: number
  projectId: number
  name: string
  title: string // Job title (e.g., "Senior Frontend Developer")
  role: string // Project role (e.g., "Lead Developer", "Product Owner")
  teamId?: number // Primary team membership
  department?: string
  email?: string
  phone?: string
  reportsToId?: number // Manager/supervisor stakeholder ID

  // Knowledge & Expertise
  knowledgeAreas?: Tier[] // Which tiers they have expertise in
  specializations?: string[] // Specific technologies, processes, etc.

  // Responsibilities
  responsibilities?: string[] // What they're accountable for
  canApprove?: string[] // What they have authority to approve (e.g., ["UI designs", "API specs"])

  // Availability & Involvement
  involvementLevel?: InvolvementLevel // Default involvement level
  availabilityHours?: number // Hours per week available for project

  // Metadata
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// =====================================================
// ASSESSMENTS & INTERVIEWS
// =====================================================

export interface Assessment {
  id?: number
  projectId: number
  phase: Phase
  tier: Tier
  templateName?: string
  completionPercentage: number
  status: AssessmentStatus
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface AssessmentResponse {
  id?: number
  assessmentId: number
  projectId: number
  questionId: string
  questionText: string
  answer: any // Flexible: string, number, array, object
  priority?: Priority
  notes?: string
  evidenceUrls?: string[]
  answeredAt: Date
  updatedAt: Date

  // Stakeholder tracking
  answeredBy?: number // Stakeholder ID who provided the answer
  reviewedBy?: number[] // Stakeholder IDs who have reviewed
  approvedBy?: number // Stakeholder ID who approved this response
  approvalStatus?: ApprovalStatus
}

export interface InterviewQuestion {
  id: string
  phase: Phase
  track?: string
  tier: Tier
  question: string
  notes?: string
  priority: Priority
  aiReadiness?: string
  sourceFile?: string
}

// =====================================================
// ROADMAP
// =====================================================

export interface Roadmap {
  id?: number
  projectId: number
  totalWeeks: number
  startDate: Date
  endDate?: Date
  status: 'draft' | 'approved' | 'in_progress' | 'completed'
  createdAt: Date
  updatedAt: Date
}

export interface RoadmapPhase {
  id?: number
  roadmapId: number
  projectId: number
  phaseNumber: number
  name: string
  description?: string
  durationWeeks: number
  startWeek: number
  deliverables: string[]
  status: RoadmapPhaseStatus
  progressPercentage: number
  createdAt: Date
  updatedAt: Date
}

// =====================================================
// FOUR-CORNER FRAMEWORK
// =====================================================

export interface FourCornerData {
  id?: number
  projectId: number
  quadrant: FourCornerQuadrant
  tier: Tier
  content: {
    title?: string
    description?: string
    technologies?: string[]
    keyPoints?: string[]
    metrics?: Record<string, any>
  }
  version: number
  createdAt: Date
  updatedAt: Date
}

// =====================================================
// DOCUMENTS & EXPORTS
// =====================================================

export interface Document {
  id?: number
  projectId: number
  name: string
  description?: string
  fileType: string
  fileSize?: number
  category?: string
  tags?: string[]
  linkedEntityType?: string
  linkedEntityId?: number
  content?: Blob | string // For offline storage
  version: number
  createdAt: Date
  updatedAt: Date
}

export interface Export {
  id?: number
  projectId: number
  format: 'PDF' | 'EXCEL' | 'JSON' | 'CSV'
  content: Blob | string
  metadata?: Record<string, any>
  createdAt: Date
}

// =====================================================
// STAKEHOLDER ASSIGNMENTS & APPROVALS
// =====================================================

export interface QuestionStakeholderAssignment {
  id?: number
  projectId: number
  questionId: string
  phase: Phase
  tier: Tier

  // Who should be involved (RACI model)
  hasKnowledge?: number[] // Stakeholder IDs with expertise to answer
  responsible?: number[] // Stakeholder IDs responsible for answering
  accountable?: number // Stakeholder ID accountable for accuracy
  consulted?: number[] // Stakeholder IDs to consult
  informed?: number[] // Stakeholder IDs to keep informed
  mustApprove?: number[] // Stakeholder IDs whose approval is required

  createdAt: Date
  updatedAt: Date
}

export interface SOWSectionApproval {
  id?: number
  projectId: number
  assessmentId: number
  sectionName: string // e.g., "Executive Summary", "Current State Assessment"

  // Approval tracking
  approvalRequired: boolean
  requiredApprovers?: number[] // Stakeholder IDs
  approvals?: {
    stakeholderId: number
    status: ApprovalStatus
    comments?: string
    approvedAt?: Date
  }[]

  // Overall status
  status: ApprovalStatus
  finalizedAt?: Date
  finalizedBy?: number

  createdAt: Date
  updatedAt: Date
}

export interface SOWApprovalWorkflow {
  id?: number
  projectId: number
  assessmentId: number

  // Workflow definition
  workflowSteps?: {
    stepNumber: number
    stepName: string
    description: string
    requiredApprovers: number[] // Stakeholder IDs
    parallelApproval: boolean // true = all must approve, false = any can approve
    status: ApprovalStatus
  }[]

  // Overall workflow status
  currentStep: number
  overallStatus: 'not_started' | 'in_progress' | 'completed' | 'cancelled'
  startedAt?: Date
  completedAt?: Date

  createdAt: Date
  updatedAt: Date
}

// =====================================================
// UI STATE TYPES
// =====================================================

export interface AppState {
  currentProjectId: number | null
  activeTab: 'home' | 'projects' | 'about'
  sidebarOpen: boolean
  selectedPhase: Phase | null
  selectedTier: Tier | null
}

export interface ProjectFilters {
  searchTerm: string
  status: ProjectStatus | 'all'
  path: TransformationPath | 'all'
  phase: Phase | 'all'
}
