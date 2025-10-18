// Stakeholder Selector - Shows suggested stakeholders and tracks who answered

import { useState, useEffect } from 'react'
import { suggestStakeholdersForQuestion, type StakeholderSuggestion } from '../../services/StakeholderSuggestionService'
import type { Stakeholder, Tier, Phase } from '../../types'

interface StakeholderSelectorProps {
  projectId: number
  tier: Tier
  phase: Phase
  questionText: string
  selectedStakeholderId?: number
  onSelect: (stakeholderId: number) => void
  compact?: boolean
}

export function StakeholderSelector({
  projectId,
  tier,
  phase,
  questionText,
  selectedStakeholderId,
  onSelect,
  compact = false,
}: StakeholderSelectorProps) {
  const [suggestions, setSuggestions] = useState<StakeholderSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    loadSuggestions()
  }, [projectId, tier, phase, questionText])

  async function loadSuggestions() {
    setLoading(true)
    const results = await suggestStakeholdersForQuestion(projectId, tier, phase, questionText)
    setSuggestions(results)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="text-sm text-neutral-500">Loading stakeholder suggestions...</div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <div className="text-sm font-medium text-yellow-900">No stakeholders with {tier} expertise</div>
            <div className="text-xs text-yellow-700 mt-1">
              Add stakeholders with knowledge of {tier} tier to get suggestions
            </div>
          </div>
        </div>
      </div>
    )
  }

  const selectedSuggestion = suggestions.find(s => s.stakeholder.id === selectedStakeholderId)
  const topSuggestion = suggestions[0]

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-neutral-700">
            Who answered this question?
          </label>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            {isExpanded ? 'Hide suggestions' : `${suggestions.length} suggestions`}
          </button>
        </div>

        {/* Selected or Top Suggestion */}
        {!isExpanded && (
          <div
            onClick={() => onSelect(topSuggestion.stakeholder.id!)}
            className={`rounded-lg border-2 p-3 cursor-pointer transition-all ${
              selectedStakeholderId === topSuggestion.stakeholder.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 hover:border-primary-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                {topSuggestion.stakeholder.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-neutral-900 truncate">
                  {topSuggestion.stakeholder.name}
                </div>
                <div className="text-xs text-neutral-600 truncate">
                  {topSuggestion.stakeholder.title}
                </div>
              </div>
              <div>
                <ConfidenceBadge confidence={topSuggestion.confidence} />
              </div>
            </div>
          </div>
        )}

        {/* Expanded Suggestions */}
        {isExpanded && (
          <div className="space-y-2">
            {suggestions.map((suggestion, idx) => (
              <StakeholderSuggestionCard
                key={suggestion.stakeholder.id}
                suggestion={suggestion}
                isSelected={selectedStakeholderId === suggestion.stakeholder.id}
                isTopPick={idx === 0}
                onSelect={() => onSelect(suggestion.stakeholder.id!)}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Full view
  return (
    <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h4 className="font-semibold text-blue-900">Suggested Stakeholders</h4>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-700 hover:text-blue-900 font-medium"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <p className="text-sm text-blue-700 mb-3">
        Based on {tier} expertise and responsibilities, these stakeholders should answer this question:
      </p>

      {isExpanded && (
        <div className="space-y-2">
          {suggestions.map((suggestion, idx) => (
            <StakeholderSuggestionCard
              key={suggestion.stakeholder.id}
              suggestion={suggestion}
              isSelected={selectedStakeholderId === suggestion.stakeholder.id}
              isTopPick={idx === 0}
              onSelect={() => onSelect(suggestion.stakeholder.id!)}
            />
          ))}
        </div>
      )}

      {!isExpanded && (
        <StakeholderSuggestionCard
          suggestion={topSuggestion}
          isSelected={selectedStakeholderId === topSuggestion.stakeholder.id}
          isTopPick={true}
          onSelect={() => onSelect(topSuggestion.stakeholder.id!)}
        />
      )}
    </div>
  )
}

interface StakeholderSuggestionCardProps {
  suggestion: StakeholderSuggestion
  isSelected: boolean
  isTopPick: boolean
  onSelect: () => void
}

function StakeholderSuggestionCard({
  suggestion,
  isSelected,
  isTopPick,
  onSelect,
}: StakeholderSuggestionCardProps) {
  const { stakeholder, reason, confidence } = suggestion

  return (
    <div
      onClick={onSelect}
      className={`rounded-lg border-2 p-3 cursor-pointer transition-all ${
        isSelected
          ? 'border-primary-500 bg-primary-50 shadow-md'
          : 'border-white bg-white hover:border-primary-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          {stakeholder.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-neutral-900 truncate">
                  {stakeholder.name}
                </div>
                {isTopPick && (
                  <span className="flex-shrink-0 bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium border border-amber-300">
                    ⭐ Top Pick
                  </span>
                )}
              </div>
              <div className="text-sm text-neutral-700">{stakeholder.title}</div>
              {stakeholder.role && stakeholder.role !== stakeholder.title && (
                <div className="text-xs text-neutral-600">Role: {stakeholder.role}</div>
              )}
            </div>
            <ConfidenceBadge confidence={confidence} />
          </div>

          {/* Reason */}
          <div className="mt-2 text-xs text-neutral-600 flex items-start gap-1">
            <svg className="w-3 h-3 flex-shrink-0 mt-0.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{reason}</span>
          </div>

          {/* Knowledge Areas */}
          {stakeholder.knowledgeAreas && stakeholder.knowledgeAreas.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {stakeholder.knowledgeAreas.map((tier, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded"
                >
                  {tier}
                </span>
              ))}
            </div>
          )}

          {/* Contact Info (if selected) */}
          {isSelected && stakeholder.email && (
            <div className="mt-2 flex items-center gap-1 text-xs text-neutral-600">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{stakeholder.email}</span>
            </div>
          )}
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

function ConfidenceBadge({ confidence }: { confidence: 'high' | 'medium' | 'low' }) {
  const config = {
    high: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      label: 'High Confidence',
    },
    medium: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      label: 'Medium Confidence',
    },
    low: {
      bg: 'bg-neutral-100',
      text: 'text-neutral-700',
      border: 'border-neutral-300',
      label: 'Low Confidence',
    },
  }

  const c = config[confidence]

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {c.label}
    </span>
  )
}
