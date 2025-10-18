// Stakeholder Form Modal - Add or Edit stakeholders with full RACI and approval tracking

import { useState, useEffect } from 'react'
import { db } from '../../lib/database'
import type { Stakeholder, Team, Tier, InvolvementLevel } from '../../types'

interface StakeholderFormModalProps {
  projectId: number
  stakeholder?: Stakeholder // If editing
  teams: Team[]
  stakeholders: Stakeholder[]
  onClose: () => void
  onSave: () => void
}

const TIERS: Tier[] = ['UI', 'API', 'DATA', 'CLOUD', 'AI']
const INVOLVEMENT_LEVELS: InvolvementLevel[] = [
  'RESPONSIBLE',
  'ACCOUNTABLE',
  'CONSULTED',
  'INFORMED',
  'APPROVER',
]

export function StakeholderFormModal({
  projectId,
  stakeholder,
  teams,
  stakeholders,
  onClose,
  onSave,
}: StakeholderFormModalProps) {
  const isEditing = !!stakeholder

  const [formData, setFormData] = useState({
    name: stakeholder?.name || '',
    title: stakeholder?.title || '',
    role: stakeholder?.role || '',
    teamId: stakeholder?.teamId || undefined as number | undefined,
    department: stakeholder?.department || '',
    email: stakeholder?.email || '',
    phone: stakeholder?.phone || '',
    reportsToId: stakeholder?.reportsToId || undefined as number | undefined,
    knowledgeAreas: stakeholder?.knowledgeAreas || [] as Tier[],
    specializations: stakeholder?.specializations || [] as string[],
    responsibilities: stakeholder?.responsibilities || [] as string[],
    canApprove: stakeholder?.canApprove || [] as string[],
    involvementLevel: stakeholder?.involvementLevel || undefined as InvolvementLevel | undefined,
    availabilityHours: stakeholder?.availabilityHours || undefined as number | undefined,
    notes: stakeholder?.notes || '',
  })

  const [newSpecialization, setNewSpecialization] = useState('')
  const [newResponsibility, setNewResponsibility] = useState('')
  const [newApprovalItem, setNewApprovalItem] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const stakeholderData: Stakeholder = {
      projectId,
      ...formData,
      createdAt: stakeholder?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    if (isEditing && stakeholder.id) {
      await db.stakeholders.update(stakeholder.id, stakeholderData)
    } else {
      await db.stakeholders.add(stakeholderData)
    }

    onSave()
  }

  function addSpecialization() {
    if (newSpecialization.trim()) {
      setFormData({
        ...formData,
        specializations: [...formData.specializations, newSpecialization.trim()],
      })
      setNewSpecialization('')
    }
  }

  function removeSpecialization(index: number) {
    setFormData({
      ...formData,
      specializations: formData.specializations.filter((_, i) => i !== index),
    })
  }

  function addResponsibility() {
    if (newResponsibility.trim()) {
      setFormData({
        ...formData,
        responsibilities: [...formData.responsibilities, newResponsibility.trim()],
      })
      setNewResponsibility('')
    }
  }

  function removeResponsibility(index: number) {
    setFormData({
      ...formData,
      responsibilities: formData.responsibilities.filter((_, i) => i !== index),
    })
  }

  function addApprovalItem() {
    if (newApprovalItem.trim()) {
      setFormData({
        ...formData,
        canApprove: [...formData.canApprove, newApprovalItem.trim()],
      })
      setNewApprovalItem('')
    }
  }

  function removeApprovalItem(index: number) {
    setFormData({
      ...formData,
      canApprove: formData.canApprove.filter((_, i) => i !== index),
    })
  }

  function toggleKnowledgeArea(tier: Tier) {
    if (formData.knowledgeAreas.includes(tier)) {
      setFormData({
        ...formData,
        knowledgeAreas: formData.knowledgeAreas.filter(t => t !== tier),
      })
    } else {
      setFormData({
        ...formData,
        knowledgeAreas: [...formData.knowledgeAreas, tier],
      })
    }
  }

  // Filter out current stakeholder from manager list (can't report to self)
  const managerOptions = stakeholders.filter(s => s.id !== stakeholder?.id)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
          <h3 className="text-xl font-bold text-neutral-900">
            {isEditing ? `Edit ${stakeholder.name}` : 'Add New Stakeholder'}
          </h3>
          <p className="text-sm text-neutral-600 mt-1">
            Define who this person is, what they know, what they're responsible for, and what they can approve
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-neutral-900 border-b pb-2">Basic Information</h4>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Project Role</label>
                <input
                  type="text"
                  className="input"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Lead Developer, Product Owner, etc."
                />
                <p className="text-xs text-neutral-500 mt-1">Role specific to this project (optional)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <input
                  type="text"
                  className="input"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Engineering, Product, Marketing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.smith@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Team & Reporting */}
          <div className="space-y-4">
            <h4 className="font-semibold text-neutral-900 border-b pb-2">Team & Reporting Structure</h4>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Team</label>
                <select
                  className="input"
                  value={formData.teamId || ''}
                  onChange={e => setFormData({ ...formData, teamId: e.target.value ? Number(e.target.value) : undefined })}
                >
                  <option value="">No team</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reports To</label>
                <select
                  className="input"
                  value={formData.reportsToId || ''}
                  onChange={e => setFormData({ ...formData, reportsToId: e.target.value ? Number(e.target.value) : undefined })}
                >
                  <option value="">No manager</option>
                  {managerOptions.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - {s.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Default Involvement Level</label>
                <select
                  className="input"
                  value={formData.involvementLevel || ''}
                  onChange={e => setFormData({ ...formData, involvementLevel: (e.target.value || undefined) as InvolvementLevel | undefined })}
                >
                  <option value="">Not specified</option>
                  {INVOLVEMENT_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <p className="text-xs text-neutral-500 mt-1">Default RACI role for this stakeholder</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Availability (hours/week)</label>
                <input
                  type="number"
                  min="0"
                  max="168"
                  className="input"
                  value={formData.availabilityHours || ''}
                  onChange={e => setFormData({ ...formData, availabilityHours: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="40"
                />
              </div>
            </div>
          </div>

          {/* Knowledge & Expertise */}
          <div className="space-y-4">
            <h4 className="font-semibold text-neutral-900 border-b pb-2">Knowledge & Expertise</h4>

            <div>
              <label className="block text-sm font-medium mb-2">Knowledge Areas (Tiers)</label>
              <div className="flex flex-wrap gap-2">
                {TIERS.map(tier => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => toggleKnowledgeArea(tier)}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                      formData.knowledgeAreas.includes(tier)
                        ? 'bg-indigo-500 border-indigo-500 text-white'
                        : 'bg-white border-neutral-300 text-neutral-700 hover:border-indigo-300'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-500 mt-2">Select tiers this person has expertise in</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Specializations</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="input flex-1"
                  value={newSpecialization}
                  onChange={e => setNewSpecialization(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                  placeholder="e.g., React, PostgreSQL, AWS Lambda"
                />
                <button
                  type="button"
                  onClick={addSpecialization}
                  className="btn-secondary whitespace-nowrap"
                >
                  + Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specializations.map((spec, idx) => (
                  <span
                    key={idx}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpecialization(idx)}
                      className="text-green-600 hover:text-green-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Responsibilities */}
          <div className="space-y-4">
            <h4 className="font-semibold text-neutral-900 border-b pb-2">Responsibilities</h4>

            <div>
              <label className="block text-sm font-medium mb-1">What is this person responsible for?</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="input flex-1"
                  value={newResponsibility}
                  onChange={e => setNewResponsibility(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
                  placeholder="e.g., Frontend architecture decisions"
                />
                <button
                  type="button"
                  onClick={addResponsibility}
                  className="btn-secondary whitespace-nowrap"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-1">
                {formData.responsibilities.map((resp, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-100 px-3 py-2 rounded flex items-start justify-between gap-2"
                  >
                    <span className="text-sm text-neutral-800">{resp}</span>
                    <button
                      type="button"
                      onClick={() => removeResponsibility(idx)}
                      className="text-neutral-600 hover:text-red-600 flex-shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Approval Authority */}
          <div className="space-y-4">
            <h4 className="font-semibold text-neutral-900 border-b pb-2">Approval Authority</h4>

            <div>
              <label className="block text-sm font-medium mb-1">What can this person approve?</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="input flex-1"
                  value={newApprovalItem}
                  onChange={e => setNewApprovalItem(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addApprovalItem())}
                  placeholder="e.g., UI designs, API specifications, Database schemas"
                />
                <button
                  type="button"
                  onClick={addApprovalItem}
                  className="btn-secondary whitespace-nowrap"
                >
                  + Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.canApprove.map((item, idx) => (
                  <span
                    key={idx}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeApprovalItem(idx)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h4 className="font-semibold text-neutral-900 border-b pb-2">Additional Notes</h4>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                className="input"
                rows={3}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional information about this stakeholder..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t sticky bottom-0 bg-white">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? 'Save Changes' : 'Add Stakeholder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
