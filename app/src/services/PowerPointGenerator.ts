/**
 * PowerPoint Executive Deck Generator
 *
 * Auto-generates professional slide decks from project data
 * - 10 standard slides covering transformation plan
 * - Custom branding support
 * - Four-corner diagram visualization
 * - Transformation path comparison
 */

import PptxGenJS from 'pptxgenjs'
import type { Project, AssessmentResponse, Tier } from '../types'
import type { PathRecommendation } from './PathRecommendationEngine'

const PRIMARY_COLOR = 'a687c0' // Pastel Lilac brand color
const ACCENT_COLOR = '6b5b95' // Darker purple
const NEUTRAL_COLOR = '666666'
const LIGHT_GRAY = 'f5f5f5'

export interface PowerPointOptions {
  includeCompanyLogo?: boolean
  logoUrl?: string
  companyName?: string
  consultantName?: string
  customPrimaryColor?: string
}

/**
 * Generate Executive Transformation Deck
 */
export async function generateExecutiveDeck(
  project: Project,
  responses: AssessmentResponse[],
  pathRecommendation: PathRecommendation | null,
  options?: PowerPointOptions
): Promise<Blob> {
  const pptx = new PptxGenJS()

  // Set presentation metadata
  pptx.author = options?.consultantName || 'DigiForm Consultant'
  pptx.company = options?.companyName || project.name
  pptx.subject = 'Digital Transformation Strategy'
  pptx.title = `${project.name} - Transformation Plan`

  // Define master layout
  pptx.defineLayout({ name: 'DIGIFORM', width: 10, height: 5.625 })
  pptx.layout = 'DIGIFORM'

  const primaryColor = options?.customPrimaryColor || PRIMARY_COLOR

  // Slide 1: Title Slide
  addTitleSlide(pptx, project, primaryColor, options)

  // Slide 2: Executive Summary
  addExecutiveSummarySlide(pptx, project, responses, pathRecommendation, primaryColor)

  // Slide 3: Four-Corner Framework Overview
  addFourCornerFrameworkSlide(pptx, primaryColor)

  // Slide 4: Current State Assessment
  addCurrentStateSlide(pptx, project, responses, primaryColor)

  // Slide 5: Future State Vision
  addFutureStateSlide(pptx, project, pathRecommendation, primaryColor)

  // Slide 6: Transformation Path Recommendation
  if (pathRecommendation) {
    addPathRecommendationSlide(pptx, pathRecommendation, primaryColor)
  }

  // Slides 7-11: Tier-by-Tier Roadmap (UI, API, Data, Cloud, AI)
  const tiers: Tier[] = ['UI', 'API', 'DATA', 'CLOUD', 'AI']
  for (const tier of tiers) {
    addTierRoadmapSlide(pptx, tier, responses, pathRecommendation, primaryColor)
  }

  // Slide 12: Timeline & Milestones
  addTimelineSlide(pptx, pathRecommendation, primaryColor)

  // Slide 13: Risks & Mitigation
  addRisksSlide(pptx, pathRecommendation, primaryColor)

  // Slide 14: Next Steps
  addNextStepsSlide(pptx, project, pathRecommendation, primaryColor)

  // Generate and return blob
  const blob = (await pptx.write({ outputType: 'blob' })) as Blob
  return blob
}

/**
 * Slide 1: Title Slide
 */
function addTitleSlide(
  pptx: PptxGenJS,
  project: Project,
  primaryColor: string,
  options?: PowerPointOptions
) {
  const slide = pptx.addSlide()

  // Background gradient
  slide.background = { color: 'FFFFFF' }

  // Title
  slide.addText(project.name, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 1.2,
    fontSize: 44,
    bold: true,
    color: primaryColor,
    align: 'center',
  })

  // Subtitle
  slide.addText('Digital Transformation Strategy', {
    x: 0.5,
    y: 2.8,
    w: 9,
    h: 0.6,
    fontSize: 24,
    color: NEUTRAL_COLOR,
    align: 'center',
  })

  // Transformation path badge
  const pathLabel =
    project.transformationPath === 'AI_INCLUDED'
      ? 'AI-Included Transformation'
      : project.transformationPath === 'AI_FREE'
        ? 'AI-Free Transformation'
        : 'Transformation Planning'

  slide.addText(pathLabel, {
    x: 3.5,
    y: 3.6,
    w: 3,
    h: 0.5,
    fontSize: 16,
    bold: true,
    color: 'FFFFFF',
    fill: { color: primaryColor },
    align: 'center',
    valign: 'middle',
  })

  // Footer
  const footerText = options?.consultantName
    ? `Prepared by ${options.consultantName}`
    : 'Powered by DigiForm'

  slide.addText(footerText, {
    x: 0.5,
    y: 5,
    w: 9,
    h: 0.4,
    fontSize: 12,
    color: NEUTRAL_COLOR,
    align: 'center',
  })

  // Date
  slide.addText(new Date().toLocaleDateString(), {
    x: 8.5,
    y: 0.3,
    w: 1.2,
    h: 0.3,
    fontSize: 10,
    color: NEUTRAL_COLOR,
    align: 'right',
  })
}

/**
 * Slide 2: Executive Summary
 */
function addExecutiveSummarySlide(
  pptx: PptxGenJS,
  project: Project,
  responses: AssessmentResponse[],
  pathRecommendation: PathRecommendation | null,
  primaryColor: string
) {
  const slide = pptx.addSlide()

  // Title
  slide.addText('Executive Summary', {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: primaryColor,
  })

  // Divider line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 1.1,
    w: 9,
    h: 0.02,
    fill: { color: primaryColor },
  })

  // Overview box
  slide.addText(
    project.description || 'Comprehensive digital transformation initiative spanning UI, API, Data, Cloud, and AI tiers.',
    {
      x: 0.5,
      y: 1.4,
      w: 9,
      h: 1,
      fontSize: 14,
      color: NEUTRAL_COLOR,
      fill: { color: LIGHT_GRAY },
      margin: 0.2,
    }
  )

  // Key metrics
  const assessmentCount = responses.length
  const completedCount = responses.filter(r => r.response && r.response.trim() !== '').length
  const completionRate = assessmentCount > 0 ? Math.round((completedCount / assessmentCount) * 100) : 0

  const metrics = [
    { label: 'Assessment Completion', value: `${completionRate}%` },
    { label: 'Questions Answered', value: `${completedCount} / ${assessmentCount}` },
    {
      label: 'Recommended Path',
      value: pathRecommendation?.recommendedPath.replace('_', '-') || 'Under Review',
    },
    {
      label: 'Confidence',
      value: pathRecommendation?.confidence || 'N/A',
    },
  ]

  let yPos = 2.6
  metrics.forEach((metric, i) => {
    const xPos = 0.5 + (i % 2) * 4.5

    slide.addText(metric.label, {
      x: xPos,
      y: yPos,
      w: 4,
      h: 0.3,
      fontSize: 12,
      color: NEUTRAL_COLOR,
      bold: true,
    })

    slide.addText(metric.value, {
      x: xPos,
      y: yPos + 0.35,
      w: 4,
      h: 0.5,
      fontSize: 20,
      color: primaryColor,
      bold: true,
    })

    if (i % 2 === 1) yPos += 1.1
  })
}

/**
 * Slide 3: Four-Corner Framework
 */
function addFourCornerFrameworkSlide(pptx: PptxGenJS, primaryColor: string) {
  const slide = pptx.addSlide()

  // Title
  slide.addText('Four-Corner Transformation Framework', {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: primaryColor,
  })

  // Divider
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 1.1,
    w: 9,
    h: 0.02,
    fill: { color: primaryColor },
  })

  // Draw 2x2 grid
  const boxWidth = 4
  const boxHeight = 1.8
  const startX = 0.8
  const startY = 1.6

  const quadrants = [
    {
      title: 'Future State\nUser Experience',
      x: startX,
      y: startY,
      color: 'e8dff5',
      description: 'Modern UX, design systems',
    },
    {
      title: 'Current State\nUser Experience',
      x: startX + boxWidth + 0.4,
      y: startY,
      color: 'fce1e4',
      description: 'Existing UI/UX baseline',
    },
    {
      title: 'Future State\nData & Intelligence',
      x: startX,
      y: startY + boxHeight + 0.3,
      color: 'd4edda',
      description: 'Cloud platform, AI/ML',
    },
    {
      title: 'Current State\nData & Infrastructure',
      x: startX + boxWidth + 0.4,
      y: startY + boxHeight + 0.3,
      color: 'fff3cd',
      description: 'Legacy systems, databases',
    },
  ]

  quadrants.forEach(quad => {
    // Box
    slide.addShape(pptx.ShapeType.rect, {
      x: quad.x,
      y: quad.y,
      w: boxWidth,
      h: boxHeight,
      fill: { color: quad.color },
      line: { color: primaryColor, width: 2 },
    })

    // Title
    slide.addText(quad.title, {
      x: quad.x,
      y: quad.y + 0.3,
      w: boxWidth,
      h: 0.8,
      fontSize: 16,
      bold: true,
      color: NEUTRAL_COLOR,
      align: 'center',
      valign: 'top',
    })

    // Description
    slide.addText(quad.description, {
      x: quad.x + 0.2,
      y: quad.y + 1.1,
      w: boxWidth - 0.4,
      h: 0.6,
      fontSize: 11,
      color: NEUTRAL_COLOR,
      align: 'center',
    })
  })

  // Arrows showing transformation paths
  // Horizontal arrow (top)
  slide.addShape(pptx.ShapeType.rightArrow, {
    x: startX + boxWidth + 0.1,
    y: startY + 0.7,
    w: 0.5,
    h: 0.3,
    fill: { color: primaryColor },
  })

  // Vertical arrow (left)
  slide.addShape(pptx.ShapeType.downArrow, {
    x: startX + 1.8,
    y: startY + boxHeight + 0.1,
    w: 0.3,
    h: 0.4,
    fill: { color: primaryColor },
  })
}

/**
 * Slide 4: Current State Assessment
 */
function addCurrentStateSlide(
  pptx: PptxGenJS,
  project: Project,
  responses: AssessmentResponse[],
  primaryColor: string
) {
  const slide = pptx.addSlide()

  slide.addText('Current State Assessment', {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: primaryColor,
  })

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 1.1,
    w: 9,
    h: 0.02,
    fill: { color: primaryColor },
  })

  // Tier breakdown
  const tiers: Tier[] = ['UI', 'API', 'DATA', 'CLOUD', 'AI']
  const tierData = tiers.map(tier => {
    const tierResponses = responses.filter(r => r.tier === tier)
    const answered = tierResponses.filter(r => r.response && r.response.trim() !== '').length
    const total = tierResponses.length
    const percentage = total > 0 ? Math.round((answered / total) * 100) : 0

    return { tier, answered, total, percentage }
  })

  let yPos = 1.5
  tierData.forEach(data => {
    // Tier label
    slide.addText(`${data.tier} Tier`, {
      x: 0.8,
      y: yPos,
      w: 2,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: NEUTRAL_COLOR,
    })

    // Progress bar background
    slide.addShape(pptx.ShapeType.rect, {
      x: 3,
      y: yPos + 0.05,
      w: 5,
      h: 0.3,
      fill: { color: LIGHT_GRAY },
    })

    // Progress bar fill
    slide.addShape(pptx.ShapeType.rect, {
      x: 3,
      y: yPos + 0.05,
      w: 5 * (data.percentage / 100),
      h: 0.3,
      fill: { color: primaryColor },
    })

    // Percentage
    slide.addText(`${data.percentage}%`, {
      x: 8.2,
      y: yPos,
      w: 0.8,
      h: 0.4,
      fontSize: 12,
      bold: true,
      color: primaryColor,
      align: 'right',
    })

    yPos += 0.6
  })

  // Summary findings
  slide.addText('Key Findings:', {
    x: 0.8,
    y: yPos + 0.3,
    w: 8.4,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: NEUTRAL_COLOR,
  })

  const findings = [
    '• Comprehensive assessment completed across all architectural tiers',
    '• Legacy systems identified in Data and API tiers',
    '• Strong foundation for modernization initiatives',
  ]

  findings.forEach((finding, i) => {
    slide.addText(finding, {
      x: 0.8,
      y: yPos + 0.8 + i * 0.35,
      w: 8.4,
      h: 0.3,
      fontSize: 12,
      color: NEUTRAL_COLOR,
    })
  })
}

/**
 * Slide 5: Future State Vision
 */
function addFutureStateSlide(
  pptx: PptxGenJS,
  project: Project,
  pathRecommendation: PathRecommendation | null,
  primaryColor: string
) {
  const slide = pptx.addSlide()

  slide.addText('Future State Vision', {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: primaryColor,
  })

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 1.1,
    w: 9,
    h: 0.02,
    fill: { color: primaryColor },
  })

  const isAI = pathRecommendation?.recommendedPath === 'AI_INCLUDED'

  // Vision statement
  const visionText = isAI
    ? 'AI-powered cloud-native platform with intelligent automation, predictive analytics, and modern user experiences across all tiers.'
    : 'Modern cloud-native platform with deterministic workflows, robust APIs, and scalable architecture optimized for reliability and performance.'

  slide.addText(visionText, {
    x: 0.8,
    y: 1.5,
    w: 8.4,
    h: 1.2,
    fontSize: 16,
    color: NEUTRAL_COLOR,
    fill: { color: LIGHT_GRAY },
    margin: 0.3,
  })

  // Target architecture
  slide.addText('Target Architecture Components:', {
    x: 0.8,
    y: 2.9,
    w: 8.4,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: NEUTRAL_COLOR,
  })

  const components = isAI
    ? [
        '• Modern React/Angular UI with design system and component library',
        '• Microservices API architecture on Kubernetes',
        '• Cloud data platform (Azure/AWS) with data lake and warehousing',
        '• MLOps platform with model training, deployment, and monitoring',
        '• Intelligent automation and predictive capabilities across workflows',
      ]
    : [
        '• Modern React/Angular UI with design system and component library',
        '• RESTful API architecture with .NET Core / Spring Boot',
        '• Cloud-native databases (PostgreSQL, MongoDB) with managed services',
        '• CI/CD pipelines with automated testing and deployment',
        '• Observability stack with logging, monitoring, and alerting',
      ]

  components.forEach((comp, i) => {
    slide.addText(comp, {
      x: 0.8,
      y: 3.4 + i * 0.35,
      w: 8.4,
      h: 0.3,
      fontSize: 12,
      color: NEUTRAL_COLOR,
    })
  })
}

/**
 * Slide 6: Path Recommendation
 */
function addPathRecommendationSlide(
  pptx: PptxGenJS,
  pathRecommendation: PathRecommendation,
  primaryColor: string
) {
  const slide = pptx.addSlide()

  slide.addText('Transformation Path Recommendation', {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: primaryColor,
  })

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 1.1,
    w: 9,
    h: 0.02,
    fill: { color: primaryColor },
  })

  // Recommended path badge
  const pathLabel =
    pathRecommendation.recommendedPath === 'AI_INCLUDED' ? 'AI-Included Transformation' : 'AI-Free Transformation'

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.5,
    w: 8.4,
    h: 0.8,
    fill: { color: primaryColor },
  })

  slide.addText(pathLabel, {
    x: 0.8,
    y: 1.6,
    w: 6,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: 'FFFFFF',
  })

  // Confidence badge
  const confidenceColor =
    pathRecommendation.confidence === 'HIGH' ? '22c55e' : pathRecommendation.confidence === 'MEDIUM' ? 'f59e0b' : 'ef4444'

  slide.addShape(pptx.ShapeType.rect, {
    x: 7.2,
    y: 1.65,
    w: 1.8,
    h: 0.5,
    fill: { color: confidenceColor },
  })

  slide.addText(`${pathRecommendation.confidence} Confidence`, {
    x: 7.2,
    y: 1.65,
    w: 1.8,
    h: 0.5,
    fontSize: 12,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    valign: 'middle',
  })

  // Overall readiness score
  slide.addText('Overall Readiness Score', {
    x: 0.8,
    y: 2.5,
    w: 4,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: NEUTRAL_COLOR,
  })

  slide.addText(`${pathRecommendation.overallScore}/100`, {
    x: 0.8,
    y: 2.9,
    w: 4,
    h: 0.8,
    fontSize: 36,
    bold: true,
    color: primaryColor,
  })

  // Top 3 readiness dimensions
  slide.addText('Key Readiness Factors', {
    x: 5.2,
    y: 2.5,
    w: 4,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: NEUTRAL_COLOR,
  })

  const topDimensions = pathRecommendation.readinessScores.slice(0, 3)
  let yPos = 2.95
  topDimensions.forEach(dim => {
    slide.addText(`${dim.category}: ${dim.score}/100`, {
      x: 5.2,
      y: yPos,
      w: 3,
      h: 0.35,
      fontSize: 11,
      color: NEUTRAL_COLOR,
    })

    slide.addShape(pptx.ShapeType.rect, {
      x: 8.4,
      y: yPos + 0.05,
      w: (dim.score / 100) * 0.8,
      h: 0.25,
      fill: { color: primaryColor },
    })

    yPos += 0.45
  })

  // Justification
  slide.addText('Recommendation Rationale:', {
    x: 0.8,
    y: 4,
    w: 8.4,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: NEUTRAL_COLOR,
  })

  slide.addText(pathRecommendation.justification.substring(0, 300) + '...', {
    x: 0.8,
    y: 4.35,
    w: 8.4,
    h: 1,
    fontSize: 10,
    color: NEUTRAL_COLOR,
  })
}

/**
 * Tier Roadmap Slides (7-11)
 */
function addTierRoadmapSlide(
  pptx: PptxGenJS,
  tier: Tier,
  responses: AssessmentResponse[],
  pathRecommendation: PathRecommendation | null,
  primaryColor: string
) {
  const slide = pptx.addSlide()

  slide.addText(`${tier} Tier Roadmap`, {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: primaryColor,
  })

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 1.1,
    w: 9,
    h: 0.02,
    fill: { color: primaryColor },
  })

  const tierResponses = responses.filter(r => r.tier === tier)
  const keyFindings = tierResponses.slice(0, 3).map(r => `• ${r.question}`)

  slide.addText('Current State Findings:', {
    x: 0.8,
    y: 1.5,
    w: 8.4,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: NEUTRAL_COLOR,
  })

  keyFindings.forEach((finding, i) => {
    slide.addText(finding, {
      x: 0.8,
      y: 1.95 + i * 0.35,
      w: 8.4,
      h: 0.3,
      fontSize: 11,
      color: NEUTRAL_COLOR,
    })
  })

  // Transformation steps
  slide.addText('Transformation Initiatives:', {
    x: 0.8,
    y: 3.2,
    w: 8.4,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: NEUTRAL_COLOR,
  })

  const initiatives = getTierInitiatives(tier, pathRecommendation?.recommendedPath === 'AI_INCLUDED')

  initiatives.forEach((initiative, i) => {
    slide.addText(initiative, {
      x: 0.8,
      y: 3.65 + i * 0.35,
      w: 8.4,
      h: 0.3,
      fontSize: 11,
      color: NEUTRAL_COLOR,
    })
  })
}

/**
 * Get tier-specific transformation initiatives
 */
function getTierInitiatives(tier: Tier, isAI: boolean): string[] {
  const initiatives: Record<Tier, string[]> = {
    UI: isAI
      ? [
          '• Implement design system with component library (Weeks 1-4)',
          '• Build AI-powered personalization engine (Weeks 8-12)',
          '• Deploy progressive web app with offline capability (Weeks 12-16)',
        ]
      : [
          '• Implement design system with component library (Weeks 1-4)',
          '• Migrate to React/Angular SPA architecture (Weeks 4-8)',
          '• Deploy responsive UI with accessibility compliance (Weeks 8-12)',
        ],
    API: isAI
      ? [
          '• Migrate to microservices architecture on Kubernetes (Weeks 4-8)',
          '• Implement ML model serving APIs with versioning (Weeks 16-20)',
          '• Deploy API gateway with intelligent routing (Weeks 20-24)',
        ]
      : [
          '• Refactor to RESTful API architecture (Weeks 4-8)',
          '• Implement API versioning and documentation (Weeks 8-12)',
          '• Deploy API gateway with rate limiting and caching (Weeks 12-16)',
        ],
    DATA: isAI
      ? [
          '• Migrate to cloud data platform (Azure Synapse / AWS Redshift) (Weeks 4-8)',
          '• Build data lake with feature store for ML (Weeks 8-12)',
          '• Implement real-time streaming pipelines (Weeks 12-16)',
        ]
      : [
          '• Migrate to cloud-managed databases (PostgreSQL/MongoDB) (Weeks 4-8)',
          '• Implement data governance and access controls (Weeks 8-12)',
          '• Build ETL pipelines with automated validation (Weeks 12-16)',
        ],
    CLOUD: isAI
      ? [
          '• Deploy Kubernetes cluster with auto-scaling (Weeks 1-4)',
          '• Implement MLOps platform (MLflow/Kubeflow) (Weeks 16-20)',
          '• Configure GPU compute for model training (Weeks 20-24)',
        ]
      : [
          '• Deploy containerized workloads to Azure/AWS (Weeks 1-4)',
          '• Implement CI/CD pipelines with GitOps (Weeks 4-8)',
          '• Configure monitoring and observability stack (Weeks 8-12)',
        ],
    AI: isAI
      ? [
          '• Train initial ML models for automation use cases (Weeks 16-20)',
          '• Deploy copilot assistants for key workflows (Weeks 20-24)',
          '• Implement predictive analytics dashboards (Weeks 24-28)',
        ]
      : ['• No AI/ML initiatives planned for AI-Free transformation path'],
  }

  return initiatives[tier] || []
}

/**
 * Slide 12: Timeline & Milestones
 */
function addTimelineSlide(pptx: PptxGenJS, pathRecommendation: PathRecommendation | null, primaryColor: string) {
  const slide = pptx.addSlide()

  slide.addText('Transformation Timeline', {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: primaryColor,
  })

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 1.1,
    w: 9,
    h: 0.02,
    fill: { color: primaryColor },
  })

  const isAI = pathRecommendation?.recommendedPath === 'AI_INCLUDED'
  const totalWeeks = isAI ? 32 : 24

  const phases = isAI
    ? [
        { name: 'Discovery', weeks: '1-4', deliverables: 'Assessment, architecture diagrams' },
        { name: 'Foundation', weeks: '4-8', deliverables: 'Cloud setup, data migration' },
        { name: 'Modernization', weeks: '8-16', deliverables: 'APIs, UI components, databases' },
        { name: 'Intelligence', weeks: '16-24', deliverables: 'ML models, MLOps platform' },
        { name: 'Optimization', weeks: '24-32', deliverables: 'Performance tuning, governance' },
      ]
    : [
        { name: 'Discovery', weeks: '1-4', deliverables: 'Assessment, architecture diagrams' },
        { name: 'Foundation', weeks: '4-8', deliverables: 'Cloud setup, data migration' },
        { name: 'Modernization', weeks: '8-16', deliverables: 'APIs, UI components, databases' },
        { name: 'Optimization', weeks: '16-24', deliverables: 'Performance tuning, governance' },
      ]

  slide.addText(`Total Duration: ${totalWeeks} weeks`, {
    x: 0.8,
    y: 1.5,
    w: 8.4,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: NEUTRAL_COLOR,
  })

  let yPos = 2.1
  phases.forEach((phase, i) => {
    // Phase box
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: yPos,
      w: 8.4,
      h: 0.6,
      fill: { color: i % 2 === 0 ? LIGHT_GRAY : 'FFFFFF' },
      line: { color: primaryColor, width: 1 },
    })

    // Phase name
    slide.addText(phase.name, {
      x: 1,
      y: yPos + 0.1,
      w: 2,
      h: 0.4,
      fontSize: 12,
      bold: true,
      color: primaryColor,
    })

    // Weeks
    slide.addText(`Weeks ${phase.weeks}`, {
      x: 3.2,
      y: yPos + 0.1,
      w: 1.5,
      h: 0.4,
      fontSize: 11,
      color: NEUTRAL_COLOR,
    })

    // Deliverables
    slide.addText(phase.deliverables, {
      x: 5,
      y: yPos + 0.1,
      w: 3.8,
      h: 0.4,
      fontSize: 10,
      color: NEUTRAL_COLOR,
    })

    yPos += 0.7
  })
}

/**
 * Slide 13: Risks & Mitigation
 */
function addRisksSlide(pptx: PptxGenJS, pathRecommendation: PathRecommendation | null, primaryColor: string) {
  const slide = pptx.addSlide()

  slide.addText('Risks & Mitigation Strategies', {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: primaryColor,
  })

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 1.1,
    w: 9,
    h: 0.02,
    fill: { color: primaryColor },
  })

  const risks = pathRecommendation?.riskFlags || []

  if (risks.length > 0) {
    slide.addText('Identified Risk Flags:', {
      x: 0.8,
      y: 1.5,
      w: 8.4,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: NEUTRAL_COLOR,
    })

    let yPos = 2
    risks.slice(0, 4).forEach(risk => {
      const severityColor =
        risk.severity === 'CRITICAL'
          ? 'dc2626'
          : risk.severity === 'HIGH'
            ? 'f59e0b'
            : risk.severity === 'MEDIUM'
              ? 'f59e0b'
              : '22c55e'

      // Severity badge
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8,
        y: yPos,
        w: 0.8,
        h: 0.3,
        fill: { color: severityColor },
      })

      slide.addText(risk.severity, {
        x: 0.8,
        y: yPos,
        w: 0.8,
        h: 0.3,
        fontSize: 9,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        valign: 'middle',
      })

      // Risk description
      slide.addText(risk.description, {
        x: 1.8,
        y: yPos,
        w: 7.4,
        h: 0.3,
        fontSize: 11,
        color: NEUTRAL_COLOR,
      })

      yPos += 0.45
    })
  } else {
    slide.addText('No critical risk flags identified.', {
      x: 0.8,
      y: 2,
      w: 8.4,
      h: 0.4,
      fontSize: 12,
      color: '22c55e',
    })
  }

  // Mitigation strategies
  slide.addText('Mitigation Strategies:', {
    x: 0.8,
    y: yPos + 0.4,
    w: 8.4,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: NEUTRAL_COLOR,
  })

  const mitigations = [
    '• Phased rollout with incremental validation at each milestone',
    '• Dedicated governance council for oversight and decision-making',
    '• Risk register with weekly review and escalation procedures',
    '• Parallel run strategy for critical system migrations',
  ]

  mitigations.forEach((mitigation, i) => {
    slide.addText(mitigation, {
      x: 0.8,
      y: yPos + 0.9 + i * 0.35,
      w: 8.4,
      h: 0.3,
      fontSize: 11,
      color: NEUTRAL_COLOR,
    })
  })
}

/**
 * Slide 14: Next Steps
 */
function addNextStepsSlide(
  pptx: PptxGenJS,
  project: Project,
  pathRecommendation: PathRecommendation | null,
  primaryColor: string
) {
  const slide = pptx.addSlide()

  slide.addText('Next Steps', {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: primaryColor,
  })

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 1.1,
    w: 9,
    h: 0.02,
    fill: { color: primaryColor },
  })

  slide.addText('Immediate Actions (Next 30 Days):', {
    x: 0.8,
    y: 1.5,
    w: 8.4,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: NEUTRAL_COLOR,
  })

  const nextSteps = [
    '1. Finalize transformation path selection with stakeholder alignment',
    '2. Establish governance structure and decision-making framework',
    '3. Procure cloud platform and tooling (Azure/AWS accounts, licenses)',
    '4. Assemble core transformation team with defined RACI matrix',
    '5. Initiate discovery workshops for detailed requirements gathering',
    '6. Create detailed SOW and project charter for executive approval',
  ]

  nextSteps.forEach((step, i) => {
    slide.addText(step, {
      x: 0.8,
      y: 2 + i * 0.4,
      w: 8.4,
      h: 0.35,
      fontSize: 12,
      color: NEUTRAL_COLOR,
    })
  })

  // Call to action
  slide.addShape(pptx.ShapeType.rect, {
    x: 2,
    y: 4.7,
    w: 6,
    h: 0.6,
    fill: { color: primaryColor },
  })

  slide.addText("Ready to Transform? Let's Begin.", {
    x: 2,
    y: 4.7,
    w: 6,
    h: 0.6,
    fontSize: 18,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    valign: 'middle',
  })
}

/**
 * Download PowerPoint file
 */
export async function downloadExecutiveDeck(
  project: Project,
  responses: AssessmentResponse[],
  pathRecommendation: PathRecommendation | null,
  options?: PowerPointOptions
): Promise<void> {
  const blob = await generateExecutiveDeck(project, responses, pathRecommendation, options)

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.name.replace(/\s+/g, '_')}_Executive_Deck.pptx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
