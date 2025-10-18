// Deliverable Service - Generate professional reports and exports
// Handles PowerPoint, PDF, and Excel generation for transformation deliverables

import PptxGenJS from 'pptxgenjs'
import { db } from '../lib/database'
import type { Project, Assessment, AssessmentResponse, FourCornerData, Stakeholder } from '../types'

/**
 * Generate PowerPoint Executive Deck
 * Creates a professional presentation with project overview, diagrams, and findings
 */
export async function generateExecutiveDeck(projectId: number): Promise<Blob> {
  try {
    // Load all project data
    const project = await db.projects.get(projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    const [assessments, responses, fourCornerData, stakeholders] = await Promise.all([
      db.assessments.where('projectId').equals(projectId).toArray(),
      db.assessmentResponses.where('projectId').equals(projectId).toArray(),
      db.fourCornerData.where('projectId').equals(projectId).toArray(),
      db.stakeholders.where('projectId').equals(projectId).toArray(),
    ])

    // Initialize PowerPoint
    const pptx = new PptxGenJS()

    // Set presentation metadata
    pptx.author = 'Digital Transformation Planning System'
    pptx.company = 'ServiceVision'
    pptx.subject = `${project.name} - Transformation Plan`
    pptx.title = project.name

    // Define color scheme (Pastel Lilac palette)
    const colors = {
      primary: 'A687C0',
      secondary: '8B6AA8',
      accent: 'BFA8D4',
      dark: '604A73',
      light: 'F3F0F8',
      white: 'FFFFFF',
      text: '2D2D2D',
      success: '10B981',
      warning: 'F59E0B',
      danger: 'EF4444',
    }

    // Slide 1: Title Slide
    addTitleSlide(pptx, project, colors)

    // Slide 2: Executive Summary
    addExecutiveSummary(pptx, project, assessments, responses, colors)

    // Slide 3: Project Overview
    addProjectOverview(pptx, project, stakeholders, colors)

    // Slide 4: Assessment Progress
    addAssessmentProgress(pptx, assessments, colors)

    // Slide 5-9: Tier Summaries (one per tier)
    const tiers = ['UI', 'API', 'DATA', 'CLOUD', 'AI'] as const
    for (const tier of tiers) {
      addTierSummary(pptx, tier, assessments, responses, colors)
    }

    // Slide 10: Four-Corner Framework Overview
    if (fourCornerData.length > 0) {
      addFourCornerDiagram(pptx, fourCornerData, colors)
    }

    // Slide 11: Key Findings and Recommendations
    addKeyFindings(pptx, project, assessments, responses, colors)

    // Slide 12: Next Steps
    addNextSteps(pptx, project, colors)

    // Generate and return blob
    const blob = (await pptx.write({ outputType: 'blob' })) as Blob
    return blob
  } catch (error) {
    console.error('Error generating executive deck:', error)
    throw new Error('Failed to generate PowerPoint presentation')
  }
}

/**
 * Add title slide
 */
function addTitleSlide(pptx: PptxGenJS, project: Project, colors: Record<string, string>) {
  const slide = pptx.addSlide()

  // Background gradient
  slide.background = { color: colors.light }

  // Title
  slide.addText(project.name, {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: colors.dark,
    align: 'center',
  })

  // Subtitle
  slide.addText('Digital Transformation Plan', {
    x: 0.5,
    y: 3.7,
    w: 9,
    h: 0.5,
    fontSize: 24,
    color: colors.secondary,
    align: 'center',
  })

  // Transformation path indicator
  const pathText =
    project.transformationPath === 'AI_INCLUDED'
      ? 'AI-Included Transformation Path'
      : project.transformationPath === 'AI_FREE'
        ? 'AI-Free Transformation Path'
        : 'Transformation Path: To Be Determined'

  slide.addText(pathText, {
    x: 0.5,
    y: 4.5,
    w: 9,
    h: 0.4,
    fontSize: 16,
    color: colors.text,
    align: 'center',
    italic: true,
  })

  // Date
  slide.addText(`Generated: ${new Date().toLocaleDateString()}`, {
    x: 0.5,
    y: 6.5,
    w: 9,
    h: 0.3,
    fontSize: 12,
    color: colors.text,
    align: 'center',
  })

  // Footer
  slide.addText('Powered by Digital Transformation Planning System', {
    x: 0.5,
    y: 7,
    w: 9,
    h: 0.3,
    fontSize: 10,
    color: colors.secondary,
    align: 'center',
  })
}

/**
 * Add executive summary slide
 */
function addExecutiveSummary(
  pptx: PptxGenJS,
  project: Project,
  assessments: Assessment[],
  responses: AssessmentResponse[],
  colors: Record<string, string>
) {
  const slide = pptx.addSlide()

  // Title
  slide.addText('Executive Summary', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: colors.dark,
  })

  // Calculate statistics
  const totalAssessments = assessments.length
  const completedAssessments = assessments.filter((a) => a.status === 'completed').length
  const answeredQuestions = responses.filter((r) => r.answer).length
  const totalQuestions = responses.length
  const overallProgress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0

  // Statistics boxes
  const stats = [
    { label: 'Overall Progress', value: `${overallProgress}%`, color: colors.primary },
    {
      label: 'Assessments Complete',
      value: `${completedAssessments}/${totalAssessments}`,
      color: colors.success,
    },
    { label: 'Current Phase', value: project.currentPhase, color: colors.accent },
    {
      label: 'Transformation Path',
      value:
        project.transformationPath === 'AI_INCLUDED'
          ? 'AI-Included'
          : project.transformationPath === 'AI_FREE'
            ? 'AI-Free'
            : 'Undecided',
      color: colors.secondary,
    },
  ]

  stats.forEach((stat, index) => {
    const x = 0.5 + (index % 2) * 4.75
    const y = 1.5 + Math.floor(index / 2) * 1.5

    // Box background
    slide.addShape(pptx.ShapeType.rect, {
      x,
      y,
      w: 4.25,
      h: 1.2,
      fill: { color: colors.light },
      line: { color: stat.color, width: 2 },
    })

    // Label
    slide.addText(stat.label, {
      x,
      y: y + 0.2,
      w: 4.25,
      h: 0.4,
      fontSize: 12,
      color: colors.text,
      align: 'center',
    })

    // Value
    slide.addText(stat.value, {
      x,
      y: y + 0.6,
      w: 4.25,
      h: 0.5,
      fontSize: 24,
      bold: true,
      color: stat.color,
      align: 'center',
    })
  })

  // Description
  if (project.description) {
    slide.addText('Project Overview', {
      x: 0.5,
      y: 4.8,
      w: 9,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: colors.dark,
    })

    slide.addText(project.description, {
      x: 0.5,
      y: 5.3,
      w: 9,
      h: 1.5,
      fontSize: 12,
      color: colors.text,
      valign: 'top',
    })
  }
}

/**
 * Add project overview slide
 */
function addProjectOverview(
  pptx: PptxGenJS,
  project: Project,
  stakeholders: Stakeholder[],
  colors: Record<string, string>
) {
  const slide = pptx.addSlide()

  // Title
  slide.addText('Project Overview', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: colors.dark,
  })

  // Project details
  const details = [
    { label: 'Project Name', value: project.name },
    { label: 'Status', value: project.status.toUpperCase().replace('_', ' ') },
    {
      label: 'Current Phase',
      value: project.currentPhase.charAt(0) + project.currentPhase.slice(1).toLowerCase(),
    },
    {
      label: 'Transformation Path',
      value:
        project.transformationPath === 'AI_INCLUDED'
          ? 'AI-Included'
          : project.transformationPath === 'AI_FREE'
            ? 'AI-Free'
            : 'To Be Determined',
    },
    { label: 'Created', value: new Date(project.createdAt).toLocaleDateString() },
    { label: 'Last Updated', value: new Date(project.updatedAt).toLocaleDateString() },
  ]

  let yPos = 1.5
  details.forEach((detail) => {
    slide.addText(`${detail.label}:`, {
      x: 0.5,
      y: yPos,
      w: 3,
      h: 0.3,
      fontSize: 12,
      bold: true,
      color: colors.dark,
    })

    slide.addText(detail.value, {
      x: 3.7,
      y: yPos,
      w: 5.8,
      h: 0.3,
      fontSize: 12,
      color: colors.text,
    })

    yPos += 0.4
  })

  // Stakeholders section
  if (stakeholders.length > 0) {
    slide.addText('Key Stakeholders', {
      x: 0.5,
      y: yPos + 0.3,
      w: 9,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: colors.dark,
    })

    yPos += 0.9
    stakeholders.slice(0, 6).forEach((stakeholder) => {
      slide.addText(`• ${stakeholder.name} - ${stakeholder.role}`, {
        x: 0.7,
        y: yPos,
        w: 8.8,
        h: 0.3,
        fontSize: 11,
        color: colors.text,
      })
      yPos += 0.35
    })

    if (stakeholders.length > 6) {
      slide.addText(`...and ${stakeholders.length - 6} more`, {
        x: 0.7,
        y: yPos,
        w: 8.8,
        h: 0.3,
        fontSize: 10,
        italic: true,
        color: colors.secondary,
      })
    }
  }
}

/**
 * Add assessment progress slide
 */
function addAssessmentProgress(
  pptx: PptxGenJS,
  assessments: Assessment[],
  colors: Record<string, string>
) {
  const slide = pptx.addSlide()

  // Title
  slide.addText('Assessment Progress', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: colors.dark,
  })

  // Calculate tier-level progress
  const tiers = ['UI', 'API', 'DATA', 'CLOUD', 'AI'] as const
  const tierProgress = tiers.map((tier) => {
    const tierAssessments = assessments.filter((a) => a.tier === tier)
    const total = tierAssessments.length
    const completed = tierAssessments.filter((a) => a.status === 'completed').length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { tier, completed, total, percentage }
  })

  // Progress bars
  let yPos = 1.5
  tierProgress.forEach((item) => {
    // Tier label
    slide.addText(item.tier, {
      x: 0.5,
      y: yPos,
      w: 1.5,
      h: 0.5,
      fontSize: 14,
      bold: true,
      color: colors.dark,
      valign: 'middle',
    })

    // Progress bar background
    slide.addShape(pptx.ShapeType.rect, {
      x: 2.2,
      y: yPos + 0.1,
      w: 6,
      h: 0.3,
      fill: { color: colors.light },
      line: { color: colors.secondary, width: 1 },
    })

    // Progress bar fill
    if (item.percentage > 0) {
      slide.addShape(pptx.ShapeType.rect, {
        x: 2.2,
        y: yPos + 0.1,
        w: (6 * item.percentage) / 100,
        h: 0.3,
        fill: { color: item.percentage === 100 ? colors.success : colors.primary },
        line: { width: 0 },
      })
    }

    // Percentage text
    slide.addText(`${item.percentage}%`, {
      x: 8.4,
      y: yPos,
      w: 1.1,
      h: 0.5,
      fontSize: 12,
      bold: true,
      color: colors.dark,
      align: 'right',
      valign: 'middle',
    })

    // Count
    slide.addText(`${item.completed}/${item.total}`, {
      x: 2.2,
      y: yPos + 0.5,
      w: 6,
      h: 0.3,
      fontSize: 10,
      color: colors.text,
      align: 'center',
    })

    yPos += 1.1
  })
}

/**
 * Add tier summary slide
 */
function addTierSummary(
  pptx: PptxGenJS,
  tier: string,
  assessments: Assessment[],
  responses: AssessmentResponse[],
  colors: Record<string, string>
) {
  const slide = pptx.addSlide()

  // Title
  slide.addText(`${tier} Tier Assessment`, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: colors.dark,
  })

  // Get tier assessments and responses
  const tierAssessments = assessments.filter((a) => a.tier === tier)
  const tierResponses = responses.filter((r) =>
    tierAssessments.some((a) => a.id === r.assessmentId)
  )

  // Calculate statistics
  const totalQuestions = tierResponses.length
  const answeredQuestions = tierResponses.filter((r) => r.answer).length
  const highPriorityQuestions = tierResponses.filter((r) => r.priority === 'HIGH').length
  const highPriorityAnswered = tierResponses.filter(
    (r) => r.priority === 'HIGH' && r.answer
  ).length

  // Statistics
  slide.addText(`Progress: ${totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0}%`, {
    x: 0.5,
    y: 1.3,
    w: 4,
    h: 0.4,
    fontSize: 14,
    color: colors.text,
  })

  slide.addText(`Questions Answered: ${answeredQuestions} / ${totalQuestions}`, {
    x: 0.5,
    y: 1.8,
    w: 4,
    h: 0.4,
    fontSize: 14,
    color: colors.text,
  })

  slide.addText(
    `High Priority: ${highPriorityAnswered} / ${highPriorityQuestions} answered`,
    {
      x: 0.5,
      y: 2.3,
      w: 4,
      h: 0.4,
      fontSize: 14,
      color: highPriorityAnswered === highPriorityQuestions ? colors.success : colors.warning,
    }
  )

  // Key responses (first 5 answered high-priority questions)
  const keyResponses = tierResponses
    .filter((r) => r.answer && r.priority === 'HIGH')
    .slice(0, 5)

  if (keyResponses.length > 0) {
    slide.addText('Key Findings:', {
      x: 0.5,
      y: 3.0,
      w: 9,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: colors.dark,
    })

    let yPos = 3.5
    keyResponses.forEach((response, index) => {
      // Question (truncated)
      const question =
        response.questionText.length > 80
          ? response.questionText.substring(0, 77) + '...'
          : response.questionText

      slide.addText(`${index + 1}. ${question}`, {
        x: 0.5,
        y: yPos,
        w: 9,
        h: 0.3,
        fontSize: 11,
        bold: true,
        color: colors.dark,
      })

      // Answer (truncated)
      const answer =
        typeof response.answer === 'string' && response.answer.length > 100
          ? response.answer.substring(0, 97) + '...'
          : response.answer

      slide.addText(`${answer}`, {
        x: 0.7,
        y: yPos + 0.35,
        w: 8.8,
        h: 0.4,
        fontSize: 10,
        color: colors.text,
      })

      yPos += 0.9
    })
  }
}

/**
 * Add four-corner diagram slide
 */
function addFourCornerDiagram(
  pptx: PptxGenJS,
  fourCornerData: FourCornerData[],
  colors: Record<string, string>
) {
  const slide = pptx.addSlide()

  // Title
  slide.addText('Four-Corner Framework', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: colors.dark,
  })

  // Subtitle
  slide.addText('Current State vs. Future Vision', {
    x: 0.5,
    y: 1.1,
    w: 9,
    h: 0.3,
    fontSize: 14,
    color: colors.secondary,
  })

  // Draw quadrants (2x2 grid)
  const quadrantWidth = 4.25
  const quadrantHeight = 2.3
  const startX = 0.5
  const startY = 1.8

  const quadrants = [
    { name: 'future_ui', title: 'Future State\nUI/UX', x: startX, y: startY, color: colors.success },
    {
      name: 'current_ui',
      title: 'Current State\nUI/UX',
      x: startX + quadrantWidth + 0.5,
      y: startY,
      color: colors.primary,
    },
    {
      name: 'future_data',
      title: 'Future State\nData Platform',
      x: startX,
      y: startY + quadrantHeight + 0.3,
      color: colors.accent,
    },
    {
      name: 'current_data',
      title: 'Current State\nData Platform',
      x: startX + quadrantWidth + 0.5,
      y: startY + quadrantHeight + 0.3,
      color: colors.secondary,
    },
  ]

  quadrants.forEach((quadrant) => {
    // Draw box
    slide.addShape(pptx.ShapeType.rect, {
      x: quadrant.x,
      y: quadrant.y,
      w: quadrantWidth,
      h: quadrantHeight,
      fill: { color: colors.light },
      line: { color: quadrant.color, width: 2 },
    })

    // Title
    slide.addText(quadrant.title, {
      x: quadrant.x + 0.1,
      y: quadrant.y + 0.1,
      w: quadrantWidth - 0.2,
      h: 0.5,
      fontSize: 12,
      bold: true,
      color: quadrant.color,
      align: 'center',
    })

    // Content (summarized)
    const content = fourCornerData.filter((d) => d.quadrant === quadrant.name)
    if (content.length > 0) {
      const summary = content
        .map((c) => `${c.tier}: ${c.content.substring(0, 60)}...`)
        .slice(0, 3)
        .join('\n')

      slide.addText(summary, {
        x: quadrant.x + 0.2,
        y: quadrant.y + 0.7,
        w: quadrantWidth - 0.4,
        h: quadrantHeight - 0.8,
        fontSize: 9,
        color: colors.text,
        valign: 'top',
      })
    }
  })
}

/**
 * Add key findings slide
 */
function addKeyFindings(
  pptx: PptxGenJS,
  project: Project,
  assessments: Assessment[],
  responses: AssessmentResponse[],
  colors: Record<string, string>
) {
  const slide = pptx.addSlide()

  // Title
  slide.addText('Key Findings & Recommendations', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: colors.dark,
  })

  // Calculate readiness
  const totalQuestions = responses.length
  const answeredQuestions = responses.filter((r) => r.answer).length
  const completionRate = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  const findings = []

  // Assessment completion finding
  if (completionRate >= 80) {
    findings.push({
      type: 'Success',
      text: `Assessment is ${Math.round(completionRate)}% complete. Strong foundation for transformation planning.`,
    })
  } else if (completionRate >= 50) {
    findings.push({
      type: 'In Progress',
      text: `Assessment is ${Math.round(completionRate)}% complete. Continue interviews to build comprehensive picture.`,
    })
  } else {
    findings.push({
      type: 'Action Required',
      text: `Assessment is ${Math.round(completionRate)}% complete. Priority: Complete discovery interviews.`,
    })
  }

  // Phase-specific findings
  findings.push({
    type: 'Current Phase',
    text: `Project is in ${project.currentPhase} phase. Focus on establishing baseline and future vision.`,
  })

  // Transformation path finding
  if (project.transformationPath === 'UNDECIDED') {
    findings.push({
      type: 'Decision Needed',
      text: 'Transformation path not yet selected. Recommend evaluating AI readiness after discovery.',
    })
  } else if (project.transformationPath === 'AI_INCLUDED') {
    findings.push({
      type: 'AI Path',
      text: 'AI-Included path selected. Ensure data governance, quality, and compliance frameworks are prioritized.',
    })
  } else {
    findings.push({
      type: 'AI-Free Path',
      text: 'AI-Free path selected. Focus on deterministic automation and traditional modernization approaches.',
    })
  }

  // Add tier-specific recommendations
  const incompleteTiers = ['UI', 'API', 'DATA', 'CLOUD', 'AI']
    .map((tier) => {
      const tierAssessments = assessments.filter((a) => a.tier === tier)
      const completed = tierAssessments.filter((a) => a.status === 'completed').length
      return { tier, progress: (completed / tierAssessments.length) * 100 }
    })
    .filter((t) => t.progress < 100)
    .sort((a, b) => a.progress - b.progress)

  if (incompleteTiers.length > 0) {
    findings.push({
      type: 'Priority Tiers',
      text: `Focus assessment efforts on: ${incompleteTiers.slice(0, 2).map((t) => t.tier).join(', ')} tiers.`,
    })
  }

  // Render findings
  let yPos = 1.5
  findings.forEach((finding, index) => {
    // Type badge
    const badgeColor =
      finding.type.includes('Success') || finding.type.includes('Done')
        ? colors.success
        : finding.type.includes('Action') || finding.type.includes('Decision')
          ? colors.warning
          : colors.primary

    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5,
      y: yPos,
      w: 2,
      h: 0.4,
      fill: { color: badgeColor },
      line: { width: 0 },
    })

    slide.addText(finding.type, {
      x: 0.5,
      y: yPos,
      w: 2,
      h: 0.4,
      fontSize: 11,
      bold: true,
      color: colors.white,
      align: 'center',
      valign: 'middle',
    })

    // Finding text
    slide.addText(finding.text, {
      x: 2.7,
      y: yPos,
      w: 6.8,
      h: 0.7,
      fontSize: 11,
      color: colors.text,
      valign: 'middle',
    })

    yPos += 0.95
  })
}

/**
 * Add next steps slide
 */
function addNextSteps(pptx: PptxGenJS, project: Project, colors: Record<string, string>) {
  const slide = pptx.addSlide()

  // Title
  slide.addText('Next Steps', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: colors.dark,
  })

  const steps = [
    'Complete remaining discovery interviews across all tiers',
    'Review and validate four-corner framework diagrams with stakeholders',
    'Finalize transformation path selection (AI-Included vs AI-Free)',
    'Develop detailed 32-week implementation roadmap',
    'Establish governance structure and decision-making framework',
    'Identify quick wins and pilot opportunities for first 90 days',
    'Secure executive sponsorship and resource allocation',
    'Define success metrics and monitoring approach',
  ]

  let yPos = 1.5
  steps.forEach((step, index) => {
    // Number circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 0.5,
      y: yPos - 0.05,
      w: 0.5,
      h: 0.5,
      fill: { color: colors.primary },
      line: { width: 0 },
    })

    slide.addText(`${index + 1}`, {
      x: 0.5,
      y: yPos - 0.05,
      w: 0.5,
      h: 0.5,
      fontSize: 14,
      bold: true,
      color: colors.white,
      align: 'center',
      valign: 'middle',
    })

    // Step text
    slide.addText(step, {
      x: 1.2,
      y: yPos,
      w: 8.3,
      h: 0.6,
      fontSize: 12,
      color: colors.text,
      valign: 'middle',
    })

    yPos += 0.7
  })

  // Footer
  slide.addText('For questions or support, contact your transformation consultant.', {
    x: 0.5,
    y: 6.8,
    w: 9,
    h: 0.3,
    fontSize: 10,
    italic: true,
    color: colors.secondary,
    align: 'center',
  })
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
