/**
 * Transformation Path Recommendation Engine
 *
 * Analyzes project assessment responses and organizational readiness to recommend
 * either AI-Included or AI-Free transformation path.
 *
 * Based on the Decision Framework from Decision_Framework.xlsx
 */

import type { AssessmentResponse, Project, TransformationPath } from '../types'

export interface ReadinessScore {
  category: string
  score: number // 0-100
  weight: number // 0-1 (importance multiplier)
  findings: string[]
  recommendations: string[]
}

export interface PathRecommendation {
  recommendedPath: TransformationPath
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  overallScore: number // 0-100 (AI readiness)
  readinessScores: ReadinessScore[]
  riskFlags: RiskFlag[]
  justification: string
  alternativePathConsiderations: string[]
}

export interface RiskFlag {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  category: string
  description: string
  mitigation: string
}

/**
 * Main path recommendation function
 */
export async function recommendTransformationPath(
  project: Project,
  responses: AssessmentResponse[]
): Promise<PathRecommendation> {

  // Calculate readiness scores across all dimensions
  const readinessScores: ReadinessScore[] = [
    calculateDataQualityScore(responses),
    calculateGovernanceMaturityScore(responses),
    calculateComplianceReadinessScore(responses, project),
    calculateTechnicalCapabilityScore(responses),
    calculateOrganizationalReadinessScore(responses),
    calculateBudgetTimelineScore(project, responses),
  ]

  // Calculate weighted overall score
  const overallScore = calculateWeightedScore(readinessScores)

  // Identify risk flags
  const riskFlags = identifyRiskFlags(responses, project, readinessScores)

  // Determine recommended path based on scores and risk flags
  const { recommendedPath, confidence, justification, alternativeConsiderations } =
    determineRecommendedPath(overallScore, readinessScores, riskFlags, project)

  return {
    recommendedPath,
    confidence,
    overallScore,
    readinessScores,
    riskFlags,
    justification,
    alternativePathConsiderations: alternativeConsiderations,
  }
}

/**
 * Data Quality Score (Weight: 0.25)
 * Assesses quality, completeness, and accessibility of data
 */
function calculateDataQualityScore(responses: AssessmentResponse[]): ReadinessScore {
  const findings: string[] = []
  const recommendations: string[] = []
  let score = 50 // Start at neutral

  // Look for data tier responses
  const dataResponses = responses.filter((r) => r.tier === 'DATA')

  if (dataResponses.length === 0) {
    findings.push('No data tier assessment completed')
    score -= 20
  } else {
    // Check for data quality indicators
    const hasDataCatalog = dataResponses.some((r) =>
      r.response?.toLowerCase().includes('catalog') ||
      r.response?.toLowerCase().includes('metadata')
    )
    const hasDataGovernance = dataResponses.some((r) =>
      r.response?.toLowerCase().includes('governance') ||
      r.response?.toLowerCase().includes('steward')
    )
    const hasCleanData = dataResponses.some((r) =>
      r.response?.toLowerCase().includes('clean') ||
      r.response?.toLowerCase().includes('quality')
    )

    if (hasDataCatalog) {
      score += 15
      findings.push('Data catalog in place')
    } else {
      score -= 10
      recommendations.push('Establish data catalog before AI adoption')
    }

    if (hasDataGovernance) {
      score += 15
      findings.push('Data governance processes exist')
    } else {
      score -= 10
      recommendations.push('Implement data governance framework')
    }

    if (hasCleanData) {
      score += 10
      findings.push('Data quality processes mentioned')
    } else {
      recommendations.push('Invest in data quality improvement')
    }
  }

  return {
    category: 'Data Quality & Accessibility',
    score: Math.max(0, Math.min(100, score)),
    weight: 0.25,
    findings,
    recommendations,
  }
}

/**
 * Governance Maturity Score (Weight: 0.20)
 * Assesses organizational governance and compliance processes
 */
function calculateGovernanceMaturityScore(responses: AssessmentResponse[]): ReadinessScore {
  const findings: string[] = []
  const recommendations: string[] = []
  let score = 50

  // Check for governance-related keywords in responses
  const governanceKeywords = ['policy', 'governance', 'compliance', 'audit', 'standard', 'framework']
  const governanceResponses = responses.filter((r) =>
    governanceKeywords.some((keyword) => r.response?.toLowerCase().includes(keyword))
  )

  if (governanceResponses.length > 5) {
    score += 20
    findings.push('Strong governance culture evidenced in multiple responses')
  } else if (governanceResponses.length > 2) {
    score += 10
    findings.push('Some governance processes in place')
  } else {
    score -= 15
    recommendations.push('Establish governance framework before AI adoption')
  }

  // Check for AI-specific governance readiness flags
  const aiReadinessFlags = responses.filter((r) => r.aiReadinessFlag === 'YES')
  if (aiReadinessFlags.length > 3) {
    score += 15
    findings.push('AI readiness flags indicate preparation')
  }

  return {
    category: 'Governance & Policy Maturity',
    score: Math.max(0, Math.min(100, score)),
    weight: 0.20,
    findings,
    recommendations,
  }
}

/**
 * Compliance Readiness Score (Weight: 0.20)
 * Assesses regulatory compliance requirements and readiness
 */
function calculateComplianceReadinessScore(
  responses: AssessmentResponse[],
  project: Project
): ReadinessScore {
  const findings: string[] = []
  const recommendations: string[] = []
  let score = 50

  // Check for compliance-heavy industries
  const industryKeywords = {
    healthcare: ['hipaa', 'health', 'medical', 'patient'],
    finance: ['pci', 'sox', 'financial', 'bank'],
    government: ['fedramp', 'nist', 'government', 'public sector'],
  }

  const projectDescription = project.description?.toLowerCase() || ''
  const allResponses = responses.map((r) => r.response?.toLowerCase() || '').join(' ')

  let isComplianceHeavy = false

  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some((kw) => projectDescription.includes(kw) || allResponses.includes(kw))) {
      isComplianceHeavy = true
      findings.push(`${industry.charAt(0).toUpperCase() + industry.slice(1)} industry detected - high compliance requirements`)
      score -= 20 // AI adoption more complex in compliance-heavy industries
    }
  }

  if (isComplianceHeavy) {
    recommendations.push('Consider AI-Free path or implement robust AI governance')
    recommendations.push('Engage compliance team early in AI evaluation')
  } else {
    score += 10
    findings.push('Lower compliance burden allows flexibility')
  }

  // Check for existing compliance processes
  const complianceResponses = responses.filter((r) =>
    r.response?.toLowerCase().includes('compliant') ||
    r.response?.toLowerCase().includes('regulation') ||
    r.response?.toLowerCase().includes('audit')
  )

  if (complianceResponses.length > 0) {
    score += 15
    findings.push('Existing compliance processes can be extended to AI')
  }

  return {
    category: 'Regulatory Compliance',
    score: Math.max(0, Math.min(100, score)),
    weight: 0.20,
    findings,
    recommendations,
  }
}

/**
 * Technical Capability Score (Weight: 0.15)
 * Assesses technical team skills and infrastructure readiness
 */
function calculateTechnicalCapabilityScore(responses: AssessmentResponse[]): ReadinessScore {
  const findings: string[] = []
  const recommendations: string[] = []
  let score = 50

  // Check for cloud infrastructure
  const cloudResponses = responses.filter((r) => r.tier === 'CLOUD')
  const hasCloud = cloudResponses.some((r) =>
    r.response?.toLowerCase().includes('azure') ||
    r.response?.toLowerCase().includes('aws') ||
    r.response?.toLowerCase().includes('gcp')
  )

  if (hasCloud) {
    score += 15
    findings.push('Cloud infrastructure in place - foundation for AI')
  } else {
    score -= 10
    recommendations.push('Migrate to cloud before AI adoption')
  }

  // Check for modern API tier
  const apiResponses = responses.filter((r) => r.tier === 'API')
  const hasModernAPI = apiResponses.some((r) =>
    r.response?.toLowerCase().includes('rest') ||
    r.response?.toLowerCase().includes('graphql') ||
    r.response?.toLowerCase().includes('microservice')
  )

  if (hasModernAPI) {
    score += 10
    findings.push('Modern API architecture supports AI integration')
  }

  // Check for technical skills mentions
  const skillKeywords = ['developer', 'engineer', 'architect', 'devops', 'mlops']
  const hasSkills = responses.some((r) =>
    skillKeywords.some((skill) => r.response?.toLowerCase().includes(skill))
  )

  if (hasSkills) {
    score += 10
    findings.push('Technical talent mentioned')
  } else {
    recommendations.push('Assess team skills or plan training/hiring')
  }

  return {
    category: 'Technical Capability',
    score: Math.max(0, Math.min(100, score)),
    weight: 0.15,
    findings,
    recommendations,
  }
}

/**
 * Organizational Readiness Score (Weight: 0.10)
 * Assesses change management and organizational readiness
 */
function calculateOrganizationalReadinessScore(responses: AssessmentResponse[]): ReadinessScore {
  const findings: string[] = []
  const recommendations: string[] = []
  let score = 50

  // Check for change management indicators
  const changeKeywords = ['training', 'adoption', 'stakeholder', 'communication', 'change management']
  const changeResponses = responses.filter((r) =>
    changeKeywords.some((keyword) => r.response?.toLowerCase().includes(keyword))
  )

  if (changeResponses.length > 3) {
    score += 15
    findings.push('Change management considerations evident')
  } else {
    recommendations.push('Develop change management strategy')
  }

  // Check for executive support
  const executiveSupport = responses.some((r) =>
    r.response?.toLowerCase().includes('executive') ||
    r.response?.toLowerCase().includes('leadership') ||
    r.response?.toLowerCase().includes('c-level')
  )

  if (executiveSupport) {
    score += 15
    findings.push('Executive support mentioned')
  } else {
    recommendations.push('Secure executive sponsorship before AI initiatives')
  }

  return {
    category: 'Organizational Readiness',
    score: Math.max(0, Math.min(100, score)),
    weight: 0.10,
    findings,
    recommendations,
  }
}

/**
 * Budget & Timeline Score (Weight: 0.10)
 * Assesses resource availability and timeline constraints
 */
function calculateBudgetTimelineScore(
  project: Project,
  responses: AssessmentResponse[]
): ReadinessScore {
  const findings: string[] = []
  const recommendations: string[] = []
  let score = 50

  // Check for budget/resource mentions
  const budgetKeywords = ['budget', 'funding', 'resource', 'cost', 'investment']
  const hasBudgetDiscussion = responses.some((r) =>
    budgetKeywords.some((keyword) => r.response?.toLowerCase().includes(keyword))
  )

  if (hasBudgetDiscussion) {
    score += 10
    findings.push('Budget considerations discussed')
  }

  // Check for timeline mentions
  const timelineKeywords = ['timeline', 'deadline', 'schedule', 'phase', 'roadmap']
  const hasTimelineDiscussion = responses.some((r) =>
    timelineKeywords.some((keyword) => r.response?.toLowerCase().includes(keyword))
  )

  if (hasTimelineDiscussion) {
    score += 10
    findings.push('Timeline considerations discussed')
  }

  // AI projects require more budget and time
  const hasAIBudget = responses.some((r) =>
    r.response?.toLowerCase().includes('ml') ||
    r.response?.toLowerCase().includes('ai budget') ||
    r.response?.toLowerCase().includes('model training')
  )

  if (hasAIBudget) {
    score += 15
    findings.push('AI-specific budget allocation mentioned')
  } else {
    recommendations.push('AI adoption requires 20-30% additional budget vs traditional modernization')
  }

  return {
    category: 'Budget & Timeline',
    score: Math.max(0, Math.min(100, score)),
    weight: 0.10,
    findings,
    recommendations,
  }
}

/**
 * Calculate weighted overall score
 */
function calculateWeightedScore(readinessScores: ReadinessScore[]): number {
  const totalWeight = readinessScores.reduce((sum, rs) => sum + rs.weight, 0)
  const weightedSum = readinessScores.reduce((sum, rs) => sum + rs.score * rs.weight, 0)
  return Math.round(weightedSum / totalWeight)
}

/**
 * Identify risk flags
 */
function identifyRiskFlags(
  responses: AssessmentResponse[],
  project: Project,
  readinessScores: ReadinessScore[]
): RiskFlag[] {
  const flags: RiskFlag[] = []

  // Critical: Compliance-heavy industry without governance
  const complianceScore = readinessScores.find((rs) => rs.category === 'Regulatory Compliance')
  const governanceScore = readinessScores.find((rs) => rs.category === 'Governance & Policy Maturity')

  if (complianceScore && complianceScore.score < 50 && governanceScore && governanceScore.score < 40) {
    flags.push({
      severity: 'CRITICAL',
      category: 'Compliance & Governance',
      description: 'Compliance-heavy industry without mature governance - high risk for AI adoption',
      mitigation: 'Strongly recommend AI-Free path or delay AI until governance matures',
    })
  }

  // High: Low data quality
  const dataQualityScore = readinessScores.find((rs) => rs.category === 'Data Quality & Accessibility')
  if (dataQualityScore && dataQualityScore.score < 40) {
    flags.push({
      severity: 'HIGH',
      category: 'Data Quality',
      description: 'Poor data quality will lead to unreliable AI models',
      mitigation: 'Invest 6-12 months in data quality improvement before AI',
    })
  }

  // Medium: No cloud infrastructure
  const technicalScore = readinessScores.find((rs) => rs.category === 'Technical Capability')
  const hasCloud = responses.some(
    (r) =>
      r.tier === 'CLOUD' &&
      (r.response?.toLowerCase().includes('azure') ||
        r.response?.toLowerCase().includes('aws') ||
        r.response?.toLowerCase().includes('gcp'))
  )

  if (technicalScore && technicalScore.score < 50 && !hasCloud) {
    flags.push({
      severity: 'MEDIUM',
      category: 'Infrastructure',
      description: 'On-premises infrastructure limits AI scalability',
      mitigation: 'Plan cloud migration as part of transformation',
    })
  }

  return flags
}

/**
 * Determine recommended path based on all factors
 */
function determineRecommendedPath(
  overallScore: number,
  readinessScores: ReadinessScore[],
  riskFlags: RiskFlag[],
  project: Project
): {
  recommendedPath: TransformationPath
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  justification: string
  alternativeConsiderations: string[]
} {
  const criticalFlags = riskFlags.filter((f) => f.severity === 'CRITICAL')
  const highFlags = riskFlags.filter((f) => f.severity === 'HIGH')

  let recommendedPath: TransformationPath
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  let justification: string
  const alternativeConsiderations: string[] = []

  // Decision logic
  if (criticalFlags.length > 0) {
    // Critical flags = AI-Free path
    recommendedPath = 'AI_FREE'
    confidence = 'HIGH'
    justification = `Critical risk flags present: ${criticalFlags.map((f) => f.description).join('; ')}. AI-Free path recommended to ensure compliance and reduce risk.`
    alternativeConsiderations.push('Consider AI-Included path after addressing governance and compliance gaps (12-18 month timeline)')
  } else if (overallScore >= 70) {
    // High score = AI-Included path
    recommendedPath = 'AI_INCLUDED'
    confidence = highFlags.length === 0 ? 'HIGH' : 'MEDIUM'
    justification = `Strong readiness across data quality, governance, and technical capability (overall score: ${overallScore}/100). Organization is well-positioned for AI adoption.`
    if (highFlags.length > 0) {
      alternativeConsiderations.push(`Address high-risk flags: ${highFlags.map((f) => f.description).join('; ')}`)
    }
  } else if (overallScore >= 50) {
    // Medium score = Conditional AI or AI-Free
    if (highFlags.length >= 2) {
      recommendedPath = 'AI_FREE'
      confidence = 'MEDIUM'
      justification = `Moderate readiness (score: ${overallScore}/100) with ${highFlags.length} high-risk flags. AI-Free path recommended initially, with option to add AI in later phases.`
      alternativeConsiderations.push('Phase 2 AI adoption possible after addressing: ' + highFlags.map((f) => f.category).join(', '))
    } else {
      recommendedPath = 'AI_INCLUDED'
      confidence = 'LOW'
      justification = `Borderline readiness (score: ${overallScore}/100). AI adoption possible but requires significant upfront investment in governance, data quality, and technical capability.`
      alternativeConsiderations.push('Consider AI-Free path if timeline or budget is constrained')
      alternativeConsiderations.push('Plan 3-6 month "AI readiness sprint" before full adoption')
    }
  } else {
    // Low score = AI-Free path
    recommendedPath = 'AI_FREE'
    confidence = 'HIGH'
    justification = `Low readiness score (${overallScore}/100). Recommend focusing on foundational modernization (cloud, data, APIs) before considering AI. AI-Free path delivers value faster with lower risk.`
    alternativeConsiderations.push('Revisit AI adoption after 12-18 months of foundational improvements')
  }

  return { recommendedPath, confidence, justification, alternativeConsiderations }
}

/**
 * Generate comparison report between AI-Included and AI-Free paths
 */
export interface PathComparison {
  aiIncluded: PathDetails
  aiFree: PathDetails
  keyDifferences: ComparisonPoint[]
}

export interface PathDetails {
  timeline: string
  estimatedCost: string
  keyTechnologies: string[]
  risks: string[]
  benefits: string[]
}

export interface ComparisonPoint {
  dimension: string
  aiIncluded: string
  aiFree: string
  advantage: 'AI_INCLUDED' | 'AI_FREE' | 'NEUTRAL'
}

export function generatePathComparison(recommendation: PathRecommendation): PathComparison {
  return {
    aiIncluded: {
      timeline: '32-40 weeks (including AI model development and training)',
      estimatedCost: '$800K - $1.5M (includes MLOps platform, model training, governance)',
      keyTechnologies: [
        'Azure ML / AWS SageMaker / Google Vertex AI',
        'MLOps platform (MLflow, Kubeflow)',
        'Model governance tools',
        'AI-powered features (chatbots, predictive analytics, automation)',
      ],
      risks: [
        'AI model bias and fairness concerns',
        'Data privacy and PII exposure',
        'Model drift and maintenance overhead',
        'Regulatory uncertainty (AI regulations evolving)',
        'Longer time to value (model development takes time)',
      ],
      benefits: [
        'Automation potential (30-50% efficiency gains)',
        'Predictive capabilities (forecasting, anomaly detection)',
        'Enhanced user experience (personalization, chatbots)',
        'Competitive advantage through AI differentiation',
        'Future-proof architecture',
      ],
    },
    aiFree: {
      timeline: '24-32 weeks (focused on modernization without AI complexity)',
      estimatedCost: '$500K - $900K (traditional cloud, APIs, modernization)',
      keyTechnologies: [
        'Cloud platform (Azure, AWS, GCP)',
        'Modern API gateway (APIM, Kong)',
        'Rule-based automation (Logic Apps, SSIS, Azure Functions)',
        'Deterministic workflows and business logic',
      ],
      risks: [
        'Lack of predictive capabilities',
        'Manual processes not automated',
        'Competitive disadvantage if competitors adopt AI',
        'Future re-architecture needed if AI added later',
      ],
      benefits: [
        'Faster time to value (simpler implementation)',
        'Lower cost (no MLOps, model training)',
        'Easier compliance (deterministic, auditable)',
        'Lower risk (proven technologies)',
        'Predictable outcomes (no model drift)',
      ],
    },
    keyDifferences: [
      {
        dimension: 'Timeline',
        aiIncluded: '32-40 weeks',
        aiFree: '24-32 weeks',
        advantage: 'AI_FREE',
      },
      {
        dimension: 'Cost',
        aiIncluded: '$800K - $1.5M',
        aiFree: '$500K - $900K',
        advantage: 'AI_FREE',
      },
      {
        dimension: 'Compliance Complexity',
        aiIncluded: 'High (AI governance, bias testing, explainability)',
        aiFree: 'Low (standard audit trails)',
        advantage: 'AI_FREE',
      },
      {
        dimension: 'Automation Potential',
        aiIncluded: 'High (30-50% efficiency gains)',
        aiFree: 'Medium (15-25% gains via rule-based automation)',
        advantage: 'AI_INCLUDED',
      },
      {
        dimension: 'Future Competitiveness',
        aiIncluded: 'High (AI differentiation)',
        aiFree: 'Medium (modernization without AI edge)',
        advantage: 'AI_INCLUDED',
      },
      {
        dimension: 'Risk Profile',
        aiIncluded: 'Higher (model bias, drift, privacy)',
        aiFree: 'Lower (proven, deterministic)',
        advantage: 'AI_FREE',
      },
    ],
  }
}
