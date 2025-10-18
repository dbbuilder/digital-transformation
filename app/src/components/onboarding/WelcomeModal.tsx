// Welcome Modal - Onboarding experience for first-time users

import { useState, useEffect } from 'react'

interface WelcomeModalProps {
  onComplete: () => void
}

export function WelcomeModal({ onComplete }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: 'Welcome to Digital Transformation Planning',
      content: (
        <div className="space-y-4">
          <p className="text-lg text-neutral-700">
            A complete toolkit for planning and executing digital transformation initiatives across all
            five architectural tiers.
          </p>
          <div className="rounded-lg bg-primary-50 p-4">
            <h4 className="mb-2 font-semibold text-primary-900">What You Can Do</h4>
            <ul className="space-y-2 text-sm text-primary-800">
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Conduct discovery interviews with 40+ structured questions
              </li>
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Build four-corner framework diagrams
              </li>
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Create 32-week transformation roadmaps
              </li>
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Generate professional PowerPoint executive decks
              </li>
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Work completely offline with local data storage
              </li>
            </ul>
          </div>
        </div>
      ),
      icon: (
        <svg className="h-12 w-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      title: 'Dual-Path Methodology',
      content: (
        <div className="space-y-4">
          <p className="text-neutral-700">
            Choose the transformation path that fits your organization's readiness and compliance requirements.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <h4 className="font-semibold text-green-900">AI-Free Path</h4>
              </div>
              <p className="text-sm text-green-800">
                Deterministic, compliance-focused modernization without AI/ML. Perfect for healthcare, finance, and government.
              </p>
            </div>
            <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <h4 className="font-semibold text-purple-900">AI-Included Path</h4>
              </div>
              <p className="text-sm text-purple-800">
                Leverage AI/ML with proper governance and data quality. Requires AI readiness assessment.
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> The system supports both paths. You can decide during or after discovery phase.
            </p>
          </div>
        </div>
      ),
      icon: (
        <svg className="h-12 w-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      ),
    },
    {
      title: 'Offline-First & Privacy-Preserving',
      content: (
        <div className="space-y-4">
          <p className="text-neutral-700">
            All your data stays in your browser. No servers, no cloud sync, complete privacy.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h4 className="font-semibold text-neutral-900">Works Completely Offline</h4>
                <p className="text-sm text-neutral-600">
                  Use on planes, at remote client sites, or anywhere without internet. All features work offline.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h4 className="font-semibold text-neutral-900">Client Data Stays Local</h4>
                <p className="text-sm text-neutral-600">
                  All project data, assessments, and diagrams are stored in your browser's IndexedDB. Nothing is transmitted.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h4 className="font-semibold text-neutral-900">Export for Backup</h4>
                <p className="text-sm text-neutral-600">
                  Export projects to JSON for backup, sharing, or transfer between devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      icon: (
        <svg className="h-12 w-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
    {
      title: 'Ready to Get Started?',
      content: (
        <div className="space-y-4">
          <p className="text-neutral-700">Here's what to do next:</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                1
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900">Create Your First Project</h4>
                <p className="text-sm text-neutral-600">
                  Click "Projects" in the navigation, then "New Project" to set up your first transformation project.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                2
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900">Start Discovery Interviews</h4>
                <p className="text-sm text-neutral-600">
                  Navigate to Assessments and begin answering questions across all five tiers.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                3
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900">Explore Education Hub</h4>
                <p className="text-sm text-neutral-600">
                  Visit the Education tab to learn about the four-corner framework and transformation methodologies.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-yellow-50 p-4">
            <div className="flex gap-3">
              <svg className="h-5 w-5 flex-shrink-0 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h4 className="font-semibold text-yellow-900">Pro Tip</h4>
                <p className="text-sm text-yellow-800">
                  There's already a sample project created for you to explore. Check the Projects tab!
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      icon: (
        <svg className="h-12 w-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
          />
        </svg>
      ),
    },
  ]

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-neutral-200 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              {currentStepData.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-neutral-900">{currentStepData.title}</h2>
              <p className="text-sm text-neutral-600">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">{currentStepData.content}</div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-200 p-6">
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-12 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary-600'
                    : index < currentStep
                      ? 'bg-primary-300'
                      : 'bg-neutral-200'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button onClick={() => setCurrentStep(currentStep - 1)} className="btn-secondary">
                Previous
              </button>
            )}
            <button
              onClick={() => {
                if (isLastStep) {
                  onComplete()
                } else {
                  setCurrentStep(currentStep + 1)
                }
              }}
              className="btn-primary"
            >
              {isLastStep ? "Let's Go!" : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to manage welcome modal state
 */
export function useWelcomeModal() {
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    // Check if user has seen welcome modal
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
    if (!hasSeenWelcome) {
      setShowWelcome(true)
    }
  }, [])

  function handleComplete() {
    localStorage.setItem('hasSeenWelcome', 'true')
    setShowWelcome(false)
  }

  return { showWelcome, handleComplete }
}
