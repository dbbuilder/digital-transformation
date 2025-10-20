/**
 * Sync Manager Component
 *
 * User interface for data synchronization and backup
 * - Online/offline status indicator
 * - Export data for backup
 * - Import data from backup
 * - Database statistics
 * - Clear all data (with confirmation)
 */

import { useState, useEffect } from 'react'
import { getSyncService, type SyncResult } from '../../services/SyncService'

export function SyncManager() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [stats, setStats] = useState<any>(null)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const syncService = getSyncService()

  useEffect(() => {
    loadStats()

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  async function loadStats() {
    const s = await syncService.getStats()
    setStats(s)
  }

  async function handleExport() {
    try {
      const blob = await syncService.exportAsJSON()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `digiform-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setResult({ success: true, message: 'Data exported successfully!' })
      setTimeout(() => setResult(null), 3000)
    } catch (error: any) {
      setResult({ success: false, message: `Export failed: ${error.message}` })
    }
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const importResult = await syncService.importFromJSON(file, 'MERGE')

      if (importResult.success) {
        setResult({
          success: true,
          message: `Import successful! ${importResult.syncedCount} items synced.`,
        })
        await loadStats()
      } else {
        setResult({
          success: false,
          message: `Import failed: ${importResult.errors.join(', ')}`,
        })
      }

      setTimeout(() => setResult(null), 5000)
    } catch (error: any) {
      setResult({ success: false, message: `Import failed: ${error.message}` })
    }

    // Reset file input
    event.target.value = ''
  }

  async function handleClearData() {
    try {
      await syncService.clearAllData()
      setResult({ success: true, message: 'All data cleared successfully' })
      setShowClearConfirm(false)
      await loadStats()
      setTimeout(() => setResult(null), 3000)
    } catch (error: any) {
      setResult({ success: false, message: `Clear failed: ${error.message}` })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Data Sync & Backup</h2>
        <p className="text-neutral-600">Manage your offline data and backups</p>
      </div>

      {/* Online/Offline Status */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-4 w-4 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-yellow-500'
              } animate-pulse`}
            />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                {isOnline ? 'Online' : 'Offline'}
              </h3>
              <p className="text-sm text-neutral-600">
                {isOnline
                  ? 'All features available'
                  : 'Working offline - changes saved locally'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Database Statistics */}
      {stats && (
        <div className="card">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Database Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{stats.projects}</div>
              <div className="text-sm text-neutral-600">Projects</div>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{stats.stakeholders}</div>
              <div className="text-sm text-neutral-600">Stakeholders</div>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{stats.assessments}</div>
              <div className="text-sm text-neutral-600">Assessments</div>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{stats.assessmentResponses}</div>
              <div className="text-sm text-neutral-600">Responses</div>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{stats.roadmaps}</div>
              <div className="text-sm text-neutral-600">Roadmaps</div>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{stats.documents}</div>
              <div className="text-sm text-neutral-600">Documents</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="text-sm text-neutral-600">
              Total records: <span className="font-semibold text-neutral-900">{stats.total}</span>
            </div>
          </div>
        </div>
      )}

      {/* Export/Import */}
      <div className="card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Backup & Restore</h3>
          <p className="text-sm text-neutral-600">
            Export your data for backup or import from a previous backup
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleExport} className="btn-primary">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export Data
          </button>

          <label className="btn-secondary cursor-pointer inline-flex items-center justify-center">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Import Data
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-2">
            <svg
              className="h-5 w-5 flex-shrink-0 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Backup Best Practices</p>
              <ul className="space-y-1 text-xs">
                <li>• Export your data regularly (weekly recommended)</li>
                <li>• Store backups in a secure location (cloud storage, external drive)</li>
                <li>• Import will merge data (newer items overwrite older ones)</li>
                <li>• All data is stored locally in your browser by default</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-2 border-red-200 bg-red-50">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-700 mb-4">
          Permanently delete all data from your browser. This action cannot be undone.
        </p>

        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear All Data
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-red-900">
              Are you absolutely sure? This will permanently delete all projects, assessments, and data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Delete Everything
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Result Message */}
      {result && (
        <div
          className={`rounded-lg p-4 ${
            result.success
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex gap-2">
            {result.success ? (
              <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <div className="flex-1 text-sm">{result.message}</div>
          </div>
        </div>
      )}

      {/* Offline-First Architecture Info */}
      <div className="card bg-neutral-50">
        <h3 className="text-lg font-semibold text-neutral-900 mb-3">About Offline-First Storage</h3>
        <div className="space-y-2 text-sm text-neutral-700">
          <p>
            DigiForm uses <strong>IndexedDB</strong> for local browser storage. Your data is:
          </p>
          <ul className="space-y-1 ml-4">
            <li>• Stored entirely on your device (not sent to external servers)</li>
            <li>• Available offline - no internet connection required</li>
            <li>• Persistent across browser sessions</li>
            <li>• Specific to this browser (data won't sync across devices automatically)</li>
          </ul>
          <p className="mt-3">
            <strong>Important:</strong> Clearing your browser data will delete all DigiForm projects. Always
            export backups before clearing browser storage.
          </p>
        </div>
      </div>
    </div>
  )
}
