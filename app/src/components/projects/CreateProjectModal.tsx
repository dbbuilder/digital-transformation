// Create Project Modal Component

import { useState } from 'react'
import { db } from '../../lib/database'
import { useAppStore } from '../../stores/useAppStore'
import type { TransformationPath, Phase } from '../../types'

export function CreateProjectModal() {
  const { createProjectModalOpen, setCreateProjectModalOpen, setCurrentProjectId } = useAppStore()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    transformationPath: 'UNDECIDED' as TransformationPath,
    currentPhase: 'DISCOVERY' as Phase,
    startDate: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  console.log('CreateProjectModal render - createProjectModalOpen:', createProjectModalOpen)

  if (!createProjectModalOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      setError('Project name must be at least 3 characters')
      return
    }

    setLoading(true)

    try {
      // Create project in IndexedDB
      const projectId = await db.projects.add({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        transformationPath: formData.transformationPath,
        currentPhase: formData.currentPhase,
        status: 'active',
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Set as current project
      setCurrentProjectId(projectId as number)

      // Close modal
      setCreateProjectModalOpen(false)

      // Reset form
      setFormData({
        name: '',
        description: '',
        transformationPath: 'UNDECIDED',
        currentPhase: 'DISCOVERY',
        startDate: '',
      })

      // Navigate to projects view
      useAppStore.getState().setActiveTab('projects')

    } catch (err: any) {
      console.error('Error creating project:', err)
      setError('Failed to create project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setCreateProjectModalOpen(false)
      setError('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-b-xl sm:rounded-xl shadow-xl max-w-2xl w-full max-h-screen sm:max-h-[90vh] overflow-y-auto my-0 sm:my-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Create New Project</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Acme Corp Digital Transformation"
              className="input w-full"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief overview of the transformation initiative..."
              rows={3}
              className="input w-full resize-none"
            />
          </div>

          {/* Transformation Path */}
          <div>
            <label htmlFor="path" className="block text-sm font-medium text-neutral-700 mb-1">
              Transformation Path
            </label>
            <select
              id="path"
              value={formData.transformationPath}
              onChange={(e) => setFormData({ ...formData, transformationPath: e.target.value as TransformationPath })}
              className="input w-full"
            >
              <option value="UNDECIDED">Undecided (Determine Later)</option>
              <option value="AI_INCLUDED">AI-Included (Use AI Throughout)</option>
              <option value="AI_FREE">AI-Free (Compliance/Traditional)</option>
            </select>
            <p className="text-xs text-neutral-500 mt-1">
              You can change this later during the discovery phase
            </p>
          </div>

          {/* Current Phase */}
          <div>
            <label htmlFor="phase" className="block text-sm font-medium text-neutral-700 mb-1">
              Starting Phase
            </label>
            <select
              id="phase"
              value={formData.currentPhase}
              onChange={(e) => setFormData({ ...formData, currentPhase: e.target.value as Phase })}
              className="input w-full"
            >
              <option value="DISCOVERY">Discovery & Alignment</option>
              <option value="FOUNDATION">Foundation</option>
              <option value="MODERNIZATION">Modernization</option>
              <option value="INTELLIGENCE">Intelligence (AI Path)</option>
              <option value="OPTIMIZATION">Optimization & Governance</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-neutral-700 mb-1">
              Start Date (Optional)
            </label>
            <input
              type="date"
              id="startDate"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="input w-full"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h4 className="font-medium text-neutral-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-neutral-700 space-y-1">
              <li>• Your project will be saved locally in your browser</li>
              <li>• You can add stakeholders and begin assessments</li>
              <li>• All data is stored offline - no internet required</li>
              <li>• Export anytime to PDF, Excel, or JSON</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Project...' : 'Create Project'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
