import { useState, useEffect } from 'react'

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Ensure viewport is set correctly on mobile
  useEffect(() => {
    // Fix for mobile viewport issues
    const viewport = document.querySelector('meta[name=viewport]')
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes')
    }
  }, [])

  return (
    <div className="min-h-screen bg-white" style={{ background: 'linear-gradient(to bottom, #faf8fc, #ffffff, #fafafa)' }}>
      {/* Mobile-Optimized Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">DF</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-neutral-900">DigiForm</h1>
                <p className="text-xs text-neutral-500">Digital Transformation</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-neutral-900">DigiForm</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                How It Works
              </a>
              <a href="#benefits" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                Benefits
              </a>
              <button
                onClick={onGetStarted}
                className="btn-primary text-sm sm:text-base"
              >
                Get Started Free
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
            <div className="md:hidden py-4 space-y-3 border-t border-neutral-200">
              <a
                href="#features"
                className="block px-4 py-2 text-neutral-600 hover:bg-neutral-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block px-4 py-2 text-neutral-600 hover:bg-neutral-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#benefits"
                className="block px-4 py-2 text-neutral-600 hover:bg-neutral-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Benefits
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  onGetStarted()
                }}
                className="w-full btn-primary"
              >
                Get Started Free
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Mobile Optimized */}
      <section className="pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 sm:space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-100 text-primary-700 rounded-full text-xs sm:text-sm font-medium">
              <span className="mr-2">✨</span>
              Offline-First • Privacy-Focused • No Installation Required
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight px-4">
              Transform Your Organization
              <span className="block text-primary-600 mt-2">With Confidence</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto px-4">
              A comprehensive planning system for digital transformation across UI, API, Data, Cloud, and AI tiers.
              <span className="block mt-2 font-medium text-neutral-700">
                Built for consultants. Trusted by enterprises.
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-4 px-4">
              <button
                onClick={onGetStarted}
                className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
              >
                Start Planning Now →
              </button>
              <a
                href="#how-it-works"
                className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
              >
                See How It Works
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 sm:pt-12 flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-neutral-500">
              <div className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                100% Browser-Based
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No Credit Card
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Works Offline
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Mobile Optimized */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Everything You Need to Plan Digital Transformation
            </h2>
            <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
              From discovery to delivery, our comprehensive framework guides you through every step.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="card hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-2">
                Structured Assessments
              </h3>
              <p className="text-sm sm:text-base text-neutral-600">
                100+ interview questions across all architectural tiers. Document current state and design future state with confidence.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-2">
                Four-Corner Framework
              </h3>
              <p className="text-sm sm:text-base text-neutral-600">
                Visualize current vs. future state for UI and Data Platform. Track transformation progress in real-time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-2">
                Dual-Path Methodology
              </h3>
              <p className="text-sm sm:text-base text-neutral-600">
                AI-Included or AI-Free transformation paths. Choose based on compliance requirements and organizational readiness.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-2">
                Offline-First Design
              </h3>
              <p className="text-sm sm:text-base text-neutral-600">
                Work anywhere, anytime. All data stored locally in your browser. Export when ready to share.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-2">
                Export to Any Format
              </h3>
              <p className="text-sm sm:text-base text-neutral-600">
                Generate SOW documents in PDF, PowerPoint, or Markdown. Professional deliverables in seconds.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-2">
                Stakeholder Management
              </h3>
              <p className="text-sm sm:text-base text-neutral-600">
                Track stakeholders, collect approvals, and manage feedback across all transformation phases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Mobile Optimized */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Simple, Powerful Workflow
            </h2>
            <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
              Get started in minutes. No installation, no complex setup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl sm:text-3xl font-bold">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-2">
                Create Project
              </h3>
              <p className="text-sm sm:text-base text-neutral-600">
                Name your transformation initiative and choose your path (AI-Included or AI-Free).
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl sm:text-3xl font-bold">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-2">
                Conduct Assessments
              </h3>
              <p className="text-sm sm:text-base text-neutral-600">
                Answer structured questions across UI, API, Data, Cloud, and AI tiers.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl sm:text-3xl font-bold">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-2">
                Visualize & Plan
              </h3>
              <p className="text-sm sm:text-base text-neutral-600">
                See your four-corner diagram and create detailed roadmaps with timelines.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl sm:text-3xl font-bold">
                4
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-2">
                Export Deliverables
              </h3>
              <p className="text-sm sm:text-base text-neutral-600">
                Generate SOW documents, presentations, and reports in your preferred format.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12 sm:mt-16">
            <button
              onClick={onGetStarted}
              className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 inline-flex items-center"
            >
              Start Your First Project
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Benefits - Mobile Optimized */}
      <section id="benefits" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Content */}
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900">
                Why DigiForm?
              </h2>
              <p className="text-base sm:text-lg text-neutral-600">
                Built by transformation consultants, for transformation consultants. Based on 500+ pages of proven methodology.
              </p>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-1">
                      Privacy-First Architecture
                    </h3>
                    <p className="text-sm sm:text-base text-neutral-600">
                      Your data never leaves your browser. Perfect for sensitive client information.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-1">
                      Comprehensive Coverage
                    </h3>
                    <p className="text-sm sm:text-base text-neutral-600">
                      100+ discovery questions covering all architectural tiers and transformation phases.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-1">
                      Professional Deliverables
                    </h3>
                    <p className="text-sm sm:text-base text-neutral-600">
                      Generate client-ready SOW documents, presentations, and roadmaps instantly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-1">
                      Compliance-Ready
                    </h3>
                    <p className="text-sm sm:text-base text-neutral-600">
                      Built-in support for GDPR, HIPAA, PCI-DSS, and 20+ other frameworks.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual/Stats */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="card text-center p-6 sm:p-8">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-600 mb-2">500+</div>
                <div className="text-sm sm:text-base text-neutral-600">Pages of Documentation</div>
              </div>
              <div className="card text-center p-6 sm:p-8">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-600 mb-2">100+</div>
                <div className="text-sm sm:text-base text-neutral-600">Assessment Questions</div>
              </div>
              <div className="card text-center p-6 sm:p-8">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-600 mb-2">5</div>
                <div className="text-sm sm:text-base text-neutral-600">Architectural Tiers</div>
              </div>
              <div className="card text-center p-6 sm:p-8">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-600 mb-2">20+</div>
                <div className="text-sm sm:text-base text-neutral-600">Compliance Frameworks</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Mobile Optimized */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Ready to Transform?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-primary-100">
            Start planning your digital transformation today. No installation, no credit card required.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-primary-600 hover:bg-primary-50 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
          >
            Launch DigiForm Now
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="text-sm text-primary-200 pt-2">
            Works in any modern browser • Chrome, Firefox, Safari, Edge
          </p>
        </div>
      </section>

      {/* Footer - Mobile Optimized */}
      <footer className="bg-neutral-900 text-neutral-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">DF</span>
                </div>
                <span className="text-white font-bold text-lg">DigiForm</span>
              </div>
              <p className="text-sm text-neutral-500">
                Digital Transformation Planning System
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-primary-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-primary-400 transition-colors">How It Works</a></li>
                <li><a href="#benefits" className="hover:text-primary-400 transition-colors">Benefits</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Playbook</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Templates</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-8 text-center text-sm">
            <p>&copy; 2025 DigiForm. All rights reserved. • Offline-First • Privacy-Focused</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
