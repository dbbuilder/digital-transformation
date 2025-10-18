// Four-Corner Diagram - Core transformation visualization methodology

import { useState, useEffect } from 'react'
import { db } from '../../lib/database'
import type { FourCornerData, Tier } from '../../types'

interface FourCornerDiagramProps {
  projectId: number
}

type Quadrant = 'current_ui' | 'future_ui' | 'current_data' | 'future_data'

interface QuadrantContent {
  quadrant: Quadrant
  tier: Tier
  content: string
  notes?: string
}

export function FourCornerDiagram({ projectId }: FourCornerDiagramProps) {
  const [selectedQuadrant, setSelectedQuadrant] = useState<Quadrant | null>(null)
  const [selectedTier, setSelectedTier] = useState<Tier>('UI')
  const [data, setData] = useState<FourCornerData[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)

  const tiers: Tier[] = ['UI', 'API', 'DATA', 'CLOUD', 'AI']

  useEffect(() => {
    loadDiagramData()
  }, [projectId])

  async function loadDiagramData() {
    setLoading(true)
    try {
      const diagramData = await db.fourCornerData.where('projectId').equals(projectId).toArray()
      setData(diagramData)
    } catch (error) {
      console.error('Error loading diagram data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveQuadrantContent(quadrant: Quadrant, tier: Tier, content: string, notes?: string) {
    try {
      // Check if entry exists
      const existing = data.find((d) => d.quadrant === quadrant && d.tier === tier)

      if (existing && existing.id) {
        // Update existing
        await db.fourCornerData.update(existing.id, {
          content,
          notes,
          updatedAt: new Date(),
        })
      } else {
        // Create new
        const newEntry: Omit<FourCornerData, 'id'> = {
          projectId,
          quadrant,
          tier,
          content,
          notes,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        await db.fourCornerData.add(newEntry)
      }

      // Reload data
      await loadDiagramData()
    } catch (error) {
      console.error('Error saving quadrant content:', error)
    }
  }

  function getQuadrantData(quadrant: Quadrant, tier: Tier): FourCornerData | undefined {
    return data.find((d) => d.quadrant === quadrant && d.tier === tier)
  }

  function getQuadrantColor(quadrant: Quadrant): string {
    const colors: Record<Quadrant, string> = {
      current_ui: 'bg-blue-50 border-blue-200',
      future_ui: 'bg-green-50 border-green-200',
      current_data: 'bg-orange-50 border-orange-200',
      future_data: 'bg-purple-50 border-purple-200',
    }
    return colors[quadrant]
  }

  function getQuadrantTitle(quadrant: Quadrant): string {
    const titles: Record<Quadrant, string> = {
      current_ui: 'Current State - UI/UX',
      future_ui: 'Future State - UI/UX',
      current_data: 'Current State - Data Platform',
      future_data: 'Future State - Data Platform',
    }
    return titles[quadrant]
  }

  function getQuadrantIcon(quadrant: Quadrant) {
    if (quadrant.includes('ui')) {
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      )
    }
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
        />
      </svg>
    )
  }

  function QuadrantCard({ quadrant }: { quadrant: Quadrant }) {
    const tierData = getQuadrantData(quadrant, selectedTier)
    const hasContent = tierData && tierData.content.trim().length > 0

    return (
      <div
        className={`rounded-lg border-2 p-6 transition-all ${getQuadrantColor(quadrant)} ${
          selectedQuadrant === quadrant ? 'ring-2 ring-primary-500' : ''
        } ${editMode ? 'cursor-pointer hover:shadow-lg' : ''}`}
        onClick={() => editMode && setSelectedQuadrant(quadrant)}
      >
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          {getQuadrantIcon(quadrant)}
          <h3 className="text-lg font-semibold text-neutral-900">{getQuadrantTitle(quadrant)}</h3>
        </div>

        {/* Content */}
        <div className="min-h-[200px]">
          {hasContent ? (
            <div className="space-y-2">
              <p className="text-sm text-neutral-700 whitespace-pre-wrap">{tierData.content}</p>
              {tierData.notes && (
                <div className="rounded bg-white bg-opacity-50 p-2 text-xs text-neutral-600">
                  <strong>Notes:</strong> {tierData.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-center text-neutral-400">
              {editMode ? 'Click to add content for this quadrant' : 'No content yet'}
            </div>
          )}
        </div>

        {/* Footer - Completion indicator */}
        <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-2">
          <div className="text-xs text-neutral-500">
            {hasContent ? 'Content added' : 'Empty'}
          </div>
          {hasContent && (
            <div className="flex items-center gap-1 text-green-600">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs">Done</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-500">Loading diagram...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Four-Corner Framework</h2>
          <p className="text-neutral-600">
            Visualize transformation across current and future states
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`btn-${editMode ? 'primary' : 'secondary'}`}
          >
            {editMode ? 'Done Editing' : 'Edit Diagram'}
          </button>
          <button className="btn-secondary">
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Tier Selector */}
      <div className="card">
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">Select Tier</h3>
        <div className="flex flex-wrap gap-2">
          {tiers.map((tier) => {
            const tierDataCount = data.filter(
              (d) => d.tier === tier && d.content.trim().length > 0
            ).length
            const completionPercentage = Math.round((tierDataCount / 4) * 100)

            return (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 font-medium transition-all ${
                  selectedTier === tier
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <span>{tier}</span>
                {completionPercentage > 0 && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    {completionPercentage}%
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Four-Corner Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Row */}
        <QuadrantCard quadrant="future_ui" />
        <QuadrantCard quadrant="current_ui" />

        {/* Bottom Row */}
        <QuadrantCard quadrant="future_data" />
        <QuadrantCard quadrant="current_data" />
      </div>

      {/* Edit Modal */}
      {selectedQuadrant && (
        <EditQuadrantModal
          quadrant={selectedQuadrant}
          tier={selectedTier}
          data={getQuadrantData(selectedQuadrant, selectedTier)}
          onSave={(content, notes) => {
            saveQuadrantContent(selectedQuadrant, selectedTier, content, notes)
            setSelectedQuadrant(null)
          }}
          onClose={() => setSelectedQuadrant(null)}
        />
      )}

      {/* Legend */}
      <div className="card">
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">Framework Guide</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-neutral-900">Transformation Flow</h4>
            <p className="text-sm text-neutral-600">
              Document current state (right side) and design future state (left side). Transformation
              progresses diagonally across UI and Data/Platform layers.
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-neutral-900">Five Tiers</h4>
            <ul className="space-y-1 text-sm text-neutral-600">
              <li>• UI: User interface and experience</li>
              <li>• API: Application logic and services</li>
              <li>• Data: Databases and data platform</li>
              <li>• Cloud: Infrastructure and compute</li>
              <li>• AI: AI services and integrations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Edit Quadrant Modal Component
interface EditQuadrantModalProps {
  quadrant: Quadrant
  tier: Tier
  data?: FourCornerData
  onSave: (content: string, notes?: string) => void
  onClose: () => void
}

function EditQuadrantModal({ quadrant, tier, data, onSave, onClose }: EditQuadrantModalProps) {
  const [content, setContent] = useState(data?.content || '')
  const [notes, setNotes] = useState(data?.notes || '')

  function getQuadrantTitle(quadrant: Quadrant): string {
    const titles: Record<Quadrant, string> = {
      current_ui: 'Current State - UI/UX',
      future_ui: 'Future State - UI/UX',
      current_data: 'Current State - Data Platform',
      future_data: 'Future State - Data Platform',
    }
    return titles[quadrant]
  }

  function handleSave() {
    onSave(content, notes)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 p-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Edit Quadrant</h2>
            <p className="text-sm text-neutral-600">
              {getQuadrantTitle(quadrant)} - {tier} Tier
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              rows={8}
              placeholder="Describe the current state, technologies, pain points, or future vision for this quadrant..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Notes
              <span className="ml-2 text-xs font-normal text-neutral-500">(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              rows={3}
              placeholder="Additional notes, considerations, or references..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-200 p-6">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
