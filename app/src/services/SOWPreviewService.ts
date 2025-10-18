// SOW Preview Service - Transforms interview responses into SOW sections

import type { Assessment, InterviewResponse } from '../types'

export interface SOWSection {
  id: string
  title: string
  content: string
  quality: 'excellent' | 'good' | 'needs-work' | 'missing'
  sourceResponses: number[] // Response IDs that contributed to this section
  improvementSuggestions: string[]
}

export interface SOWPreview {
  executiveSummary: SOWSection
  currentStateAssessment: SOWSection
  businessDrivers: SOWSection
  proposedSolution: SOWSection
  scopeAndDeliverables: SOWSection
  successCriteria: SOWSection
  timeline: SOWSection
  assumptions: SOWSection
  completeness: number // 0-100
  readyForGeneration: boolean
}

/**
 * Generate a SOW preview from assessment responses
 */
export async function generateSOWPreview(
  assessment: Assessment,
  responses: InterviewResponse[]
): Promise<SOWPreview> {
  const executiveSummary = generateExecutiveSummary(responses)
  const currentState = generateCurrentStateAssessment(responses)
  const businessDrivers = generateBusinessDrivers(responses)
  const proposedSolution = generateProposedSolution(responses)
  const scope = generateScopeAndDeliverables(responses)
  const successCriteria = generateSuccessCriteria(responses)
  const timeline = generateTimeline(assessment)
  const assumptions = generateAssumptions(responses)

  const sections = [
    executiveSummary,
    currentState,
    businessDrivers,
    proposedSolution,
    scope,
    successCriteria,
    timeline,
    assumptions,
  ]

  const completeness = calculateCompleteness(sections)
  const readyForGeneration = completeness >= 70 && sections.every(s => s.quality !== 'missing')

  return {
    executiveSummary,
    currentStateAssessment: currentState,
    businessDrivers,
    proposedSolution,
    scopeAndDeliverables: scope,
    successCriteria,
    timeline,
    assumptions,
    completeness,
    readyForGeneration,
  }
}

function generateExecutiveSummary(responses: InterviewResponse[]): SOWSection {
  const relevantResponses = responses.filter(r =>
    r.question.toLowerCase().includes('journey') ||
    r.question.toLowerCase().includes('pain point') ||
    r.question.toLowerCase().includes('objective')
  )

  if (relevantResponses.length === 0) {
    return {
      id: 'exec-summary',
      title: 'Executive Summary',
      content: '[Needs interview data - Answer questions about user journeys, pain points, and business objectives]',
      quality: 'missing',
      sourceResponses: [],
      improvementSuggestions: [
        'Complete questions about top user journeys',
        'Document current pain points with metrics',
        'Define transformation objectives',
      ],
    }
  }

  const journeys = relevantResponses.filter(r => r.question.toLowerCase().includes('journey'))
  const painPoints = relevantResponses.filter(r => r.question.toLowerCase().includes('pain'))
  const objectives = relevantResponses.filter(r => r.question.toLowerCase().includes('objective'))

  let content = ''
  let quality: 'excellent' | 'good' | 'needs-work' = 'needs-work'
  const suggestions: string[] = []

  // Build executive summary content
  if (journeys.length > 0) {
    const journeyText = journeys.map(r => r.response).join(' ')
    content += `**Critical User Journeys**: ${extractKeyPoints(journeyText)}\n\n`
  } else {
    suggestions.push('Add information about critical user journeys')
  }

  if (painPoints.length > 0) {
    const painText = painPoints.map(r => r.response).join(' ')
    content += `**Current Challenges**: ${extractKeyPoints(painText)}\n\n`
  } else {
    suggestions.push('Document current pain points and challenges')
  }

  if (objectives.length > 0) {
    const objectiveText = objectives.map(r => r.response).join(' ')
    content += `**Transformation Objectives**: ${extractKeyPoints(objectiveText)}\n\n`
  } else {
    suggestions.push('Define clear transformation objectives')
  }

  // Assess quality
  const hasMetrics = relevantResponses.some(r => /\d+%|\$\d+|time|users|clicks/.test(r.response))
  const hasSpecifics = relevantResponses.some(r => r.response.length > 100)

  if (hasMetrics && hasSpecifics && suggestions.length === 0) {
    quality = 'excellent'
  } else if (hasMetrics || hasSpecifics) {
    quality = 'good'
    if (!hasMetrics) suggestions.push('Add quantifiable metrics (%, time, cost, user counts)')
    if (!hasSpecifics) suggestions.push('Provide more specific details in responses')
  }

  return {
    id: 'exec-summary',
    title: 'Executive Summary',
    content: content || '[Add more detail to generate executive summary]',
    quality,
    sourceResponses: relevantResponses.map(r => r.id),
    improvementSuggestions: suggestions,
  }
}

function generateCurrentStateAssessment(responses: InterviewResponse[]): SOWSection {
  const relevantResponses = responses.filter(r =>
    r.question.toLowerCase().includes('current') ||
    r.question.toLowerCase().includes('existing') ||
    r.question.toLowerCase().includes('technology') ||
    r.question.toLowerCase().includes('architecture')
  )

  if (relevantResponses.length === 0) {
    return {
      id: 'current-state',
      title: 'Current State Assessment',
      content: '[Needs interview data - Answer questions about current technologies, architecture, and processes]',
      quality: 'missing',
      sourceResponses: [],
      improvementSuggestions: [
        'Document current technology stack with versions',
        'Describe current architecture patterns',
        'Identify existing integrations and data flows',
      ],
    }
  }

  let content = '## Current State Assessment\n\n'
  const suggestions: string[] = []

  // Technology stack
  const techResponses = relevantResponses.filter(r =>
    r.question.toLowerCase().includes('technology') ||
    r.question.toLowerCase().includes('stack') ||
    r.question.toLowerCase().includes('tool')
  )

  if (techResponses.length > 0) {
    content += '### Technology Stack\n\n'
    techResponses.forEach(r => {
      content += `- **${extractTopic(r.question)}**: ${r.response}\n`
    })
    content += '\n'
  } else {
    suggestions.push('Document current technology stack with specific versions')
  }

  // Architecture
  const archResponses = relevantResponses.filter(r =>
    r.question.toLowerCase().includes('architecture') ||
    r.question.toLowerCase().includes('integration')
  )

  if (archResponses.length > 0) {
    content += '### Architecture & Integrations\n\n'
    archResponses.forEach(r => {
      content += `- **${extractTopic(r.question)}**: ${r.response}\n`
    })
    content += '\n'
  }

  // Quality assessment
  const hasTechVersions = relevantResponses.some(r => /v?\d+\.\d+|version \d+/i.test(r.response))
  const hasArchDetails = relevantResponses.some(r => r.response.length > 80)

  let quality: 'excellent' | 'good' | 'needs-work' = 'needs-work'
  if (hasTechVersions && hasArchDetails) {
    quality = 'excellent'
  } else if (hasTechVersions || hasArchDetails) {
    quality = 'good'
    if (!hasTechVersions) suggestions.push('Add specific technology versions')
    if (!hasArchDetails) suggestions.push('Provide more architectural details')
  }

  return {
    id: 'current-state',
    title: 'Current State Assessment',
    content,
    quality,
    sourceResponses: relevantResponses.map(r => r.id),
    improvementSuggestions: suggestions,
  }
}

function generateBusinessDrivers(responses: InterviewResponse[]): SOWSection {
  const relevantResponses = responses.filter(r =>
    r.question.toLowerCase().includes('business') ||
    r.question.toLowerCase().includes('impact') ||
    r.question.toLowerCase().includes('cost') ||
    r.question.toLowerCase().includes('revenue')
  )

  if (relevantResponses.length === 0) {
    return {
      id: 'business-drivers',
      title: 'Business Drivers',
      content: '[Needs interview data - Answer questions about business impact, ROI, and strategic objectives]',
      quality: 'missing',
      sourceResponses: [],
      improvementSuggestions: ['Document business impact and ROI expectations', 'Identify strategic drivers'],
    }
  }

  let content = '## Business Drivers\n\n'
  const suggestions: string[] = []

  relevantResponses.forEach(r => {
    content += `- **${extractTopic(r.question)}**: ${r.response}\n`
  })

  const hasFinancials = relevantResponses.some(r => /\$\d+|revenue|cost|savings/i.test(r.response))
  const hasMetrics = relevantResponses.some(r => /\d+%|time|efficiency/i.test(r.response))

  let quality: 'excellent' | 'good' | 'needs-work' = 'needs-work'
  if (hasFinancials && hasMetrics) {
    quality = 'excellent'
  } else if (hasFinancials || hasMetrics) {
    quality = 'good'
    if (!hasFinancials) suggestions.push('Add financial impact estimates (revenue, cost, savings)')
    if (!hasMetrics) suggestions.push('Include measurable business metrics')
  } else {
    suggestions.push('Add quantifiable business impact data')
  }

  return {
    id: 'business-drivers',
    title: 'Business Drivers',
    content,
    quality,
    sourceResponses: relevantResponses.map(r => r.id),
    improvementSuggestions: suggestions,
  }
}

function generateProposedSolution(responses: InterviewResponse[]): SOWSection {
  const relevantResponses = responses.filter(r =>
    r.question.toLowerCase().includes('future') ||
    r.question.toLowerCase().includes('target') ||
    r.question.toLowerCase().includes('solution') ||
    r.question.toLowerCase().includes('modern')
  )

  if (relevantResponses.length === 0) {
    return {
      id: 'proposed-solution',
      title: 'Proposed Solution',
      content: '[Needs interview data - Answer questions about target state, desired solutions, and future vision]',
      quality: 'missing',
      sourceResponses: [],
      improvementSuggestions: ['Define target state architecture', 'Specify desired technologies and patterns'],
    }
  }

  let content = '## Proposed Solution\n\n'
  const suggestions: string[] = []

  relevantResponses.forEach(r => {
    content += `- **${extractTopic(r.question)}**: ${r.response}\n`
  })

  const hasTechSpecs = relevantResponses.some(r => /react|angular|vue|api|cloud|aws|azure/i.test(r.response))
  const hasDetails = relevantResponses.every(r => r.response.length > 50)

  let quality: 'excellent' | 'good' | 'needs-work' = 'needs-work'
  if (hasTechSpecs && hasDetails) {
    quality = 'excellent'
  } else if (hasTechSpecs || hasDetails) {
    quality = 'good'
    if (!hasTechSpecs) suggestions.push('Specify target technologies and platforms')
    if (!hasDetails) suggestions.push('Provide more detailed solution descriptions')
  }

  return {
    id: 'proposed-solution',
    title: 'Proposed Solution',
    content,
    quality,
    sourceResponses: relevantResponses.map(r => r.id),
    improvementSuggestions: suggestions,
  }
}

function generateScopeAndDeliverables(responses: InterviewResponse[]): SOWSection {
  const relevantResponses = responses.filter(r =>
    r.question.toLowerCase().includes('deliverable') ||
    r.question.toLowerCase().includes('scope') ||
    r.question.toLowerCase().includes('phase')
  )

  const content = `## Scope and Deliverables

Based on the ${responses.length} assessment responses, the transformation will include:

### In Scope
- User interface modernization for identified critical journeys
- API layer development and integration
- Data platform migration and optimization
- Cloud infrastructure setup and configuration
${relevantResponses.length > 0 ? relevantResponses.map(r => `- ${r.response}`).join('\n') : ''}

### Out of Scope
- [To be defined based on interview responses]

### Key Deliverables
- Architecture documentation and diagrams
- Modernized user interfaces
- RESTful API services
- Data migration scripts and processes
- Cloud infrastructure as code
- Testing and quality assurance documentation
`

  const quality: 'excellent' | 'good' | 'needs-work' = relevantResponses.length >= 2 ? 'good' : 'needs-work'
  const suggestions = relevantResponses.length < 2 ? ['Define specific deliverables for each phase'] : []

  return {
    id: 'scope',
    title: 'Scope and Deliverables',
    content,
    quality,
    sourceResponses: relevantResponses.map(r => r.id),
    improvementSuggestions: suggestions,
  }
}

function generateSuccessCriteria(responses: InterviewResponse[]): SOWSection {
  const relevantResponses = responses.filter(r =>
    r.question.toLowerCase().includes('success') ||
    r.question.toLowerCase().includes('criteria') ||
    r.question.toLowerCase().includes('measure') ||
    r.question.toLowerCase().includes('kpi')
  )

  if (relevantResponses.length === 0) {
    return {
      id: 'success-criteria',
      title: 'Success Criteria',
      content: '[Needs interview data - Answer questions about success metrics, KPIs, and acceptance criteria]',
      quality: 'missing',
      sourceResponses: [],
      improvementSuggestions: ['Define measurable success criteria', 'Identify key performance indicators'],
    }
  }

  let content = '## Success Criteria\n\n'
  const suggestions: string[] = []

  content += 'The transformation will be considered successful when:\n\n'
  relevantResponses.forEach((r, idx) => {
    content += `${idx + 1}. ${r.response}\n`
  })

  const hasMetrics = relevantResponses.some(r => /\d+%|time|<|>|reduce|increase/i.test(r.response))
  const hasMeasurement = relevantResponses.some(r => /measure|track|analytics|monitor/i.test(r.response))

  let quality: 'excellent' | 'good' | 'needs-work' = 'needs-work'
  if (hasMetrics && hasMeasurement) {
    quality = 'excellent'
  } else if (hasMetrics || hasMeasurement) {
    quality = 'good'
    if (!hasMetrics) suggestions.push('Add specific quantifiable targets (%, time, count)')
    if (!hasMeasurement) suggestions.push('Define how success will be measured')
  }

  return {
    id: 'success-criteria',
    title: 'Success Criteria',
    content,
    quality,
    sourceResponses: relevantResponses.map(r => r.id),
    improvementSuggestions: suggestions,
  }
}

function generateTimeline(assessment: Assessment): SOWSection {
  const duration = assessment.phase === 'DISCOVERY' ? '4 weeks' : '8-12 weeks'

  const content = `## Project Timeline

**${assessment.phase} Phase**: ${duration}

This timeline will be refined based on the detailed assessment responses and final scope definition.`

  return {
    id: 'timeline',
    title: 'Timeline',
    content,
    quality: 'good',
    sourceResponses: [],
    improvementSuggestions: [],
  }
}

function generateAssumptions(responses: InterviewResponse[]): SOWSection {
  const content = `## Assumptions and Constraints

Based on the assessment responses, the following assumptions have been made:

- Client will provide access to necessary systems and environments
- Key stakeholders will be available for interviews and reviews
- Existing documentation will be provided where available
- Development and testing environments will be made available
- [Additional assumptions based on interview responses will be added]

### Constraints
- [To be defined based on interview responses regarding timelines, budgets, and resources]
`

  const quality: 'excellent' | 'good' | 'needs-work' = responses.length > 5 ? 'good' : 'needs-work'

  return {
    id: 'assumptions',
    title: 'Assumptions and Constraints',
    content,
    quality,
    sourceResponses: [],
    improvementSuggestions: quality === 'needs-work' ? ['Complete more assessment questions to refine assumptions'] : [],
  }
}

// Helper functions
function extractKeyPoints(text: string): string {
  // Simple extraction - in production would use NLP
  const sentences = text.split(/[.!?]\s+/)
  return sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '...' : '')
}

function extractTopic(question: string): string {
  // Extract key topic from question
  const match = question.match(/(?:What|How|Which|Describe)\s+(.+?)(?:\?|$)/i)
  return match ? match[1].trim() : 'Detail'
}

function calculateCompleteness(sections: SOWSection[]): number {
  const weights = {
    excellent: 1.0,
    good: 0.7,
    'needs-work': 0.4,
    missing: 0.0,
  }

  const total = sections.reduce((sum, section) => sum + weights[section.quality], 0)
  return Math.round((total / sections.length) * 100)
}
