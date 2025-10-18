// Question Guidance - Detailed help for interviewers to gather complete information

import type { Phase, Tier } from '../types'

export interface QuestionGuidance {
  phase: Phase
  tier: Tier
  track: 'BUSINESS' | 'TECHNICAL'

  // Core guidance
  whatToAsk: string // Detailed explanation of what this question is trying to uncover
  whyItMatters: string // Why this information is critical for SOW
  expectedDetail: string // What level of detail is required

  // Interview tips
  talkingPoints: string[] // Key points to discuss during interview
  followUpQuestions: string[] // Suggested follow-up questions
  commonPitfalls: string[] // What to avoid or watch out for

  // Evidence and validation
  evidenceToCollect: string[] // What supporting evidence/docs to request
  goodExamples: string[] // Examples of good responses
  redFlags: string[] // Warning signs of incomplete/problematic answers

  // SOW mapping
  sowSections: string[] // Which SOW sections this feeds into
  requiredForSOW: boolean // Is this required to generate SOW?
  minimumWords: number // Minimum response length for quality
}

// Discovery Phase - UI Tier Guidance
export const discoveryUIGuidance: Partial<Record<string, QuestionGuidance>> = {
  'top-3-journeys': {
    phase: 'DISCOVERY',
    tier: 'UI',
    track: 'BUSINESS',
    whatToAsk: 'Identify the three most critical user journeys that need improvement. For each journey, understand the current pain points, desired outcomes, and how success will be measured.',
    whyItMatters: 'This prioritizes UI transformation efforts and ensures we focus on high-impact areas. These journeys will drive the UI modernization roadmap and budget allocation.',
    expectedDetail: 'For each of the 3 journeys: (1) Name and description, (2) Current problems and user friction points, (3) Desired future state, (4) Specific success metrics (e.g., "reduce checkout time from 5 min to 2 min" or "increase completion rate from 60% to 85%")',

    talkingPoints: [
      'Ask: "Which user workflows cause the most support tickets or complaints?"',
      'Ask: "Where do users abandon processes most frequently?"',
      'Ask: "If you could only fix 3 things in the UI, what would they be and why?"',
      'Request: "Show me the current user flow and where it breaks down"',
      'Quantify: "How many users/transactions are affected? What\'s the business impact?"'
    ],

    followUpQuestions: [
      'What data are you currently collecting about these journeys?',
      'Do you have user feedback, analytics, or session recordings?',
      'Are these journeys different across user roles or segments?',
      'What compliance or accessibility requirements apply to these journeys?',
      'Are there seasonal or volume fluctuations that affect these workflows?'
    ],

    commonPitfalls: [
      'Accepting vague answers like "improve user experience" without specific journeys',
      'Not quantifying current state metrics (you need baseline data)',
      'Failing to identify WHO the users are (internal staff, external customers, admins?)',
      'Missing business impact (how does this affect revenue, efficiency, or compliance?)',
      'Not documenting current vs desired state clearly'
    ],

    evidenceToCollect: [
      'Screenshots or screen recordings of current user flows',
      'Analytics data showing drop-off rates or completion times',
      'User feedback or support ticket themes',
      'Wireframes or mockups of desired future state (if available)',
      'Business case or ROI calculations'
    ],

    goodExamples: [
      '"Journey 1: Patient appointment booking. Currently takes 12 clicks and 8 minutes, 40% abandon before completing. Target: 4 clicks, 3 minutes, <10% abandonment. Success: measured via Google Analytics funnel."',
      '"Journey 2: Invoice approval workflow. Current: manual email-based, takes 5-7 days, no audit trail. Desired: automated workflow with notifications, <24hr approval, full audit log. Metric: average approval time."',
      '"Journey 3: Product search and filtering. Current: 65% of searches return no results, users give up. Desired: intelligent search with suggestions, filter by multiple attributes. Target: <5% zero-result searches."'
    ],

    redFlags: [
      'Responses without specific metrics or measurements',
      'No clear user personas or roles identified',
      'Vague success criteria like "better UX" or "more modern"',
      'No mention of data sources or how improvements will be measured',
      'Stakeholders can\'t agree on priorities or outcomes'
    ],

    sowSections: [
      'Executive Summary - Business Drivers',
      'Current State Assessment - UI Analysis',
      'Requirements - Functional Requirements',
      'Scope of Work - UI Modernization',
      'Success Criteria and KPIs'
    ],

    requiredForSOW: true,
    minimumWords: 150
  },

  'ui-stacks-telemetry': {
    phase: 'DISCOVERY',
    tier: 'UI',
    track: 'TECHNICAL',
    whatToAsk: 'Document all front-end technologies currently in use (frameworks, libraries, build tools). Determine if they have analytics, error tracking, and user behavior monitoring in place.',
    whyItMatters: 'Understanding the current tech stack informs migration strategy, effort estimates, and identifies technical debt. Telemetry determines our ability to measure success and troubleshoot issues.',
    expectedDetail: 'List every UI framework/library with versions (e.g., "React 16.8, jQuery 3.2, Angular 1.5 for legacy modules"). Document analytics tools (Google Analytics, Mixpanel, etc.), error tracking (Sentry, Rollbar), session replay tools, and A/B testing platforms. Note any gaps.',

    talkingPoints: [
      'Ask: "Walk me through your front-end technology stack from development to production"',
      'Ask: "How do you currently track errors and performance issues in production?"',
      'Ask: "What analytics do you use to understand user behavior?"',
      'Request: "Show me your package.json or dependency files"',
      'Inquire: "How old are these technologies? When were they last updated?"'
    ],

    followUpQuestions: [
      'Are there different stacks for different parts of the application?',
      'Do you have technical documentation for your current architecture?',
      'What browser/device compatibility requirements do you have?',
      'Are there known security vulnerabilities in your current stack?',
      'What is your current build and deployment process?',
      'Do you have automated testing? What coverage percentage?'
    ],

    commonPitfalls: [
      'Getting only high-level answers ("we use React") without version numbers',
      'Missing hybrid or legacy systems that still exist',
      'Not documenting internal custom libraries or frameworks',
      'Failing to identify monitoring gaps (many orgs have NO error tracking)',
      'Not understanding browser/device requirements and constraints'
    ],

    evidenceToCollect: [
      'package.json or requirements.txt files',
      'Architecture diagrams or documentation',
      'Screenshots of analytics dashboards',
      'Error tracking system access (to see what\'s being monitored)',
      'Build pipeline configuration files',
      'Browser compatibility matrix'
    ],

    goodExamples: [
      '"Primary stack: React 18.2, TypeScript 4.9, Vite bundler. Legacy admin portal still on Angular 1.6 (20% of codebase). Analytics: Google Analytics 4 + Mixpanel for user events. Error tracking: Sentry for production errors. NO session replay or A/B testing currently."',
      '"Hybrid: Main app is Vue 2.7, mobile uses React Native 0.70. Dependencies 18 months behind latest. Telemetry: Custom event tracking to internal database, no third-party analytics. Rollbar for errors. Browser requirements: IE11 support (10% of users) preventing upgrade to Vue 3."'
    ],

    redFlags: [
      'Unknown technology versions or "latest" (shows lack of control)',
      'No monitoring or analytics whatsoever',
      'Critical dependencies with known security vulnerabilities',
      'Technology choices that conflict with stated requirements',
      'No one knows the full picture or tech stack inventory'
    ],

    sowSections: [
      'Current State Assessment - Technical Inventory',
      'Technical Debt Analysis',
      'Migration Strategy and Approach',
      'Technology Recommendations',
      'Monitoring and Observability Requirements'
    ],

    requiredForSOW: true,
    minimumWords: 100
  }
}

// General guidance by tier and track
export const tierGuidanceTemplates: Record<Tier, { business: string; technical: string }> = {
  UI: {
    business: 'Focus on user experience, business workflows, accessibility requirements, and measurable UX improvements. Understand who the users are, what they need to accomplish, and how success is measured.',
    technical: 'Document all front-end technologies, frameworks, build tools, browser requirements, performance metrics, and monitoring tools. Understand current technical constraints and modernization opportunities.'
  },
  API: {
    business: 'Identify key business capabilities, integration requirements, partner ecosystems, SLA needs, and scalability demands. Understand which services are business-critical and their availability requirements.',
    technical: 'Map all APIs, services, and integrations. Document authentication methods, rate limits, error handling, versioning strategy, and API gateway configuration. Identify direct database access that should be abstracted.'
  },
  DATA: {
    business: 'Understand data-driven decisions, reporting needs, data quality issues, compliance requirements (GDPR, HIPAA, etc.), and business intelligence needs. Identify data that could enable AI/ML capabilities.',
    technical: 'Catalog all data sources, schemas, pipelines, ETL processes, and data quality checks. Document data governance, access controls, backup/recovery, and any data contracts or SLAs.'
  },
  CLOUD: {
    business: 'Determine budget constraints, regional requirements, scalability needs, disaster recovery expectations, and cost optimization priorities. Understand seasonal or campaign-driven scaling patterns.',
    technical: 'Document current infrastructure (on-prem, cloud, hybrid), provisioning processes (IaC vs manual), monitoring, autoscaling, security policies, and disaster recovery capabilities.'
  },
  AI: {
    business: 'Identify low-risk AI opportunities (copilots, RAG, automation), compliance constraints (PHI, PII, FERPA), acceptable use cases, and governance requirements. Understand stakeholder comfort with AI.',
    technical: 'Document existing AI/ML pilots, model deployment infrastructure, evaluation frameworks, guardrails, prompt management, and integration with existing systems. Assess data readiness for AI.'
  }
}

// Response quality scoring criteria
export interface ResponseQualityCheck {
  criterion: string
  weight: number // 0-1, how important is this?
  check: (response: string) => boolean
  feedback: string // What to tell the interviewer if this fails
}

export const qualityChecks: ResponseQualityCheck[] = [
  {
    criterion: 'Minimum length',
    weight: 0.1,
    check: (r) => r.trim().split(/\s+/).length >= 20,
    feedback: 'Response is too brief. Aim for at least 20 words with specific details.'
  },
  {
    criterion: 'Contains metrics',
    weight: 0.25,
    check: (r) => /\d+/.test(r) || /percent|%|rate|time|count|number|metric/i.test(r),
    feedback: 'Add specific metrics or measurements (e.g., "40% of users", "5-minute process", "200 transactions/day").'
  },
  {
    criterion: 'Mentions specific tools/tech',
    weight: 0.2,
    check: (r) => /[A-Z][a-z]+\s?[A-Z]|[A-Z]{2,}|\d+\.\d+/.test(r),
    feedback: 'Include specific tool names, technologies, or versions (e.g., "React 18", "Azure", "Salesforce").'
  },
  {
    criterion: 'Avoids vague language',
    weight: 0.15,
    check: (r) => !/(?:improve|better|enhance|optimize|modernize)\s+(?:the|our|their)(?!\s+\w+\s+(?:from|to|by))/i.test(r),
    feedback: 'Avoid vague terms like "improve UX" - be specific about what and how (e.g., "reduce login time from 30s to 5s").'
  },
  {
    criterion: 'Includes current state',
    weight: 0.15,
    check: (r) => /current|currently|today|existing|as-is|now|present/i.test(r),
    feedback: 'Describe the CURRENT state, not just desired future state.'
  },
  {
    criterion: 'Includes future state or goal',
    weight: 0.15,
    check: (r) => /target|goal|desired|future|should|will|plan|to-be|aim/i.test(r),
    feedback: 'Describe the DESIRED future state or goal, not just current problems.'
  }
]

export function scoreResponseQuality(response: string): {
  score: number // 0-100
  passedChecks: string[]
  failedChecks: string[]
  feedback: string[]
} {
  let totalWeight = 0
  let earnedWeight = 0
  const passed: string[] = []
  const failed: string[] = []
  const feedback: string[] = []

  for (const check of qualityChecks) {
    totalWeight += check.weight
    if (check.check(response)) {
      earnedWeight += check.weight
      passed.push(check.criterion)
    } else {
      failed.push(check.criterion)
      feedback.push(check.feedback)
    }
  }

  const score = Math.round((earnedWeight / totalWeight) * 100)

  return { score, passedChecks: passed, failedChecks: failed, feedback }
}
