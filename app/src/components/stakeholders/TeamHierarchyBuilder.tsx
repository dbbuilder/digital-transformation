// Team Hierarchy Builder - Define organizational structure and stakeholder roles

import { useState, useEffect } from 'react'
import { db } from '../../lib/database'
import type { Team, Stakeholder, Tier, InvolvementLevel } from '../../types'

interface TeamHierarchyBuilderProps {
  projectId: number
}

export function TeamHierarchyBuilder({ projectId }: TeamHierarchyBuilderProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([])
  const [viewMode, setViewMode] = useState<'teams' | 'stakeholders' | 'hierarchy'>('teams')
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null)
  const [showAddTeamModal, setShowAddTeamModal] = useState(false)
  const [showAddStakeholderModal, setShowAddStakeholderModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [projectId])

  async function loadData() {
    const [teamsData, stakeholdersData] = await Promise.all([
      db.teams.where('projectId').equals(projectId).toArray(),
      db.stakeholders.where('projectId').equals(projectId).toArray(),
    ])
    setTeams(teamsData)
    setStakeholders(stakeholdersData)
  }

  async function deleteTeam(teamId: number) {
    if (!confirm('Delete this team? Stakeholders will remain but lose team assignment.')) return
    await db.teams.delete(teamId)
    // Update stakeholders who were in this team
    await db.stakeholders.where('teamId').equals(teamId).modify({ teamId: undefined })
    await loadData()
  }

  async function deleteStakeholder(stakeholderId: number) {
    if (!confirm('Delete this stakeholder? This cannot be undone.')) return
    await db.stakeholders.delete(stakeholderId)
    await loadData()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Team & Stakeholder Management</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Define who knows what, who's responsible, and who approves
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddTeamModal(true)} className="btn-secondary">
            + Add Team
          </button>
          <button onClick={() => setShowAddStakeholderModal(true)} className="btn-primary">
            + Add Stakeholder
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 border-b border-neutral-200">
        <button
          onClick={() => setViewMode('teams')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            viewMode === 'teams'
              ? 'border-primary-500 text-primary-700'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          👥 Teams ({teams.length})
        </button>
        <button
          onClick={() => setViewMode('stakeholders')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            viewMode === 'stakeholders'
              ? 'border-primary-500 text-primary-700'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          👤 Stakeholders ({stakeholders.length})
        </button>
        <button
          onClick={() => setViewMode('hierarchy')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            viewMode === 'hierarchy'
              ? 'border-primary-500 text-primary-700'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          🏢 Org Chart
        </button>
      </div>

      {/* Teams View */}
      {viewMode === 'teams' && (
        <div className="grid md:grid-cols-2 gap-4">
          {teams.length === 0 ? (
            <div className="col-span-2 card text-center py-12">
              <p className="text-neutral-600">No teams defined yet</p>
              <button onClick={() => setShowAddTeamModal(true)} className="btn-primary mt-4">
                Create First Team
              </button>
            </div>
          ) : (
            teams.map(team => (
              <TeamCard
                key={team.id}
                team={team}
                stakeholders={stakeholders.filter(s => s.teamId === team.id)}
                allStakeholders={stakeholders}
                onEdit={() => setSelectedTeam(team)}
                onDelete={() => team.id && deleteTeam(team.id)}
              />
            ))
          )}
        </div>
      )}

      {/* Stakeholders View */}
      {viewMode === 'stakeholders' && (
        <div className="space-y-4">
          {stakeholders.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-neutral-600">No stakeholders defined yet</p>
              <button onClick={() => setShowAddStakeholderModal(true)} className="btn-primary mt-4">
                Add First Stakeholder
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stakeholders.map(stakeholder => (
                <StakeholderCard
                  key={stakeholder.id}
                  stakeholder={stakeholder}
                  team={teams.find(t => t.id === stakeholder.teamId)}
                  manager={stakeholders.find(s => s.id === stakeholder.reportsToId)}
                  onEdit={() => setSelectedStakeholder(stakeholder)}
                  onDelete={() => stakeholder.id && deleteStakeholder(stakeholder.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hierarchy View */}
      {viewMode === 'hierarchy' && (
        <OrganizationChart teams={teams} stakeholders={stakeholders} />
      )}

      {/* Add Team Modal */}
      {showAddTeamModal && (
        <AddTeamModal
          projectId={projectId}
          teams={teams}
          stakeholders={stakeholders}
          onClose={() => setShowAddTeamModal(false)}
          onSave={async () => {
            setShowAddTeamModal(false)
            await loadData()
          }}
        />
      )}

      {/* Add Stakeholder Modal */}
      {showAddStakeholderModal && (
        <AddStakeholderModal
          projectId={projectId}
          teams={teams}
          stakeholders={stakeholders}
          onClose={() => setShowAddStakeholderModal(false)}
          onSave={async () => {
            setShowAddStakeholderModal(false)
            await loadData()
          }}
        />
      )}

      {/* Edit Team Modal */}
      {selectedTeam && (
        <EditTeamModal
          team={selectedTeam}
          teams={teams}
          stakeholders={stakeholders}
          onClose={() => setSelectedTeam(null)}
          onSave={async () => {
            setSelectedTeam(null)
            await loadData()
          }}
        />
      )}

      {/* Edit Stakeholder Modal */}
      {selectedStakeholder && (
        <EditStakeholderModal
          stakeholder={selectedStakeholder}
          teams={teams}
          stakeholders={stakeholders}
          onClose={() => setSelectedStakeholder(null)}
          onSave={async () => {
            setSelectedStakeholder(null)
            await loadData()
          }}
        />
      )}
    </div>
  )
}

// Team Card Component
interface TeamCardProps {
  team: Team
  stakeholders: Stakeholder[]
  allStakeholders: Stakeholder[]
  onEdit: () => void
  onDelete: () => void
}

function TeamCard({ team, stakeholders, allStakeholders, onEdit, onDelete }: TeamCardProps) {
  const teamLead = allStakeholders.find(s => s.id === team.leadStakeholderId)

  return (
    <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-blue-900 text-lg">{team.name}</h3>
          {team.description && (
            <p className="text-sm text-blue-700 mt-1">{team.description}</p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="text-blue-700 hover:text-blue-900 p-1"
            title="Edit team"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete team"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Team Lead */}
      {teamLead && (
        <div className="mb-3 bg-white rounded px-3 py-2 border border-blue-200">
          <div className="text-xs text-blue-700 font-medium">Team Lead</div>
          <div className="text-sm font-semibold text-blue-900">{teamLead.name}</div>
          <div className="text-xs text-blue-600">{teamLead.title}</div>
        </div>
      )}

      {/* Team Members */}
      <div className="mb-3">
        <div className="text-xs font-medium text-blue-800 mb-1">Members ({stakeholders.length})</div>
        <div className="flex flex-wrap gap-1">
          {stakeholders.slice(0, 5).map(s => (
            <span key={s.id} className="text-xs bg-white text-blue-800 px-2 py-1 rounded border border-blue-200">
              {s.name}
            </span>
          ))}
          {stakeholders.length > 5 && (
            <span className="text-xs text-blue-700">+{stakeholders.length - 5} more</span>
          )}
        </div>
      </div>

      {/* Knowledge Areas */}
      {team.knowledgeAreas && team.knowledgeAreas.length > 0 && (
        <div className="mb-2">
          <div className="text-xs font-medium text-blue-800 mb-1">Knowledge Areas</div>
          <div className="flex flex-wrap gap-1">
            {team.knowledgeAreas.map((area, idx) => (
              <span key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Approval Authority */}
      {team.approvalAuthority && team.approvalAuthority.length > 0 && (
        <div>
          <div className="text-xs font-medium text-blue-800 mb-1">Can Approve</div>
          <div className="flex flex-wrap gap-1">
            {team.approvalAuthority.map((auth, idx) => (
              <span key={idx} className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                {auth}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Stakeholder Card Component
interface StakeholderCardProps {
  stakeholder: Stakeholder
  team?: Team
  manager?: Stakeholder
  onEdit: () => void
  onDelete: () => void
}

function StakeholderCard({ stakeholder, team, manager, onEdit, onDelete }: StakeholderCardProps) {
  return (
    <div className="card bg-gradient-to-br from-neutral-50 to-neutral-100 border-2 border-neutral-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-neutral-900">{stakeholder.name}</h3>
          <p className="text-sm text-neutral-700">{stakeholder.title}</p>
          {stakeholder.role !== stakeholder.title && (
            <p className="text-xs text-neutral-600 mt-0.5">Project Role: {stakeholder.role}</p>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="text-primary-600 hover:text-primary-800 p-1" title="Edit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button onClick={onDelete} className="text-red-600 hover:text-red-800 p-1" title="Delete">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contact */}
      {(stakeholder.email || stakeholder.phone) && (
        <div className="mb-3 text-xs space-y-1">
          {stakeholder.email && (
            <div className="flex items-center gap-1 text-neutral-600">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{stakeholder.email}</span>
            </div>
          )}
          {stakeholder.phone && (
            <div className="flex items-center gap-1 text-neutral-600">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{stakeholder.phone}</span>
            </div>
          )}
        </div>
      )}

      {/* Team & Manager */}
      <div className="mb-3 space-y-1 text-xs">
        {team && (
          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Team: {team.name}
          </div>
        )}
        {manager && (
          <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
            Reports to: {manager.name}
          </div>
        )}
        {stakeholder.involvementLevel && (
          <div className="bg-green-100 text-green-800 px-2 py-1 rounded">
            {stakeholder.involvementLevel}
          </div>
        )}
      </div>

      {/* Knowledge Areas */}
      {stakeholder.knowledgeAreas && stakeholder.knowledgeAreas.length > 0 && (
        <div className="mb-2">
          <div className="text-xs font-medium text-neutral-700 mb-1">Expertise</div>
          <div className="flex flex-wrap gap-1">
            {stakeholder.knowledgeAreas.map((tier, idx) => (
              <span key={idx} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                {tier}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Can Approve */}
      {stakeholder.canApprove && stakeholder.canApprove.length > 0 && (
        <div>
          <div className="text-xs font-medium text-neutral-700 mb-1">Approval Authority</div>
          <div className="text-xs text-neutral-600">
            {stakeholder.canApprove.join(', ')}
          </div>
        </div>
      )}
    </div>
  )
}

// Organization Chart Component
interface OrganizationChartProps {
  teams: Team[]
  stakeholders: Stakeholder[]
}

function OrganizationChart({ teams, stakeholders }: OrganizationChartProps) {
  // Build hierarchy: stakeholders without managers are at top level
  const topLevelStakeholders = stakeholders.filter(s => !s.reportsToId)

  function renderStakeholderTree(stakeholder: Stakeholder, level: number = 0): JSX.Element {
    const reports = stakeholders.filter(s => s.reportsToId === stakeholder.id)
    const team = teams.find(t => t.id === stakeholder.teamId)

    return (
      <div key={stakeholder.id} className="mb-2">
        <div
          className={`card bg-white border-2 border-primary-300 p-3 ${level > 0 ? 'ml-8' : ''}`}
        >
          <div className="font-semibold text-neutral-900">{stakeholder.name}</div>
          <div className="text-sm text-neutral-700">{stakeholder.title}</div>
          {team && <div className="text-xs text-neutral-600 mt-1">Team: {team.name}</div>}
          {stakeholder.involvementLevel && (
            <div className="mt-1">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                {stakeholder.involvementLevel}
              </span>
            </div>
          )}
        </div>
        {reports.length > 0 && (
          <div className="mt-2">
            {reports.map(r => renderStakeholderTree(r, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {topLevelStakeholders.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-neutral-600">Add stakeholders to visualize the organization chart</p>
        </div>
      ) : (
        topLevelStakeholders.map(s => renderStakeholderTree(s))
      )}
    </div>
  )
}

// Add Team Modal (placeholder - will create full implementation)
function AddTeamModal({ projectId, teams, stakeholders, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentTeamId: undefined as number | undefined,
    leadStakeholderId: undefined as number | undefined,
    responsibilities: [] as string[],
    knowledgeAreas: [] as string[],
    approvalAuthority: [] as string[],
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await db.teams.add({
      projectId,
      ...formData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h3 className="text-xl font-bold mb-4">Add New Team</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Team Name *</label>
            <input
              type="text"
              required
              className="input"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Frontend Development"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="input"
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of team's purpose"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Team Lead</label>
            <select
              className="input"
              value={formData.leadStakeholderId || ''}
              onChange={e => setFormData({ ...formData, leadStakeholderId: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">None</option>
              {stakeholders.map(s => (
                <option key={s.id} value={s.id}>{s.name} - {s.title}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Team Modal
function EditTeamModal({ team, teams, stakeholders, onClose, onSave }: any) {
  // Similar to AddTeamModal but pre-populated with existing data
  return <div>Edit Team Modal - TODO</div>
}

// Add Stakeholder Modal
function AddStakeholderModal({ projectId, teams, stakeholders, onClose, onSave }: any) {
  // Full stakeholder form - TODO
  return <div>Add Stakeholder Modal - TODO</div>
}

// Edit Stakeholder Modal
function EditStakeholderModal({ stakeholder, teams, stakeholders, onClose, onSave }: any) {
  // Similar to AddStakeholderModal but pre-populated
  return <div>Edit Stakeholder Modal - TODO</div>
}
