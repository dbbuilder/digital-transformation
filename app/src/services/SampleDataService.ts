/**
 * Sample Data Service
 *
 * Provides realistic demo project "Acme Corp Digital Transformation"
 * Pre-populated with assessment responses for immediate demonstration
 */

import { db } from '../lib/database'
import type { Project, AssessmentResponse, Stakeholder } from '../types'

export interface SampleProject {
  project: Project
  stakeholders: Stakeholder[]
  responses: AssessmentResponse[]
}

/**
 * Create "Acme Corp" sample project with realistic data
 */
export async function createAcmeCorpSampleProject(): Promise<number> {
  console.log('🏢 Creating Acme Corp sample project...')

  // Create project
  const projectId = await db.projects.add({
    name: 'Acme Corp Digital Transformation',
    description:
      'Enterprise-wide digital transformation initiative for Acme Corporation, a mid-sized manufacturing company with legacy systems seeking to modernize their technology stack and explore AI opportunities.',
    transformationPath: 'UNDECIDED',
    currentPhase: 'DISCOVERY',
    status: 'active',
    startDate: new Date('2025-01-15'),
    targetCompletionDate: new Date('2025-09-30'),
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      industry: 'Manufacturing',
      companySize: '500-1000 employees',
      revenue: '$100M-$500M',
      headquarters: 'Chicago, IL',
    },
  })

  // Add stakeholders
  await db.stakeholders.bulkAdd([
    {
      projectId,
      name: 'Sarah Johnson',
      title: 'Chief Technology Officer',
      role: 'Executive Sponsor',
      department: 'Technology',
      email: 'sarah.johnson@acmecorp.com',
      knowledgeAreas: ['CLOUD', 'API', 'DATA'],
      involvementLevel: 'ACCOUNTABLE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      projectId,
      name: 'Michael Chen',
      title: 'VP of Product',
      role: 'Product Owner',
      department: 'Product',
      email: 'michael.chen@acmecorp.com',
      knowledgeAreas: ['UI', 'API'],
      involvementLevel: 'RESPONSIBLE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      projectId,
      name: 'Emily Rodriguez',
      title: 'Lead Data Architect',
      role: 'Technical Lead - Data',
      department: 'Engineering',
      email: 'emily.rodriguez@acmecorp.com',
      knowledgeAreas: ['DATA', 'AI', 'CLOUD'],
      involvementLevel: 'RESPONSIBLE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])

  // Get all interview questions
  const allQuestions = await db.interviewQuestions.toArray()

  // Create realistic responses for 25 questions (50% completion)
  const responses: Omit<AssessmentResponse, 'id'>[] = [
    // UI Tier Responses
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q001',
      questionText: allQuestions.find(q => q.id === 'Q001')?.question || 'User experience pain points',
      answer:
        'Users frequently complain about slow page load times (10-15 seconds), inconsistent UI across different modules, and difficulty navigating between features. Mobile experience is particularly poor with no responsive design.',
      notes: 'Confirmed with user surveys showing 65% dissatisfaction with current UX',
      priority: 'HIGH',
      answeredAt: new Date('2025-01-20'),
      updatedAt: new Date('2025-01-20'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q002',
      questionText: allQuestions.find(q => q.id === 'Q002')?.question || 'User access methods',
      answer:
        'Primarily desktop web application (80% of users). Some users attempt mobile access via browser (15%), and 5% use legacy Windows desktop client. No native mobile apps exist.',
      notes: 'Mobile users report significant frustration',
      priority: 'MEDIUM',
      answeredAt: new Date('2025-01-20'),
      updatedAt: new Date('2025-01-20'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q003',
      questionText: allQuestions.find(q => q.id === 'Q003')?.question || 'Frontend technologies',
      answer:
        'Mix of jQuery 2.x (legacy modules), AngularJS 1.5 (order management), and some React 16 components (recently added). No unified framework strategy. Heavy reliance on inline JavaScript and global state.',
      notes: 'Technical debt estimated at 40% of UI codebase',
      priority: 'HIGH',
      answeredAt: new Date('2025-01-21'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q004',
      questionText: allQuestions.find(q => q.id === 'Q004')?.question || 'Design system',
      answer:
        'No formal design system. Each team creates their own components, leading to 5+ different button styles, inconsistent colors, and duplicated code. Some discussion of adopting Material UI but no decision.',
      notes: 'Major cause of UI inconsistency',
      priority: 'MEDIUM',
      answeredAt: new Date('2025-01-21'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q006',
      questionText: allQuestions.find(q => q.id === 'Q006')?.question || 'Accessibility requirements',
      answer:
        'Must meet WCAG 2.1 AA standards for government contracts. Current application has never been audited and likely has significant accessibility gaps. No automated accessibility testing in place.',
      notes: 'Critical for upcoming federal contract renewal',
      priority: 'HIGH',
      answeredAt: new Date('2025-01-22'),
    },

    // API Tier Responses
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q011',
      questionText: allQuestions.find(q => q.id === 'Q011')?.question || 'API architecture',
      answer:
        'Monolithic REST API built with .NET Framework 4.7. Approximately 200 endpoints. No API versioning strategy. Some legacy SOAP services still in use for partner integrations.',
      notes: 'API refactoring is high priority',
      priority: 'HIGH',
      answeredAt: new Date('2025-01-22'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q012',
      questionText: allQuestions.find(q => q.id === 'Q012')?.question || 'API frameworks',
      answer:
        '.NET Framework 4.7 with ASP.NET Web API 2. Some microservices experiments with .NET Core 3.1. No Node.js or other languages. Planning migration to .NET 8.',
      notes: 'Framework versions are end-of-life or near EOL',
      priority: 'HIGH',
      answeredAt: new Date('2025-01-23'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q013',
      questionText: allQuestions.find(q => q.id === 'Q013')?.question || 'API versioning',
      answer:
        'No formal API versioning. Breaking changes are introduced in production causing partner integration failures. Considering v1/v2 path-based versioning strategy.',
      notes: 'Caused 3 major incidents last year',
      priority: 'HIGH',
      answeredAt: new Date('2025-01-23'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q014',
      questionText: allQuestions.find(q => q.id === 'Q014')?.question || 'Authentication',
      answer:
        'Currently using custom JWT tokens with 30-day expiration. No OAuth 2.0. Basic Auth for some legacy endpoints. Evaluating Azure AD B2C for future state.',
      notes: 'Security audit flagged authentication as weak',
      priority: 'HIGH',
      answeredAt: new Date('2025-01-24'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q017',
      questionText: allQuestions.find(q => q.id === 'Q017')?.question || 'API monitoring',
      answer:
        'Using Application Insights for basic telemetry. No formal SLAs defined. Uptime is approximately 99.5% but no alerting for degraded performance. Manual log review for troubleshooting.',
      notes: 'Need better observability',
      priority: 'MEDIUM',
      answeredAt: new Date('2025-01-24'),
    },

    // Data Tier Responses
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q021',
      questionText: allQuestions.find(q => q.id === 'Q021')?.question || 'Data sources',
      answer:
        'Primary database: SQL Server 2016 Enterprise (3TB). Secondary: MongoDB 4.2 for document storage (500GB). Legacy Oracle 11g database for ERP integration (read-only). Redis for caching.',
      notes: 'SQL Server urgently needs upgrade (EOL 2026)',
      priority: 'HIGH',
      answeredAt: new Date('2025-01-25'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q022',
      questionText: allQuestions.find(q => q.id === 'Q022')?.question || 'Data volume',
      answer:
        'Total data volume: ~3.5TB across all databases. Growing at approximately 30% per year. SQL Server database has 1,200 tables, many with poor indexing.',
      notes: 'Storage costs increasing significantly',
      priority: 'MEDIUM',
      answeredAt: new Date('2025-01-25'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q023',
      questionText: allQuestions.find(q => q.id === 'Q023')?.question || 'Data governance',
      answer:
        'No formal data governance framework. Data ownership is unclear. No centralized data catalog or metadata management. Data quality issues are widespread but not measured.',
      notes: 'CRITICAL gap for AI readiness',
      priority: 'HIGH',
      answeredAt: new Date('2025-01-26'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q024',
      questionText: allQuestions.find(q => q.id === 'Q024')?.question || 'Data quality',
      answer:
        'Data quality is a known problem. Estimated 20-30% of customer records have incomplete or inaccurate information. No automated data quality checks. Manual data cleansing is common.',
      notes: 'Major blocker for AI/ML initiatives',
      priority: 'HIGH',
      answeredAt: new Date('2025-01-26'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q025',
      questionText: allQuestions.find(q => q.id === 'Q025')?.question || 'Compliance requirements',
      answer:
        'Subject to GDPR (EU customers), CCPA (California customers), and PCI-DSS (payment processing). Annual compliance audits. Some data residency requirements for European customers.',
      notes: 'Must maintain current compliance certifications',
      priority: 'HIGH',
      answeredAt: new Date('2025-01-27'),
    },

    // Cloud Tier Responses
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q031',
      questionText: allQuestions.find(q => q.id === 'Q031')?.question || 'Cloud provider',
      answer:
        'Currently 60% on-premises, 40% in Azure (IaaS VMs). Started cloud migration 2 years ago but stalled. No AWS or GCP usage. Considering multi-cloud strategy.',
      notes: 'Cloud migration is behind schedule',
      priority: 'HIGH',
      answeredAt: new Date('2025-01-27'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q032',
      questionText: allQuestions.find(q => q.id === 'Q032')?.question || 'Deployment model',
      answer:
        'Primarily IaaS (Azure VMs). Some experimentation with Azure App Service (PaaS). No containerization or Kubernetes. Interested in serverless for specific workloads.',
      notes: 'Lift-and-shift approach used so far',
      priority: 'MEDIUM',
      answeredAt: new Date('2025-01-28'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q033',
      questionText: allQuestions.find(q => q.id === 'Q033')?.question || 'Cloud spend',
      answer:
        'Annual cloud spend approximately $600K (Azure only). On-prem infrastructure costs an additional $400K/year. No cloud cost optimization tools in place. Costs growing 25% annually.',
      notes: 'Budget approval needed for expansion',
      priority: 'MEDIUM',
      answeredAt: new Date('2025-01-28'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q034',
      questionText: allQuestions.find(q => q.id === 'Q034')?.question || 'Infrastructure provisioning',
      answer:
        'Mostly manual provisioning via Azure Portal. Some ARM templates for common patterns. No Terraform or infrastructure-as-code strategy. Configuration drift is a problem.',
      notes: 'IaC adoption is planned priority',
      priority: 'MEDIUM',
      answeredAt: new Date('2025-01-29'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q037',
      questionText: allQuestions.find(q => q.id === 'Q037')?.question || 'Cloud monitoring',
      answer:
        'Using Azure Monitor and Application Insights. Basic alerting configured but alert fatigue is an issue. Mean time to resolution (MTTR) is approximately 4 hours for production incidents.',
      notes: 'Need better observability stack',
      priority: 'MEDIUM',
      answeredAt: new Date('2025-01-29'),
    },

    // AI Tier Responses
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q041',
      questionText: allQuestions.find(q => q.id === 'Q041')?.question || 'Current AI usage',
      answer:
        'No production AI/ML models currently deployed. Some proof-of-concept work with Azure Cognitive Services for document processing. Data science team of 2 people hired recently.',
      notes: 'AI is strategic priority but early stage',
      priority: 'HIGH',
      answeredAt: new Date('2025-01-30'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q043',
      questionText: allQuestions.find(q => q.id === 'Q043')?.question || 'AI use cases',
      answer:
        'Top use cases: 1) Predictive maintenance for manufacturing equipment, 2) Customer churn prediction, 3) Automated invoice processing. All validated with business stakeholders and have executive support.',
      notes: 'Business case approved for POC funding',
      priority: 'HIGH',
      answeredAt: new Date('2025-01-30'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q044',
      questionText: allQuestions.find(q => q.id === 'Q044')?.question || 'Data readiness for AI',
      answer:
        'Data quality is a major concern (see data tier responses). 5 years of historical data available but not labeled or structured for ML. Data scientists spend 80% of time on data preparation.',
      notes: 'Data quality improvement is prerequisite',
      priority: 'HIGH',
      answeredAt: new Date('2025-01-31'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q045',
      questionText: allQuestions.find(q => q.id === 'Q045')?.question || 'AI executive sponsorship',
      answer:
        'CTO (Sarah Johnson) is executive sponsor. Board approved $2M budget for AI initiative over 2 years. CEO is supportive but cautious about ROI timeline. Strong business case required for each use case.',
      notes: 'Executive alignment exists',
      priority: 'HIGH',
      answeredAt: new Date('2025-01-31'),
    },
    {
      projectId,
      assessmentId: 1,
      questionId: 'Q047',
      questionText: allQuestions.find(q => q.id === 'Q047')?.question || 'AI compliance concerns',
      answer:
        'Legal team concerned about GDPR Article 22 (automated decision-making). Must ensure explainability for any AI affecting customers. No AI-specific regulations currently applicable but monitoring EU AI Act.',
      notes: 'Legal review required for production AI',
      priority: 'HIGH',
      answeredAt: new Date('2025-02-01'),
    },
  ]

  // Add assessment responses
  for (const response of responses) {
    await db.assessmentResponses.add(response)
  }

  console.log(`✅ Created Acme Corp project with ${responses.length} assessment responses`)

  return projectId
}

/**
 * Check if sample project already exists
 */
export async function sampleProjectExists(): Promise<boolean> {
  const projects = await db.projects.toArray()
  return projects.some(p => p.name === 'Acme Corp Digital Transformation')
}

/**
 * Get or create sample project
 */
export async function getOrCreateSampleProject(): Promise<number> {
  const projects = await db.projects.toArray()
  const existing = projects.find(p => p.name === 'Acme Corp Digital Transformation')

  if (existing && existing.id) {
    console.log('✅ Sample project already exists')
    return existing.id
  }

  return await createAcmeCorpSampleProject()
}

/**
 * Delete sample project
 */
export async function deleteSampleProject(): Promise<void> {
  const projects = await db.projects.toArray()
  const sampleProject = projects.find(p => p.name === 'Acme Corp Digital Transformation')

  if (sampleProject && sampleProject.id) {
    await db.projects.delete(sampleProject.id)
    await db.stakeholders.where('projectId').equals(sampleProject.id).delete()
    await db.assessmentResponses.where('projectId').equals(sampleProject.id).delete()
    console.log('🗑️ Sample project deleted')
  }
}
