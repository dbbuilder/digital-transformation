import { useState, useEffect, lazy, Suspense } from 'react'
import { WelcomeModal, useWelcomeModal } from './components/onboarding/WelcomeModal'
import { LandingPage } from './components/landing/LandingPage'
import { useAppStore } from './stores/useAppStore'
import { db } from './lib/database'

// Lazy load heavy components for better initial load performance
const AssessmentsPage = lazy(() => import('./components/assessments/AssessmentsPage').then(m => ({ default: m.AssessmentsPage })))
const ProjectsPage = lazy(() => import('./components/projects/ProjectsPage').then(m => ({ default: m.ProjectsPage })))
const EducationHub = lazy(() => import('./components/education/EducationHub').then(m => ({ default: m.EducationHub })))
const CreateProjectModal = lazy(() => import('./components/projects/CreateProjectModal').then(m => ({ default: m.CreateProjectModal })))
const DevTools = lazy(() => import('./components/admin/DevTools').then(m => ({ default: m.DevTools })))
const PathRecommendationView = lazy(() => import('./components/decision/PathRecommendation').then(m => ({ default: m.PathRecommendationView })))
const SettingsView = lazy(() => import('./components/settings/SettingsView').then(m => ({ default: m.SettingsView })))
const DeliverablesView = lazy(() => import('./components/deliverables/DeliverablesView').then(m => ({ default: m.DeliverablesView })))

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm m-4">
      <div className="text-center p-8">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-neutral-900 font-semibold text-lg">Loading...</p>
        <p className="text-neutral-600 text-sm mt-2">Please wait</p>
      </div>
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'home' | 'projects' | 'about' | 'assessments' | 'decision' | 'deliverables' | 'education' | 'settings'>('landing')
  const [sampleProjectId, setSampleProjectId] = useState<number | null>(null)
  const [assessmentProjectId, setAssessmentProjectId] = useState<number | null>(null)
  const { showWelcome, handleComplete } = useWelcomeModal()
  const { setCreateProjectModalOpen } = useAppStore()

  // Always start on landing page - user must click "Get Started" to enter app
  // This ensures every visitor sees the marketing page
  useEffect(() => {
    // Allow forcing landing page with ?landing=true parameter (already default)
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('app') === 'true') {
      // Allow direct link to app with ?app=true
      setActiveTab('home')
    }
    // Otherwise stay on landing page (default state)
  }, [])

  // DEBUG: Track activeTab changes
  useEffect(() => {
    console.log('=== ACTIVE TAB CHANGED ===', activeTab)
    alert('ActiveTab changed to: ' + activeTab)
  }, [activeTab])

  // Get the sample project ID on mount
  useEffect(() => {
    async function getSampleProject() {
      const projects = await db.projects.toArray()
      if (projects.length > 0) {
        setSampleProjectId(projects[0].id!)
      }
    }
    getSampleProject()
  }, [])

  // Handle navigation to assessments from project detail
  function handleNavigateToAssessments(projectId: number) {
    setAssessmentProjectId(projectId)
    setActiveTab('assessments')
  }

  // Handle Get Started from landing page
  function handleGetStarted() {
    alert('handleGetStarted called! Current tab: ' + activeTab)
    console.log('========================================')
    console.log('HANDLE GET STARTED CALLED')
    console.log('Current activeTab:', activeTab)
    console.log('Setting activeTab to: home')
    console.log('========================================')

    setActiveTab('home')

    // Force a re-render check after state update
    setTimeout(() => {
      alert('After timeout - activeTab is now: ' + activeTab)
    }, 100)

    console.log('========================================')
    console.log('After setActiveTab, activeTab should be home')
    console.log('========================================')
  }

  // Show landing page if on landing tab
  if (activeTab === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />
  }

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className={`min-h-screen ${activeTab === 'home' ? 'bg-blue-200' : 'bg-neutral-50'}`}>
      {/* Debug Info - Remove after testing */}
      {console.log('=== APP RENDER ===', 'activeTab:', activeTab, 'createProjectModalOpen:', useAppStore.getState().createProjectModalOpen)}

      {/* MASSIVE DEBUG OVERLAY */}
      <div className="fixed top-0 left-0 bg-black text-white p-2 z-[9999] text-xs">
        ActiveTab: {activeTab} | Time: {new Date().toISOString()}
      </div>

      {/* Header - Mobile Optimized */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Responsive */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">DF</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-neutral-900">Digital Transformation</h1>
                <p className="text-xs text-neutral-500">Planning System</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-neutral-900">DigiForm</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                  activeTab === 'home'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                  activeTab === 'projects'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab('assessments')}
                className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                  activeTab === 'assessments'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Assessments
              </button>
              <button
                onClick={() => setActiveTab('decision')}
                className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                  activeTab === 'decision'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Decision
              </button>
              <button
                onClick={() => setActiveTab('deliverables')}
                className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                  activeTab === 'deliverables'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Deliverables
              </button>
              <button
                onClick={() => setActiveTab('education')}
                className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                  activeTab === 'education'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Education
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                  activeTab === 'settings'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Settings
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                  activeTab === 'about'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                About
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-600 hover:text-neutral-900"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t border-neutral-200">
              <button
                onClick={() => {
                  setActiveTab('home')
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'home'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  setActiveTab('projects')
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'projects'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => {
                  setActiveTab('assessments')
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'assessments'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Assessments
              </button>
              <button
                onClick={() => {
                  setActiveTab('decision')
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'decision'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Decision
              </button>
              <button
                onClick={() => {
                  setActiveTab('deliverables')
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'deliverables'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Deliverables
              </button>
              <button
                onClick={() => {
                  setActiveTab('education')
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'education'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Education
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings')
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Settings
              </button>
              <button
                onClick={() => {
                  setActiveTab('about')
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'about'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                About
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 min-h-[calc(100vh-4rem)]">
        {/* Visible debug indicator - remove after testing */}
        {activeTab === 'home' && (
          <div className="fixed top-20 right-4 bg-green-500 text-white px-3 py-1 rounded text-xs z-50">
            Home Tab Active
          </div>
        )}

        {activeTab === 'home' && (
          <div className="space-y-6 sm:space-y-8">
            {/* MASSIVE OBVIOUS INDICATOR */}
            <div className="bg-red-600 text-white p-8 text-center font-bold text-4xl rounded-lg mb-4 border-8 border-yellow-300">
              ✅ HOME PAGE IS SHOWING!
              <div className="text-2xl mt-4">
                If you see this, the page loaded successfully
              </div>
            </div>

            {/* CACHE BUSTER - VERSION 2025-10-20 04:40 */}
            <div className="bg-yellow-300 text-black p-4 text-center font-bold text-xl rounded-lg mb-4">
              ⚡ CACHE BUSTED - VERSION 04:40 ⚡
            </div>

            {/* Hero Section - Mobile Optimized */}
            <div className="text-center space-y-4 sm:space-y-6 bg-gradient-to-br from-primary-100 to-white p-8 rounded-lg shadow-lg border-2 border-primary-300">
              <div className="text-primary-600 font-bold text-sm uppercase tracking-wide mb-2">
                🚀 Welcome to DigiForm
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900">
                Transform Your Organization
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-neutral-700 max-w-2xl mx-auto">
                A comprehensive planning system for digital transformation across
                UI, API, Data, Cloud, and AI tiers.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-4 px-4">
                <button
                  onClick={() => {
                    console.log('Create Project button clicked!')
                    console.log('setCreateProjectModalOpen:', typeof setCreateProjectModalOpen)
                    setCreateProjectModalOpen(true)
                    console.log('Modal state should be set to true')
                  }}
                  className="btn-primary w-full sm:w-auto text-sm sm:text-base"
                >
                  Create New Project
                </button>
                <button
                  onClick={() => setActiveTab('education')}
                  className="btn-secondary w-full sm:w-auto text-sm sm:text-base"
                >
                  View Documentation
                </button>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 gap-6 pt-8">
              <div className="card hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      Assessment & Planning
                    </h3>
                    <p className="text-neutral-600">
                      Comprehensive interview templates across all transformation tiers.
                      Document current state and design future state architecture.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      Four-Corner Framework
                    </h3>
                    <p className="text-neutral-600">
                      Visualize current vs. future state for UI and Data Platform.
                      Track transformation progress across all tiers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      Dual-Path Support
                    </h3>
                    <p className="text-neutral-600">
                      Choose AI-Included or AI-Free transformation paths based on
                      compliance requirements and organizational readiness.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      Offline-First
                    </h3>
                    <p className="text-neutral-600">
                      All data stored locally in your browser. Work anywhere, anytime.
                      Export your plans when ready to share.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Palette Demo */}
            <div className="card mt-12">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Design System Preview
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-neutral-700 mb-2">Primary (Pastel Lilac)</p>
                  <div className="flex gap-2">
                    <div className="w-16 h-16 bg-primary-50 rounded-lg border border-neutral-200 flex items-center justify-center text-xs">50</div>
                    <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center text-xs">100</div>
                    <div className="w-16 h-16 bg-primary-200 rounded-lg flex items-center justify-center text-xs">200</div>
                    <div className="w-16 h-16 bg-primary-300 rounded-lg flex items-center justify-center text-xs">300</div>
                    <div className="w-16 h-16 bg-primary-400 rounded-lg flex items-center justify-center text-xs text-white">400</div>
                    <div className="w-16 h-16 bg-primary-500 rounded-lg flex items-center justify-center text-xs text-white">500</div>
                    <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center text-xs text-white">600</div>
                    <div className="w-16 h-16 bg-primary-700 rounded-lg flex items-center justify-center text-xs text-white">700</div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-700 mb-2">Neutral (Black to White)</p>
                  <div className="flex gap-2">
                    <div className="w-16 h-16 bg-white rounded-lg border border-neutral-300 flex items-center justify-center text-xs">white</div>
                    <div className="w-16 h-16 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-center text-xs">50</div>
                    <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center text-xs">200</div>
                    <div className="w-16 h-16 bg-neutral-400 rounded-lg flex items-center justify-center text-xs text-white">400</div>
                    <div className="w-16 h-16 bg-neutral-600 rounded-lg flex items-center justify-center text-xs text-white">600</div>
                    <div className="w-16 h-16 bg-neutral-800 rounded-lg flex items-center justify-center text-xs text-white">800</div>
                    <div className="w-16 h-16 bg-neutral-900 rounded-lg flex items-center justify-center text-xs text-white">900</div>
                    <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center text-xs text-white">black</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <ProjectsPage onNavigateToAssessments={handleNavigateToAssessments} />
        )}

        {activeTab === 'about' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-neutral-900">About This System</h2>
            <div className="card">
              <p className="text-neutral-700 leading-relaxed mb-4">
                The Digital Transformation Planning System is a comprehensive framework for guiding
                organizations through their digital evolution journey.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                Built on the proven <strong>Four-Corner Framework</strong>, this system helps you document
                current state, design future state, and create actionable roadmaps across five architectural
                tiers: UI/UX, API/Microservices, Data Platform, Cloud Infrastructure, and AI/External Services.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">Key Features</h3>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>500+ pages of comprehensive planning documentation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>100+ discovery interview questions across all tiers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Dual-path methodology (AI-Included / AI-Free)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>20+ compliance frameworks (GDPR, HIPAA, PCI-DSS, etc.)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Offline-first architecture for maximum privacy</span>
                </li>
              </ul>
            </div>

            {/* Developer Tools */}
            <DevTools />
          </div>
        )}

        {activeTab === 'assessments' && (assessmentProjectId || sampleProjectId) && (
          <AssessmentsPage projectId={assessmentProjectId || sampleProjectId!} />
        )}

        {activeTab === 'assessments' && !assessmentProjectId && !sampleProjectId && (
          <div className="text-center py-12">
            <div className="text-neutral-500">Loading project...</div>
          </div>
        )}

        {activeTab === 'decision' && sampleProjectId && (
          <PathRecommendationView projectId={sampleProjectId} />
        )}

        {activeTab === 'decision' && !sampleProjectId && (
          <div className="text-center py-12">
            <div className="text-neutral-500">Loading project...</div>
          </div>
        )}

        {activeTab === 'deliverables' && sampleProjectId && (
          <DeliverablesView projectId={sampleProjectId} />
        )}

        {activeTab === 'deliverables' && !sampleProjectId && (
          <div className="text-center py-12">
            <div className="text-neutral-500">Loading project...</div>
          </div>
        )}

        <Suspense fallback={<LoadingFallback />}>
          {activeTab === 'education' && <EducationHub />}

          {activeTab === 'settings' && <SettingsView />}
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-neutral-500">
            Digital Transformation Planning System • Offline-First • Privacy-Focused
          </p>
        </div>
      </footer>

      {/* Welcome Modal */}
      {showWelcome && <WelcomeModal onComplete={handleComplete} />}

      {/* Create Project Modal */}
      <Suspense fallback={null}>
        <CreateProjectModal />
      </Suspense>
    </div>
  )
}

export default App
