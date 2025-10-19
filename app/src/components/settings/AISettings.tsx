/**
 * AI Settings Component
 *
 * Allows users to configure OpenAI GPT-4o Mini integration
 */

import { useState, useEffect } from 'react'
import { loadAIConfig, saveAIConfig, getAIService, type AIConfig } from '../../services/AIService'

export function AISettings() {
  const [config, setConfig] = useState<AIConfig>({
    apiKey: '',
    enabled: false,
    model: 'gpt-4o-mini',
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    const loaded = loadAIConfig()
    if (loaded) {
      setConfig(loaded)
    }
  }, [])

  function handleSave() {
    saveAIConfig(config)
    setTestResult({ success: true, message: 'AI settings saved successfully!' })
    setTimeout(() => setTestResult(null), 3000)
  }

  async function handleTest() {
    if (!config.apiKey || !config.enabled) {
      setTestResult({ success: false, message: 'Please enable AI and provide an API key' })
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      const aiService = getAIService(config)

      // Test with a simple completion
      const testAnalysis = await aiService.analyzeAssessments(
        {
          id: 0,
          name: 'Test Project',
          description: 'Testing AI integration',
          transformationPath: 'UNDECIDED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        [
          {
            id: 0,
            projectId: 0,
            assessmentId: 0,
            question: 'What is your current technology stack?',
            tier: 'API',
            response: 'We use REST APIs with .NET Core and SQL Server',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]
      )

      if (testAnalysis.summary) {
        setTestResult({
          success: true,
          message: `AI connection successful! Model: ${config.model}\nSample response: ${testAnalysis.summary.substring(0, 100)}...`,
        })
      } else {
        setTestResult({ success: false, message: 'AI connection succeeded but returned empty response' })
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: `AI connection failed: ${error.message || 'Unknown error'}`,
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">AI Assistant Settings</h2>
        <p className="text-neutral-600">Configure OpenAI GPT-4o Mini to enhance your transformation planning</p>
      </div>

      <div className="card space-y-6">
        {/* Enable AI Toggle */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900">Enable AI Features</h3>
            <p className="text-sm text-neutral-600">
              AI-powered assessment analysis, recommendations, and deliverable generation
            </p>
          </div>
          <button
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.enabled ? 'bg-primary-600' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* API Key Input */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            OpenAI API Key
            <span className="ml-2 text-xs text-neutral-500">(stored locally in your browser)</span>
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full rounded-lg border border-neutral-300 px-4 py-2 pr-10 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600"
                title={showApiKey ? 'Hide API key' : 'Show API key'}
              >
                {showApiKey ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Get your API key from{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              platform.openai.com/api-keys
            </a>
          </p>
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Model</label>
          <select
            value={config.model}
            onChange={(e) => setConfig({ ...config, model: e.target.value as AIConfig['model'] })}
            className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="gpt-4o-mini">GPT-4o Mini (Recommended - Fast & Cost-effective)</option>
            <option value="gpt-4">GPT-4 (More capable, higher cost)</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fastest, lowest cost)</option>
          </select>
          <p className="mt-2 text-xs text-neutral-500">
            GPT-4o Mini offers the best balance of speed, capability, and cost for transformation planning
          </p>
        </div>

        {/* Test Connection */}
        <div className="flex gap-3">
          <button onClick={handleTest} disabled={testing || !config.enabled || !config.apiKey} className="btn-secondary">
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={handleSave}
            disabled={!config.enabled || !config.apiKey}
            className="btn-primary"
          >
            Save Settings
          </button>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`rounded-lg p-4 ${
              testResult.success
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <div className="flex gap-2">
              {testResult.success ? (
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
              <div className="flex-1 text-sm whitespace-pre-wrap">{testResult.message}</div>
            </div>
          </div>
        )}
      </div>

      {/* AI Features Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">AI-Powered Features</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-6 w-6 flex-shrink-0 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <div>
              <h4 className="font-semibold text-neutral-900">Assessment Analysis</h4>
              <p className="text-sm text-neutral-600">
                AI analyzes your assessment responses to identify key findings, risks, and opportunities
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <svg
              className="h-6 w-6 flex-shrink-0 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <div>
              <h4 className="font-semibold text-neutral-900">Enhanced Recommendations</h4>
              <p className="text-sm text-neutral-600">
                AI enhances transformation path recommendations with context-specific insights and justifications
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <svg
              className="h-6 w-6 flex-shrink-0 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <div>
              <h4 className="font-semibold text-neutral-900">Deliverable Generation</h4>
              <p className="text-sm text-neutral-600">
                AI generates professional executive summaries, SOWs, and transformation strategies from your data
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <svg
              className="h-6 w-6 flex-shrink-0 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="font-semibold text-neutral-900">Gap Analysis</h4>
              <p className="text-sm text-neutral-600">
                AI identifies gaps between current state and future state for each architectural tier
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="card border-2 border-yellow-200 bg-yellow-50">
        <div className="flex gap-3">
          <svg
            className="h-6 w-6 flex-shrink-0 text-yellow-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-2">Privacy & Security</h4>
            <ul className="space-y-1 text-sm text-yellow-800">
              <li>• Your API key is stored locally in your browser (never transmitted to our servers)</li>
              <li>• Assessment data is sent to OpenAI only when you use AI features</li>
              <li>
                • OpenAI processes data according to their{' '}
                <a
                  href="https://openai.com/policies/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  privacy policy
                </a>
              </li>
              <li>• You can disable AI features at any time to keep all data offline</li>
              <li>• Consider using AI-Free transformation path for sensitive projects</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
