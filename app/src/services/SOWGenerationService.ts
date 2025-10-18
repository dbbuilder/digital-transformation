// SOW Generation Service - Generate final SOW documents in various formats

import PptxGenJS from 'pptxgenjs'
import { jsPDF } from 'jspdf'
import type { SOWPreview } from './SOWPreviewService'
import type { Assessment, Project } from '../types'
import { db } from '../lib/database'

export interface SOWDocument {
  format: 'pdf' | 'docx' | 'pptx' | 'markdown'
  blob: Blob
  filename: string
}

/**
 * Generate final SOW document in specified format
 */
export async function generateFinalSOW(
  project: Project,
  assessment: Assessment,
  sowPreview: SOWPreview,
  format: 'pdf' | 'pptx' | 'markdown' = 'pdf'
): Promise<SOWDocument> {
  switch (format) {
    case 'pdf':
      return await generatePDFSOW(project, assessment, sowPreview)
    case 'pptx':
      return await generatePowerPointSOW(project, assessment, sowPreview)
    case 'markdown':
      return generateMarkdownSOW(project, assessment, sowPreview)
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}

/**
 * Generate PDF SOW document
 */
async function generatePDFSOW(
  project: Project,
  assessment: Assessment,
  sowPreview: SOWPreview
): Promise<SOWDocument> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  let yPosition = 20

  // Title page
  doc.setFontSize(24)
  doc.text('Statement of Work', 105, yPosition, { align: 'center' })
  yPosition += 10

  doc.setFontSize(16)
  doc.text(project.name, 105, yPosition, { align: 'center' })
  yPosition += 15

  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, yPosition, { align: 'center' })
  doc.text(`Path: ${assessment.transformationPath}`, 105, yPosition + 5, { align: 'center' })
  doc.text(`Phase: ${assessment.phase}`, 105, yPosition + 10, { align: 'center' })

  // Add new page for content
  doc.addPage()
  yPosition = 20

  // Add each section
  const sections = [
    sowPreview.executiveSummary,
    sowPreview.currentStateAssessment,
    sowPreview.businessDrivers,
    sowPreview.proposedSolution,
    sowPreview.scopeAndDeliverables,
    sowPreview.successCriteria,
    sowPreview.timeline,
    sowPreview.assumptions,
  ]

  for (const section of sections) {
    // Section title
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')

    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }

    doc.text(section.title, 20, yPosition)
    yPosition += 8

    // Section content
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    const lines = doc.splitTextToSize(section.content, 170)

    for (const line of lines) {
      if (yPosition > 280) {
        doc.addPage()
        yPosition = 20
      }
      doc.text(line, 20, yPosition)
      yPosition += 5
    }

    yPosition += 10 // Space between sections
  }

  // Approval signatures page
  doc.addPage()
  yPosition = 20

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Approvals', 20, yPosition)
  yPosition += 15

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  // Get approval records
  const approvals = await db.sowSectionApprovals
    .where('[projectId+assessmentId]')
    .equals([project.id!, assessment.id!])
    .toArray()

  const stakeholders = await db.stakeholders
    .where('projectId')
    .equals(project.id!)
    .toArray()

  // Create approval summary
  for (const approval of approvals) {
    if (!approval.approvals || approval.approvals.length === 0) continue

    doc.setFont('helvetica', 'bold')
    doc.text(approval.sectionName, 20, yPosition)
    yPosition += 5

    for (const approvalRecord of approval.approvals) {
      const stakeholder = stakeholders.find(s => s.id === approvalRecord.stakeholderId)
      if (!stakeholder) continue

      doc.setFont('helvetica', 'normal')
      const statusIcon = approvalRecord.status === 'approved' ? '✓' :
                        approvalRecord.status === 'rejected' ? '✗' : '~'

      doc.text(
        `  ${statusIcon} ${stakeholder.name} (${stakeholder.title}) - ${approvalRecord.status}`,
        25,
        yPosition
      )
      yPosition += 5

      if (approvalRecord.comments) {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'italic')
        const commentLines = doc.splitTextToSize(`    "${approvalRecord.comments}"`, 160)
        for (const line of commentLines) {
          doc.text(line, 30, yPosition)
          yPosition += 4
        }
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
      }

      yPosition += 2
    }

    yPosition += 5
  }

  const blob = doc.output('blob')
  const filename = `SOW_${project.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

  return { format: 'pdf', blob, filename }
}

/**
 * Generate PowerPoint SOW presentation
 */
async function generatePowerPointSOW(
  project: Project,
  assessment: Assessment,
  sowPreview: SOWPreview
): Promise<SOWDocument> {
  const pptx = new PptxGenJS()

  // Set presentation properties
  pptx.author = 'Digital Transformation System'
  pptx.company = project.organizationName || 'Organization'
  pptx.title = `Statement of Work - ${project.name}`

  // Title slide
  const titleSlide = pptx.addSlide()
  titleSlide.background = { color: '4F46E5' } // Purple

  titleSlide.addText('Statement of Work', {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 1,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  })

  titleSlide.addText(project.name, {
    x: 0.5,
    y: 2.7,
    w: 9,
    h: 0.8,
    fontSize: 28,
    color: 'E0E7FF',
    align: 'center',
  })

  titleSlide.addText([
    { text: `Path: ${assessment.transformationPath}`, options: { breakLine: true } },
    { text: `Phase: ${assessment.phase}`, options: { breakLine: true } },
    { text: `Generated: ${new Date().toLocaleDateString()}`, options: {} },
  ], {
    x: 0.5,
    y: 4.5,
    w: 9,
    h: 1,
    fontSize: 14,
    color: 'C7D2FE',
    align: 'center',
  })

  // Add sections as slides
  const sections = [
    sowPreview.executiveSummary,
    sowPreview.currentStateAssessment,
    sowPreview.businessDrivers,
    sowPreview.proposedSolution,
    sowPreview.scopeAndDeliverables,
    sowPreview.successCriteria,
    sowPreview.timeline,
    sowPreview.assumptions,
  ]

  for (const section of sections) {
    const slide = pptx.addSlide()

    // Section title
    slide.addText(section.title, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: '4F46E5',
    })

    // Quality badge
    const qualityColors: Record<string, string> = {
      excellent: '10B981',
      good: '3B82F6',
      'needs-work': 'F59E0B',
      missing: 'EF4444',
    }

    slide.addText(section.quality.toUpperCase(), {
      x: 8,
      y: 0.5,
      w: 1.5,
      h: 0.4,
      fontSize: 10,
      bold: true,
      color: 'FFFFFF',
      fill: { color: qualityColors[section.quality] || '6B7280' },
      align: 'center',
    })

    // Content (cleaned up for presentation)
    const contentText = section.content
      .replace(/^#+\s*/gm, '') // Remove markdown headers
      .replace(/\*\*/g, '') // Remove bold markers
      .substring(0, 800) // Limit length

    slide.addText(contentText, {
      x: 0.5,
      y: 1.3,
      w: 9,
      h: 4.5,
      fontSize: 14,
      color: '1F2937',
      valign: 'top',
    })

    // Improvement suggestions if present
    if (section.improvementSuggestions.length > 0) {
      slide.addText('Improvement Suggestions:', {
        x: 0.5,
        y: 6,
        w: 9,
        h: 0.3,
        fontSize: 12,
        bold: true,
        color: 'F59E0B',
      })

      const suggestions = section.improvementSuggestions
        .map((s, i) => `${i + 1}. ${s}`)
        .join('\n')

      slide.addText(suggestions, {
        x: 0.5,
        y: 6.4,
        w: 9,
        h: 0.8,
        fontSize: 10,
        color: '92400E',
      })
    }
  }

  // Approval summary slide
  const approvalSlide = pptx.addSlide()
  approvalSlide.addText('Approval Status', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: '4F46E5',
  })

  const approvals = await db.sowSectionApprovals
    .where('[projectId+assessmentId]')
    .equals([project.id!, assessment.id!])
    .toArray()

  const stakeholders = await db.stakeholders
    .where('projectId')
    .equals(project.id!)
    .toArray()

  let approvalText = ''
  for (const approval of approvals) {
    approvalText += `${approval.sectionName}: ${approval.status}\n`

    if (approval.approvals) {
      for (const record of approval.approvals) {
        const stakeholder = stakeholders.find(s => s.id === record.stakeholderId)
        if (stakeholder) {
          approvalText += `  • ${stakeholder.name}: ${record.status}\n`
        }
      }
    }
    approvalText += '\n'
  }

  approvalSlide.addText(approvalText || 'No approvals recorded yet', {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 5,
    fontSize: 12,
    color: '1F2937',
    valign: 'top',
  })

  const blob = await pptx.write({ outputType: 'blob' }) as Blob
  const filename = `SOW_${project.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pptx`

  return { format: 'pptx', blob, filename }
}

/**
 * Generate Markdown SOW document
 */
function generateMarkdownSOW(
  project: Project,
  assessment: Assessment,
  sowPreview: SOWPreview
): SOWDocument {
  let markdown = `# Statement of Work\n\n`
  markdown += `## ${project.name}\n\n`
  markdown += `**Transformation Path:** ${assessment.transformationPath}\n\n`
  markdown += `**Phase:** ${assessment.phase}\n\n`
  markdown += `**Generated:** ${new Date().toLocaleDateString()}\n\n`
  markdown += `---\n\n`

  const sections = [
    sowPreview.executiveSummary,
    sowPreview.currentStateAssessment,
    sowPreview.businessDrivers,
    sowPreview.proposedSolution,
    sowPreview.scopeAndDeliverables,
    sowPreview.successCriteria,
    sowPreview.timeline,
    sowPreview.assumptions,
  ]

  for (const section of sections) {
    markdown += `## ${section.title}\n\n`
    markdown += `**Quality:** ${section.quality}\n\n`
    markdown += `${section.content}\n\n`

    if (section.improvementSuggestions.length > 0) {
      markdown += `### Improvement Suggestions\n\n`
      for (const suggestion of section.improvementSuggestions) {
        markdown += `- ${suggestion}\n`
      }
      markdown += `\n`
    }

    markdown += `---\n\n`
  }

  markdown += `## Approvals\n\n`
  markdown += `_Approval records will be added once all sections are approved._\n\n`

  const blob = new Blob([markdown], { type: 'text/markdown' })
  const filename = `SOW_${project.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.md`

  return { format: 'markdown', blob, filename }
}

/**
 * Download generated SOW document
 */
export function downloadSOWDocument(document: SOWDocument): void {
  const url = URL.createObjectURL(document.blob)
  const link = document.createElement('a')
  link.href = url
  link.download = document.filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Check if SOW is ready for final generation
 */
export async function checkSOWReadiness(
  projectId: number,
  assessmentId: number
): Promise<{
  ready: boolean
  issues: string[]
  approvalsPending: number
  sectionsIncomplete: number
}> {
  const approvals = await db.sowSectionApprovals
    .where('[projectId+assessmentId]')
    .equals([projectId, assessmentId])
    .toArray()

  const issues: string[] = []
  let approvalsPending = 0
  let sectionsIncomplete = 0

  for (const approval of approvals) {
    if (approval.approvalRequired && approval.status !== 'approved') {
      approvalsPending++
      issues.push(`${approval.sectionName} requires approval`)
    }

    if (approval.status === 'rejected') {
      sectionsIncomplete++
      issues.push(`${approval.sectionName} was rejected`)
    }

    if (approval.status === 'changes_requested') {
      sectionsIncomplete++
      issues.push(`${approval.sectionName} has requested changes`)
    }
  }

  const ready = issues.length === 0

  return {
    ready,
    issues,
    approvalsPending,
    sectionsIncomplete,
  }
}
