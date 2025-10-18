// Developer Tools - Utilities for testing and debugging

import { useState } from 'react'
import { db, reloadInterviewQuestions } from '../../lib/database'
import type { Phase } from '../../types'

export function DevTools() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleReloadQuestions() {
    setLoading(true)
    setMessage('')
    try {
      const count = await reloadInterviewQuestions()
      setMessage(`✅ Reloaded ${count} questions successfully!`)
      await loadStats()
    } catch (error) {
      setMessage(`❌ Error reloading questions: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  async function loadStats() {
    setLoading(true)
    try {
      const allQuestions = await db.interviewQuestions.toArray()

      const byPhase = allQuestions.reduce(
        (acc, q) => {
          acc[q.phase] = (acc[q.phase] || 0) + 1
          return acc
        },
        {} as Record<Phase, number>
      )

      const byTier = allQuestions.reduce(
        (acc, q) => {
          acc[q.tier] = (acc[q.tier] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      const byTrack = allQuestions.reduce(
        (acc, q) => {
          acc[q.track] = (acc[q.track] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      const statistics = {
        total: allQuestions.length,
        byPhase,
        byTier,
        byTrack,
      }

      setStats(statistics)
    } catch (error) {
      setMessage(`❌ Error loading stats: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleViewQuestions() {
    const questions = await db.interviewQuestions.toArray()
    console.log('📋 All Questions:', questions)
    setMessage(`View console for ${questions.length} questions`)
  }

  async function handleClearDatabase() {
    if (!confirm('Are you sure you want to clear the entire database? This cannot be undone!')) {
      return
    }

    setLoading(true)
    try {
      await db.delete()
      setMessage('✅ Database cleared! Refresh the page to reinitialize.')
    } catch (error) {
      setMessage(`❌ Error clearing database: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Developer Tools</h3>

      <div className="space-y-4">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button onClick={handleReloadQuestions} disabled={loading} className="btn-primary text-sm">
            🔄 Reload Questions from CSV
          </button>
          <button onClick={loadStats} disabled={loading} className="btn-secondary text-sm">
            📊 Load Statistics
          </button>
          <button onClick={handleViewQuestions} disabled={loading} className="btn-secondary text-sm">
            👁️ View All Questions (Console)
          </button>
          <button
            onClick={handleClearDatabase}
            disabled={loading}
            className="btn-secondary text-sm bg-red-50 hover:bg-red-100 text-red-700"
          >
            🗑️ Clear Database
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="rounded-lg bg-neutral-100 border border-neutral-200 p-3">
            <p className="text-sm text-neutral-700">{message}</p>
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <h4 className="font-medium text-blue-900 mb-3">Question Statistics</h4>

            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-blue-700">Total Questions</div>
                <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-blue-700 mb-1">By Phase</div>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                  {Object.entries(stats.byPhase).map(([phase, count]) => (
                    <div key={phase}>
                      <span className="font-medium">{phase}:</span> {count as number}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-blue-700 mb-1">By Tier</div>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                  {Object.entries(stats.byTier).map(([tier, count]) => (
                    <div key={tier}>
                      <span className="font-medium">{tier}:</span> {count as number}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-blue-700 mb-1">By Track</div>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                  {Object.entries(stats.byTrack).map(([track, count]) => (
                    <div key={track}>
                      <span className="font-medium">{track}:</span> {count as number}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-3">
          <p className="text-xs text-neutral-600">
            <strong>Note:</strong> Use "Reload Questions" to update the database with the latest CSV
            data without losing your projects and responses.
          </p>
        </div>
      </div>
    </div>
  )
}
