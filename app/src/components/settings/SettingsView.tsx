/**
 * Settings View Component
 *
 * Tabbed interface for all application settings
 */

import { useState } from 'react'
import { AISettings } from './AISettings'
import { SyncManager } from '../sync/SyncManager'

type SettingsTab = 'ai' | 'data'

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('ai')

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Settings</h1>
        <p className="text-neutral-600">Configure DigiForm to match your needs</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'ai'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              AI Assistant
            </div>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'data'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
              </svg>
              Data & Sync
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'ai' && <AISettings />}
        {activeTab === 'data' && <SyncManager />}
      </div>
    </div>
  )
}
