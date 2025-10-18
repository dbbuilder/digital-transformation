// Approval Workflow Service - Manage SOW section approvals and workflows

import { db } from '../lib/database'
import { suggestApproversForQuestion } from './StakeholderSuggestionService'
import type { SOWSectionApproval, SOWApprovalWorkflow, Stakeholder, Assessment, ApprovalStatus } from '../types'

/**
 * Initialize approval tracking for a SOW
 */
export async function initializeSOWApprovals(
  projectId: number,
  assessmentId: number
): Promise<void> {
  // Define standard SOW sections and their approval requirements
  const sections = [
    {
      name: 'Executive Summary',
      approvalRequired: true,
      requiredRoles: ['CTO', 'CEO', 'Director', 'VP', 'Product Owner'],
    },
    {
      name: 'Current State Assessment',
      approvalRequired: true,
      requiredRoles: ['Tech Lead', 'Architect', 'Engineering Manager'],
    },
    {
      name: 'Business Drivers',
      approvalRequired: true,
      requiredRoles: ['CFO', 'Product Owner', 'Business Analyst', 'Director'],
    },
    {
      name: 'Proposed Solution',
      approvalRequired: true,
      requiredRoles: ['CTO', 'Architect', 'Tech Lead'],
    },
    {
      name: 'Scope and Deliverables',
      approvalRequired: true,
      requiredRoles: ['Project Manager', 'Tech Lead', 'Product Owner'],
    },
    {
      name: 'Success Criteria',
      approvalRequired: true,
      requiredRoles: ['Product Owner', 'Stakeholder', 'Business Analyst'],
    },
    {
      name: 'Timeline',
      approvalRequired: true,
      requiredRoles: ['Project Manager', 'CTO', 'Tech Lead'],
    },
    {
      name: 'Assumptions and Constraints',
      approvalRequired: false,
      requiredRoles: ['Project Manager', 'Legal', 'Compliance'],
    },
  ]

  // Get all stakeholders for this project
  const stakeholders = await db.stakeholders.where('projectId').equals(projectId).toArray()

  // Create approval records for each section
  for (const section of sections) {
    // Find stakeholders whose roles/titles match required roles
    const requiredApprovers = stakeholders
      .filter(s =>
        section.requiredRoles.some(role =>
          s.role.toLowerCase().includes(role.toLowerCase()) ||
          s.title.toLowerCase().includes(role.toLowerCase())
        )
      )
      .map(s => s.id!)
      .filter(Boolean)

    // Check if approval already exists
    const existing = await db.sowSectionApprovals
      .where('[projectId+assessmentId+sectionName]')
      .equals([projectId, assessmentId, section.name])
      .first()

    if (!existing) {
      await db.sowSectionApprovals.add({
        projectId,
        assessmentId,
        sectionName: section.name,
        approvalRequired: section.approvalRequired,
        requiredApprovers,
        approvals: [],
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  }
}

/**
 * Get approval status for all SOW sections
 */
export async function getSOWApprovalStatus(
  projectId: number,
  assessmentId: number
): Promise<SOWSectionApproval[]> {
  return await db.sowSectionApprovals
    .where('[projectId+assessmentId]')
    .equals([projectId, assessmentId])
    .toArray()
}

/**
 * Submit approval for a SOW section
 */
export async function submitSectionApproval(
  sectionApprovalId: number,
  stakeholderId: number,
  status: ApprovalStatus,
  comments?: string
): Promise<void> {
  const sectionApproval = await db.sowSectionApprovals.get(sectionApprovalId)
  if (!sectionApproval) throw new Error('Section approval not found')

  // Update or add approval
  const existingApprovalIndex = sectionApproval.approvals?.findIndex(a => a.stakeholderId === stakeholderId) ?? -1

  const newApproval = {
    stakeholderId,
    status,
    comments,
    approvedAt: new Date(),
  }

  let approvals = sectionApproval.approvals || []
  if (existingApprovalIndex >= 0) {
    approvals[existingApprovalIndex] = newApproval
  } else {
    approvals.push(newApproval)
  }

  // Determine overall status
  const hasRejection = approvals.some(a => a.status === 'rejected')
  const hasChangesRequested = approvals.some(a => a.status === 'changes_requested')
  const allApproved = sectionApproval.requiredApprovers?.every(approverId =>
    approvals.some(a => a.stakeholderId === approverId && a.status === 'approved')
  )

  let overallStatus: ApprovalStatus = 'pending'
  if (hasRejection) {
    overallStatus = 'rejected'
  } else if (hasChangesRequested) {
    overallStatus = 'changes_requested'
  } else if (allApproved) {
    overallStatus = 'approved'
  }

  await db.sowSectionApprovals.update(sectionApprovalId, {
    approvals,
    status: overallStatus,
    updatedAt: new Date(),
    ...(overallStatus === 'approved' && {
      finalizedAt: new Date(),
      finalizedBy: stakeholderId,
    }),
  })
}

/**
 * Check if SOW is ready for final approval
 */
export async function isSOWReadyForFinalApproval(
  projectId: number,
  assessmentId: number
): Promise<{ ready: boolean; pendingSections: string[] }> {
  const approvals = await getSOWApprovalStatus(projectId, assessmentId)

  const pendingSections = approvals
    .filter(a => a.approvalRequired && a.status !== 'approved')
    .map(a => a.sectionName)

  return {
    ready: pendingSections.length === 0,
    pendingSections,
  }
}

/**
 * Get stakeholders who need to approve
 */
export async function getPendingApprovers(
  projectId: number,
  assessmentId: number
): Promise<Map<string, Stakeholder[]>> {
  const approvals = await getSOWApprovalStatus(projectId, assessmentId)
  const stakeholders = await db.stakeholders.where('projectId').equals(projectId).toArray()

  const pendingBySection = new Map<string, Stakeholder[]>()

  for (const approval of approvals) {
    if (approval.status === 'approved' || !approval.requiredApprovers) continue

    const approvedStakeholderIds = approval.approvals
      ?.filter(a => a.status === 'approved')
      .map(a => a.stakeholderId) || []

    const pendingApproverIds = approval.requiredApprovers.filter(
      id => !approvedStakeholderIds.includes(id)
    )

    const pendingStakeholders = stakeholders.filter(s => pendingApproverIds.includes(s.id!))

    if (pendingStakeholders.length > 0) {
      pendingBySection.set(approval.sectionName, pendingStakeholders)
    }
  }

  return pendingBySection
}

/**
 * Create a multi-step approval workflow
 */
export async function createApprovalWorkflow(
  projectId: number,
  assessmentId: number,
  steps: {
    stepName: string
    description: string
    requiredApprovers: number[]
    parallelApproval: boolean
  }[]
): Promise<number> {
  const workflowId = await db.sowApprovalWorkflows.add({
    projectId,
    assessmentId,
    workflowSteps: steps.map((step, index) => ({
      stepNumber: index + 1,
      stepName: step.stepName,
      description: step.description,
      requiredApprovers: step.requiredApprovers,
      parallelApproval: step.parallelApproval,
      status: 'pending',
    })),
    currentStep: 1,
    overallStatus: 'not_started',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return workflowId
}

/**
 * Advance workflow to next step
 */
export async function advanceWorkflowStep(
  workflowId: number
): Promise<void> {
  const workflow = await db.sowApprovalWorkflows.get(workflowId)
  if (!workflow || !workflow.workflowSteps) return

  const currentStep = workflow.workflowSteps[workflow.currentStep - 1]
  if (!currentStep) return

  // Mark current step as completed
  currentStep.status = 'approved'

  // Move to next step
  const nextStep = workflow.currentStep + 1

  if (nextStep > workflow.workflowSteps.length) {
    // Workflow complete
    await db.sowApprovalWorkflows.update(workflowId, {
      overallStatus: 'completed',
      completedAt: new Date(),
      updatedAt: new Date(),
    })
  } else {
    // Move to next step
    await db.sowApprovalWorkflows.update(workflowId, {
      currentStep: nextStep,
      overallStatus: 'in_progress',
      workflowSteps: workflow.workflowSteps,
      updatedAt: new Date(),
    })
  }
}

/**
 * Get approval statistics
 */
export async function getApprovalStatistics(
  projectId: number,
  assessmentId: number
): Promise<{
  totalSections: number
  approved: number
  pending: number
  rejected: number
  changesRequested: number
  completionPercentage: number
}> {
  const approvals = await getSOWApprovalStatus(projectId, assessmentId)

  const stats = {
    totalSections: approvals.length,
    approved: approvals.filter(a => a.status === 'approved').length,
    pending: approvals.filter(a => a.status === 'pending').length,
    rejected: approvals.filter(a => a.status === 'rejected').length,
    changesRequested: approvals.filter(a => a.status === 'changes_requested').length,
    completionPercentage: 0,
  }

  const requiredApprovals = approvals.filter(a => a.approvalRequired)
  if (requiredApprovals.length > 0) {
    const approvedRequired = requiredApprovals.filter(a => a.status === 'approved').length
    stats.completionPercentage = Math.round((approvedRequired / requiredApprovals.length) * 100)
  }

  return stats
}

/**
 * Auto-assign approvers based on stakeholder profiles
 */
export async function autoAssignApprovers(
  projectId: number,
  assessmentId: number
): Promise<void> {
  const assessment = await db.assessments.get(assessmentId)
  if (!assessment) return

  const stakeholders = await db.stakeholders.where('projectId').equals(projectId).toArray()
  const approvals = await getSOWApprovalStatus(projectId, assessmentId)

  for (const approval of approvals) {
    // Find stakeholders who can approve this section
    const sectionApprovers = stakeholders.filter(s => {
      if (!s.canApprove || s.canApprove.length === 0) return false

      // Check if their approval authority matches this section
      return s.canApprove.some(auth =>
        approval.sectionName.toLowerCase().includes(auth.toLowerCase()) ||
        auth.toLowerCase().includes('sow') ||
        auth.toLowerCase().includes('executive')
      )
    })

    // Also include people with APPROVER role
    const roleApprovers = stakeholders.filter(s => s.involvementLevel === 'APPROVER')

    // Combine and deduplicate
    const allApprovers = [...new Set([...sectionApprovers, ...roleApprovers])]
      .map(s => s.id!)
      .filter(Boolean)

    if (allApprovers.length > 0 && approval.id) {
      await db.sowSectionApprovals.update(approval.id, {
        requiredApprovers: allApprovers,
        updatedAt: new Date(),
      })
    }
  }
}
