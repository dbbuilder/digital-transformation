// Current Stakeholder Selector - Simulates "logged in" user for approval testing

import { useState, useEffect } from 'react'
import { db } from '../../lib/database'
import type { Stakeholder } from '../../types'

interface CurrentStakeholderSelectorProps {
  projectId: number
  selectedStakeholderId?: number
  onSelect: (stakeholderId: number | undefined) => void
}

export function CurrentStakeholderSelector({
  projectId,
  selectedStakeholderId,
  onSelect,
}: CurrentStakeholderSelectorProps) {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    async function loadStakeholders() {
      const allStakeholders = await db.stakeholders
        .where('projectId')
        .equals(projectId)
        .toArray()

      // Filter to only approvers or those with approval authority
      const approvers = allStakeholders.filter(
        s => s.involvementLevel === 'APPROVER' || s.canApprove && s.canApprove.length > 0
      )

      setStakeholders(approvers.length > 0 ? approvers : allStakeholders)
    }
    loadStakeholders()
  }, [projectId])

  const currentStakeholder = stakeholders.find(s => s.id === selectedStakeholderId)

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-neutral-700">
          Reviewing as:
        </label>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors ${
              currentStakeholder
                ? 'bg-purple-50 border-purple-300 text-purple-900'
                : 'bg-neutral-50 border-neutral-300 text-neutral-600'
            }`}
          >
            {currentStakeholder ? (
              <>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                  {currentStakeholder.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{currentStakeholder.name}</div>
                  <div className="text-xs text-neutral-600">{currentStakeholder.title}</div>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-neutral-300 flex items-center justify-center">
                  <svg className="w-5 h-5 text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Select stakeholder...</span>
              </>
            )}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-lg shadow-lg border-2 border-neutral-200 max-h-96 overflow-y-auto z-50">
              {/* Clear selection */}
              <button
                onClick={() => {
                  onSelect(undefined)
                  setIsOpen(false)
                }}
                className="w-full px-4 py-3 text-left hover:bg-neutral-50 border-b border-neutral-200 flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-sm text-neutral-700">No stakeholder selected</div>
                  <div className="text-xs text-neutral-500">View only mode</div>
                </div>
              </button>

              {/* Stakeholder options */}
              {stakeholders.map(stakeholder => (
                <button
                  key={stakeholder.id}
                  onClick={() => {
                    onSelect(stakeholder.id!)
                    setIsOpen(false)
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors ${
                    selectedStakeholderId === stakeholder.id ? 'bg-purple-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {stakeholder.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-neutral-900">{stakeholder.name}</div>
                      <div className="text-xs text-neutral-600">{stakeholder.title}</div>
                      {stakeholder.involvementLevel && (
                        <div className="text-xs text-purple-700 mt-0.5">
                          {stakeholder.involvementLevel}
                        </div>
                      )}
                      {stakeholder.canApprove && stakeholder.canApprove.length > 0 && (
                        <div className="text-xs text-neutral-500 mt-0.5">
                          Can approve: {stakeholder.canApprove.slice(0, 2).join(', ')}
                          {stakeholder.canApprove.length > 2 && ` +${stakeholder.canApprove.length - 2} more`}
                        </div>
                      )}
                    </div>
                    {selectedStakeholderId === stakeholder.id && (
                      <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}

              {stakeholders.length === 0 && (
                <div className="px-4 py-8 text-center text-neutral-500 text-sm">
                  No stakeholders found for this project.
                  <br />
                  Add stakeholders in Team Management.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info banner when no stakeholder selected */}
      {!currentStakeholder && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-xs text-blue-800">
              <strong>Select a stakeholder</strong> to enable approval actions. This simulates which team member is currently reviewing the SOW.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
