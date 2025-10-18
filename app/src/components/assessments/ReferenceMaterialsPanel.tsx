// Reference Materials Panel - Display relevant documents and guides

import { useState } from 'react'
import { getRelevantMaterials, type ReferenceMaterial } from '../../data/referenceMaterials'
import type { Phase, Tier } from '../../types'
import ReactMarkdown from 'react-markdown'

interface ReferenceMaterialsPanelProps {
  questionText: string
  phase: Phase
  tier: Tier
}

export function ReferenceMaterialsPanel({ questionText, phase, tier }: ReferenceMaterialsPanelProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<ReferenceMaterial | null>(null)
  const materials = getRelevantMaterials(questionText, phase, tier)

  if (materials.length === 0) {
    return null
  }

  function getTypeIcon(type: ReferenceMaterial['type']) {
    switch (type) {
      case 'pdf':
        return '📄'
      case 'link':
        return '🔗'
      case 'markdown':
        return '📖'
      case 'checklist':
        return '✅'
      case 'template':
        return '📝'
      case 'diagram':
        return '📊'
      default:
        return '📁'
    }
  }

  function getTypeColor(type: ReferenceMaterial['type']) {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'link':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'markdown':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'checklist':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'template':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'diagram':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200'
    }
  }

  return (
    <div className="card bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <h4 className="font-semibold text-green-900">
          Reference Materials ({materials.length})
        </h4>
      </div>

      {selectedMaterial ? (
        // Material Detail View
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{getTypeIcon(selectedMaterial.type)}</span>
                <h5 className="font-semibold text-neutral-900">{selectedMaterial.title}</h5>
              </div>
              <p className="text-sm text-neutral-600">{selectedMaterial.description}</p>
            </div>
            <button
              onClick={() => setSelectedMaterial(null)}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {selectedMaterial.url && (
            <a
              href={selectedMaterial.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Open External Link
            </a>
          )}

          {selectedMaterial.content && (
            <div className="rounded-lg bg-white border border-neutral-200 p-4 max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{selectedMaterial.content}</ReactMarkdown>
              </div>
            </div>
          )}

          {selectedMaterial.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedMaterial.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Materials List View
        <div className="grid md:grid-cols-2 gap-3">
          {materials.map((material) => (
            <button
              key={material.id}
              onClick={() => setSelectedMaterial(material)}
              className="rounded-lg bg-white border-2 border-neutral-200 p-3 text-left hover:border-green-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{getTypeIcon(material.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-neutral-900 text-sm line-clamp-1">
                    {material.title}
                  </div>
                  <div className="text-xs text-neutral-600 line-clamp-2 mt-1">
                    {material.description}
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${getTypeColor(material.type)}`}
                    >
                      {material.type}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {!selectedMaterial && materials.length > 0 && (
        <div className="mt-3 text-xs text-neutral-600 text-center">
          Click any material to view details
        </div>
      )}
    </div>
  )
}
