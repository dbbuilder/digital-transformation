/**
 * AI Service - OpenAI GPT-4o Mini Integration
 *
 * Enhances DigiForm with AI-powered capabilities:
 * - Assessment analysis and insights
 * - Intelligent recommendations
 * - Deliverable content generation
 * - Gap analysis and risk identification
 *
 * Privacy: AI features are opt-in and require API key configuration
 */

import OpenAI from 'openai'
import type { Project, AssessmentResponse, Tier } from '../types'
import type { PathRecommendation } from './PathRecommendationEngine'

export interface AIConfig {
  apiKey: string
  enabled: boolean
  model: 'gpt-4o-mini' | 'gpt-4' | 'gpt-3.5-turbo'
}

export interface AIAnalysisResult {
  summary: string
  keyFindings: string[]
  recommendations: string[]
  risks: string[]
  opportunities: string[]
  confidence: number
}

export interface AIDeliverableContent {
  executiveSummary: string
  currentStateAnalysis: string
  futureStateVision: string
  transformationStrategy: string
  riskMitigation: string
  nextSteps: string[]
}

/**
 * AI Service Class
 */
export class AIService {
  private openai: OpenAI | null = null
  private config: AIConfig

  constructor(config?: Partial<AIConfig>) {
    this.config = {
      apiKey: config?.apiKey || '',
      enabled: config?.enabled || false,
      model: config?.model || 'gpt-4o-mini',
    }

    if (this.config.apiKey && this.config.enabled) {
      this.openai = new OpenAI({
        apiKey: this.config.apiKey,
        dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
      })
    }
  }

  /**
   * Check if AI is available
   */
  isAvailable(): boolean {
    return this.openai !== null && this.config.enabled
  }

  /**
   * Analyze assessment responses and generate insights
   */
  async analyzeAssessments(
    project: Project,
    responses: AssessmentResponse[]
  ): Promise<AIAnalysisResult> {
    if (!this.isAvailable()) {
      throw new Error('AI service not available - configure API key in settings')
    }

    const prompt = this.buildAssessmentAnalysisPrompt(project, responses)

    const completion = await this.openai!.chat.completions.create({
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: `You are an expert digital transformation consultant analyzing a client's current state and readiness.
Provide concise, actionable insights based on their assessment responses.
Focus on practical recommendations and realistic risk assessment.
Response format: JSON with keys: summary, keyFindings (array), recommendations (array), risks (array), opportunities (array), confidence (0-1)`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    return {
      summary: result.summary || 'No analysis available',
      keyFindings: result.keyFindings || [],
      recommendations: result.recommendations || [],
      risks: result.risks || [],
      opportunities: result.opportunities || [],
      confidence: result.confidence || 0.5,
    }
  }

  /**
   * Enhance path recommendation with AI insights
   */
  async enhancePathRecommendation(
    project: Project,
    responses: AssessmentResponse[],
    baseRecommendation: PathRecommendation
  ): Promise<string> {
    if (!this.isAvailable()) {
      return baseRecommendation.justification
    }

    const prompt = `
Project: ${project.name}
Current Path Recommendation: ${baseRecommendation.recommendedPath}
Confidence: ${baseRecommendation.confidence}
Overall Score: ${baseRecommendation.overallScore}/100

Readiness Scores:
${baseRecommendation.readinessScores.map(rs => `- ${rs.category}: ${rs.score}/100`).join('\n')}

Risk Flags:
${baseRecommendation.riskFlags.map(rf => `- [${rf.severity}] ${rf.description}`).join('\n')}

Assessment Responses (${responses.length} total):
${responses.slice(0, 10).map(r => `- [${r.tier}] ${r.question}: ${r.response?.substring(0, 100)}`).join('\n')}

Provide a 2-3 paragraph executive summary that explains WHY this path is recommended,
considering the organization's specific context, readiness, and constraints.
Be specific and reference actual findings from the assessment.
`

    const completion = await this.openai!.chat.completions.create({
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: `You are a senior digital transformation consultant providing executive-level
recommendations. Write in a professional, confident tone. Be specific and cite evidence.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 500,
    })

    return completion.choices[0].message.content || baseRecommendation.justification
  }

  /**
   * Generate deliverable content (executive deck, SOW, etc.)
   */
  async generateDeliverableContent(
    project: Project,
    responses: AssessmentResponse[],
    pathRecommendation?: PathRecommendation
  ): Promise<AIDeliverableContent> {
    if (!this.isAvailable()) {
      throw new Error('AI service not available - configure API key in settings')
    }

    const prompt = `
Generate professional deliverable content for a digital transformation engagement.

Project: ${project.name}
Description: ${project.description || 'Not provided'}
Transformation Path: ${pathRecommendation?.recommendedPath || 'UNDECIDED'}

Assessment Summary:
- Total responses: ${responses.length}
- Tiers covered: ${[...new Set(responses.map(r => r.tier))].join(', ')}

Key Responses:
${responses.slice(0, 15).map(r => `- [${r.tier}] ${r.question}: ${r.response?.substring(0, 150)}`).join('\n')}

Generate:
1. Executive Summary (3-4 sentences)
2. Current State Analysis (2 paragraphs)
3. Future State Vision (2 paragraphs)
4. Transformation Strategy (3-4 bullet points)
5. Risk Mitigation (3-4 bullet points)
6. Next Steps (5-7 action items)

Return as JSON with keys: executiveSummary, currentStateAnalysis, futureStateVision,
transformationStrategy, riskMitigation, nextSteps (array)
`

    const completion = await this.openai!.chat.completions.create({
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: `You are a professional digital transformation consultant writing client deliverables.
Use formal, executive-level language. Be specific and actionable.
Cite actual findings from the assessment responses provided.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    return {
      executiveSummary: result.executiveSummary || '',
      currentStateAnalysis: result.currentStateAnalysis || '',
      futureStateVision: result.futureStateVision || '',
      transformationStrategy: result.transformationStrategy || '',
      riskMitigation: result.riskMitigation || '',
      nextSteps: result.nextSteps || [],
    }
  }

  /**
   * Generate gap analysis between current and future state
   */
  async generateGapAnalysis(
    tier: Tier,
    currentStateResponses: AssessmentResponse[],
    futureStateGoals: string
  ): Promise<string[]> {
    if (!this.isAvailable()) {
      return ['AI service not available - configure API key to generate gap analysis']
    }

    const prompt = `
Tier: ${tier}
Future State Goals: ${futureStateGoals}

Current State Assessment Responses:
${currentStateResponses.map(r => `- ${r.question}: ${r.response}`).join('\n')}

Identify 5-7 specific gaps between current state and future state.
Be concrete and actionable. Each gap should be 1-2 sentences.
Return as JSON array of strings.
`

    const completion = await this.openai!.chat.completions.create({
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: `You are a technical architect identifying gaps in digital transformation projects.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0].message.content || '{"gaps":[]}')
    return result.gaps || []
  }

  /**
   * Suggest interview questions based on context
   */
  async suggestInterviewQuestions(
    tier: Tier,
    phase: string,
    existingResponses: AssessmentResponse[]
  ): Promise<string[]> {
    if (!this.isAvailable()) {
      return []
    }

    const prompt = `
Generate 3-5 additional discovery interview questions for:
Tier: ${tier}
Phase: ${phase}

Context from existing responses:
${existingResponses.map(r => `- ${r.question}: ${r.response?.substring(0, 100)}`).join('\n')}

Questions should:
- Dig deeper into areas with incomplete information
- Uncover hidden risks or opportunities
- Be specific and actionable
- Avoid redundancy with existing questions

Return as JSON array of strings.
`

    const completion = await this.openai!.chat.completions.create({
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: `You are an experienced digital transformation consultant conducting discovery interviews.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0].message.content || '{"questions":[]}')
    return result.questions || []
  }

  /**
   * Build assessment analysis prompt
   */
  private buildAssessmentAnalysisPrompt(project: Project, responses: AssessmentResponse[]): string {
    const tierSummary = this.summarizeResponsesByTier(responses)

    return `
Analyze the following digital transformation assessment for ${project.name}.

Project Context:
- Name: ${project.name}
- Description: ${project.description || 'Not provided'}
- Phase: ${project.currentPhase || 'Discovery'}
- Transformation Path: ${project.transformationPath || 'UNDECIDED'}

Assessment Summary by Tier:
${tierSummary}

Recent Responses (sample):
${responses.slice(0, 20).map(r => `
Question: ${r.question}
Tier: ${r.tier}
Response: ${r.response || 'No response yet'}
Priority: ${r.priority || 'MEDIUM'}
`).join('\n---\n')}

Analyze the current state, identify key findings, provide actionable recommendations,
highlight risks, and identify opportunities. Be specific and reference actual responses.
`
  }

  /**
   * Summarize responses by tier
   */
  private summarizeResponsesByTier(responses: AssessmentResponse[]): string {
    const tiers: Tier[] = ['UI', 'API', 'DATA', 'CLOUD', 'AI']
    const summary: string[] = []

    for (const tier of tiers) {
      const tierResponses = responses.filter(r => r.tier === tier)
      const answered = tierResponses.filter(r => r.response && r.response.trim() !== '')
      summary.push(`- ${tier}: ${answered.length}/${tierResponses.length} questions answered`)
    }

    return summary.join('\n')
  }
}

/**
 * Singleton AI service instance
 * Configured via app settings
 */
let aiServiceInstance: AIService | null = null

export function getAIService(config?: Partial<AIConfig>): AIService {
  if (!aiServiceInstance || config) {
    aiServiceInstance = new AIService(config)
  }
  return aiServiceInstance
}

export function configureAI(config: Partial<AIConfig>): void {
  aiServiceInstance = new AIService(config)
}

/**
 * Load AI configuration from localStorage
 */
export function loadAIConfig(): AIConfig | null {
  try {
    const stored = localStorage.getItem('digiform_ai_config')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load AI config:', error)
  }
  return null
}

/**
 * Save AI configuration to localStorage
 */
export function saveAIConfig(config: AIConfig): void {
  try {
    localStorage.setItem('digiform_ai_config', JSON.stringify(config))
    configureAI(config)
  } catch (error) {
    console.error('Failed to save AI config:', error)
  }
}
