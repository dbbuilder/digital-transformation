// Approval Tracker - Shows approval status and allows approval actions

import { useState, useEffect } from 'react'
import { db } from '../../lib/database'
import {
  getSOWApprovalStatus,
  submitSectionApproval,
  getApprovalStatistics,
  getPendingApprovers,
  initializeSOWApprovals,
  autoAssignApprovers,
} from '../../services/ApprovalWorkflowService'
import type { SOWSectionApproval, Stakeholder, ApprovalStatus } from '../../types'

interface ApprovalTrackerProps {
  projectId: number
  assessmentId: number
  currentStakeholderId?: number // For simulating logged-in user
  onAllApproved?: () => void
}

export function ApprovalTracker({
  projectId,
  assessmentId,
  currentStakeholderId,
  onAllApproved,
}: ApprovalTrackerProps) {
  const [approvals, setApprovals] = useState<SOWSectionApproval[]>([])
  const [stats, setStats] = useState<any>(null)
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([])
  const [loading, setLoading] = useState(true)
  const [showApprovalModal, setShowApprovalModal] = useState<{
    approval: SOWSectionApproval
    action: 'approve' | 'reject' | 'request-changes'
  } | null>(null)

  useEffect(() => {
    loadApprovals()
  }, [projectId, assessmentId])

  async function loadApprovals() {
    setLoading(true)
    try {
      // Check if approvals exist, if not initialize them
      let approvalsData = await getSOWApprovalStatus(projectId, assessmentId)

      if (approvalsData.length === 0) {
        await initializeSOWApprovals(projectId, assessmentId)
        await autoAssignApprovers(projectId, assessmentId)
        approvalsData = await getSOWApprovalStatus(projectId, assessmentId)
      }

      const statsData = await getApprovalStatistics(projectId, assessmentId)
      const stakeholdersData = await db.stakeholders.where('projectId').equals(projectId).toArray()

      setApprovals(approvalsData)
      setStats(statsData)
      setStakeholders(stakeholdersData)

      // Check if all approved
      if (statsData.completionPercentage === 100 && onAllApproved) {
        onAllApproved()
      }
    } catch (error) {
      console.error('Error loading approvals:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApproval(
    approval: SOWSectionApproval,
    status: ApprovalStatus,
    comments?: string
  ) {
    if (!approval.id || !currentStakeholderId) return

    await submitSectionApproval(approval.id, currentStakeholderId, status, comments)
    await loadApprovals()
    setShowApprovalModal(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-neutral-500">Loading approval status...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-purple-900 text-lg">SOW Approval Progress</h3>
            <p className="text-sm text-purple-700">
              {stats.approved} of {stats.totalSections} sections approved
            </p>
          </div>
          <div className="text-3xl font-bold text-purple-700">
            {stats.completionPercentage}%
          </div>
        </div>

        <div className="w-full bg-purple-200 rounded-full h-4 overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
            <div className="text-xs text-green-600">Approved</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
            <div className="text-xs text-yellow-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-orange-200">
            <div className="text-2xl font-bold text-orange-700">{stats.changesRequested}</div>
            <div className="text-xs text-orange-600">Changes Requested</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-red-200">
            <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
            <div className="text-xs text-red-600">Rejected</div>
          </div>
        </div>
      </div>

      {/* Section Approvals */}
      <div className="space-y-3">
        {approvals.map(approval => (
          <ApprovalCard
            key={approval.id}
            approval={approval}
            stakeholders={stakeholders}
            currentStakeholderId={currentStakeholderId}
            onApprove={(action) => setShowApprovalModal({ approval, action })}
          />
        ))}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <ApprovalModal
          approval={showApprovalModal.approval}
          action={showApprovalModal.action}
          stakeholders={stakeholders}
          onSubmit={(comments) => {
            const status =
              showApprovalModal.action === 'approve' ? 'approved' :
              showApprovalModal.action === 'reject' ? 'rejected' :
              'changes_requested'
            handleApproval(showApprovalModal.approval, status, comments)
          }}
          onCancel={() => setShowApprovalModal(null)}
        />
      )}
    </div>
  )
}

interface ApprovalCardProps {
  approval: SOWSectionApproval
  stakeholders: Stakeholder[]
  currentStakeholderId?: number
  onApprove: (action: 'approve' | 'reject' | 'request-changes') => void
}

function ApprovalCard({ approval, stakeholders, currentStakeholderId, onApprove }: ApprovalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const statusConfig = {
    approved: {
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-900',
      badge: 'bg-green-100 text-green-800 border-green-400',
      icon: '✅',
    },
    pending: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-900',
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-400',
      icon: '⏳',
    },
    changes_requested: {
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      text: 'text-orange-900',
      badge: 'bg-orange-100 text-orange-800 border-orange-400',
      icon: '🔄',
    },
    rejected: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-900',
      badge: 'bg-red-100 text-red-800 border-red-400',
      icon: '❌',
    },
  }

  const config = statusConfig[approval.status]

  const requiredApprovers = stakeholders.filter(s => approval.requiredApprovers?.includes(s.id!))
  const approvedStakeholders = approval.approvals
    ?.filter(a => a.status === 'approved')
    .map(a => stakeholders.find(s => s.id === a.stakeholderId))
    .filter(Boolean) as Stakeholder[]

  const pendingApprovers = requiredApprovers.filter(
    s => !approval.approvals?.some(a => a.stakeholderId === s.id && a.status === 'approved')
  )

  const currentUserNeedsToApprove = currentStakeholderId && pendingApprovers.some(s => s.id === currentStakeholderId)

  return (
    <div className={`card ${config.bg} border-2 ${config.border}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h4 className={`font-bold ${config.text}`}>{approval.sectionName}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${config.badge}`}>
                {approval.status.replace('_', ' ').toUpperCase()}
              </span>
              {approval.approvalRequired && (
                <span className="text-xs px-2 py-0.5 rounded-full border bg-purple-100 text-purple-800 border-purple-400">
                  APPROVAL REQUIRED
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`text-sm font-medium ${config.text}`}
        >
          {isExpanded ? '▲ Collapse' : '▼ Expand'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Required Approvers */}
          {requiredApprovers.length > 0 && (
            <div className="bg-white rounded-lg p-3 border-2 border-neutral-200">
              <h5 className="text-sm font-semibold text-neutral-900 mb-2">Required Approvers</h5>
              <div className="space-y-2">
                {requiredApprovers.map(approver => {
                  const approverStatus = approval.approvals?.find(a => a.stakeholderId === approver.id)
                  return (
                    <div key={approver.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xs">
                          {approver.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900">{approver.name}</div>
                          <div className="text-xs text-neutral-600">{approver.title}</div>
                        </div>
                      </div>
                      {approverStatus ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          approverStatus.status === 'approved' ? 'bg-green-100 text-green-800 border-green-400' :
                          approverStatus.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-400' :
                          'bg-orange-100 text-orange-800 border-orange-400'
                        }`}>
                          {approverStatus.status === 'approved' ? '✅ Approved' :
                           approverStatus.status === 'rejected' ? '❌ Rejected' :
                           '🔄 Changes Requested'}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-500">⏳ Pending</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Approval History */}
          {approval.approvals && approval.approvals.length > 0 && (
            <div className="bg-white rounded-lg p-3 border-2 border-neutral-200">
              <h5 className="text-sm font-semibold text-neutral-900 mb-2">Approval History</h5>
              <div className="space-y-2">
                {approval.approvals.map((approvalRecord, idx) => {
                  const stakeholder = stakeholders.find(s => s.id === approvalRecord.stakeholderId)
                  if (!stakeholder) return null

                  return (
                    <div key={idx} className="text-sm bg-neutral-50 p-2 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-neutral-900">{stakeholder.name}</span>
                        <span className="text-xs text-neutral-500">
                          {approvalRecord.approvedAt && new Date(approvalRecord.approvedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-600">
                        <span className={
                          approvalRecord.status === 'approved' ? 'text-green-700' :
                          approvalRecord.status === 'rejected' ? 'text-red-700' :
                          'text-orange-700'
                        }>
                          {approvalRecord.status === 'approved' ? '✅ Approved' :
                           approvalRecord.status === 'rejected' ? '❌ Rejected' :
                           '🔄 Requested Changes'}
                        </span>
                        {approvalRecord.comments && (
                          <div className="mt-1 italic">"{approvalRecord.comments}"</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Action Buttons (if current user needs to approve) */}
          {currentUserNeedsToApprove && approval.status !== 'approved' && (
            <div className="flex gap-2 pt-2 border-t">
              <button
                onClick={() => onApprove('approve')}
                className="flex-1 btn-primary bg-green-600 hover:bg-green-700"
              >
                ✅ Approve
              </button>
              <button
                onClick={() => onApprove('request-changes')}
                className="flex-1 btn-secondary bg-orange-100 hover:bg-orange-200 text-orange-800"
              >
                🔄 Request Changes
              </button>
              <button
                onClick={() => onApprove('reject')}
                className="flex-1 btn-secondary bg-red-100 hover:bg-red-200 text-red-800"
              >
                ❌ Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ApprovalModalProps {
  approval: SOWSectionApproval
  action: 'approve' | 'reject' | 'request-changes'
  stakeholders: Stakeholder[]
  onSubmit: (comments: string) => void
  onCancel: () => void
}

function ApprovalModal({ approval, action, stakeholders, onSubmit, onCancel }: ApprovalModalProps) {
  const [comments, setComments] = useState('')

  const actionConfig = {
    approve: {
      title: 'Approve Section',
      color: 'green',
      icon: '✅',
      placeholder: 'Optional: Add approval comments...',
    },
    reject: {
      title: 'Reject Section',
      color: 'red',
      icon: '❌',
      placeholder: 'Required: Explain why you are rejecting this section...',
    },
    'request-changes': {
      title: 'Request Changes',
      color: 'orange',
      icon: '🔄',
      placeholder: 'Required: Specify what changes are needed...',
    },
  }

  const config = actionConfig[action]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h3 className="text-xl font-bold text-neutral-900">{config.title}</h3>
            <p className="text-sm text-neutral-600">{approval.sectionName}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Comments {action !== 'approve' && <span className="text-red-600">*</span>}
          </label>
          <textarea
            className="input"
            rows={4}
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder={config.placeholder}
            required={action !== 'approve'}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => onSubmit(comments)}
            disabled={action !== 'approve' && !comments.trim()}
            className={`btn-primary bg-${config.color}-600 hover:bg-${config.color}-700 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {config.icon} Confirm {action === 'approve' ? 'Approval' : action === 'reject' ? 'Rejection' : 'Request'}
          </button>
        </div>
      </div>
    </div>
  )
}
