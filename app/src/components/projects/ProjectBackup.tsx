// Project Backup Component - Export and Import project data

import { useState, useRef } from 'react'
import { exportProjectToJSON, importProjectFromJSON, downloadBlob } from '../../services/ExportService'

interface ProjectBackupProps {
  projectId: number
  projectName: string
  onImportSuccess?: () => void
}

export function ProjectBackup({ projectId, projectName, onImportSuccess }: ProjectBackupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleExport() {
    setExporting(true)
    setError(null)
    setSuccess(null)

    try {
      const blob = await exportProjectToJSON(projectId)
      const filename = `${projectName.replace(/[^a-z0-9]/gi, '_')}_backup_${new Date().toISOString().split('T')[0]}.json`
      downloadBlob(blob, filename)
      setSuccess('Project exported successfully!')
    } catch (err) {
      console.error('Error exporting project:', err)
      setError('Failed to export project. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setError(null)
    setSuccess(null)

    try {
      const text = await file.text()
      await importProjectFromJSON(text)
      setSuccess('Project imported successfully! Refresh to see the new project.')
      if (onImportSuccess) {
        onImportSuccess()
      }
    } catch (err) {
      console.error('Error importing project:', err)
      setError(err instanceof Error ? err.message : 'Failed to import project. Please check the file.')
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="card flex items-start gap-4 text-left hover:border-primary-300 hover:shadow-md"
      >
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100">
          <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-900">Backup & Restore</h3>
          <p className="text-sm text-neutral-600">Export/import project data</p>
        </div>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 p-6">
          <h2 className="text-2xl font-bold text-neutral-900">Backup & Restore</h2>
          <button
            onClick={() => setIsOpen(false)}
            disabled={exporting || importing}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Section */}
          <div className="rounded-lg border-2 border-neutral-200 p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900">Export Project</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Download a complete backup of this project including all assessments, responses, roadmap, and four-corner data.
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  Creates a JSON file that can be imported on any device to restore the project.
                </p>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="btn-primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? (
                    <>
                      <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Export to JSON
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Import Section */}
          <div className="rounded-lg border-2 border-neutral-200 p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-12"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900">Import Project</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Restore a project from a previously exported JSON backup file.
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  This will create a new project with all data from the backup. The original project is not affected.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={importing}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                  className="btn-secondary mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? (
                    <>
                      <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Importing...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-12"
                        />
                      </svg>
                      Choose JSON File
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <h4 className="font-medium text-blue-900 mb-2">Backup Best Practices</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Export regularly to avoid data loss</li>
              <li>• Store backup files in a safe location (cloud storage, external drive)</li>
              <li>• Backup files are human-readable JSON format</li>
              <li>• Imports create new projects - originals remain unchanged</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-200 p-6">
          <button
            onClick={() => setIsOpen(false)}
            disabled={exporting || importing}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
