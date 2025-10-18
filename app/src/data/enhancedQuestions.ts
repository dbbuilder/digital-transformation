// Enhanced Question Metadata - Detailed guidance for each question

import type { Phase, Tier } from '../types'

export interface EnhancedQuestionMetadata {
  // Matching criteria
  questionKeywords: string[] // Keywords to match original question
  phase?: Phase
  tier?: Tier

  // Enhanced content
  detailedQuestion: string // Longer, more directive phrasing
  subQuestions: string[] // Specific questions to ask the client
  whyItMatters: string // Why this question is important for transformation
  whatToListenFor: string[] // Key things to pay attention to in responses
  exampleGoodAnswer: string // Example of a comprehensive answer
  examplePoorAnswer: string // Example of insufficient answer
  criticalForSOW: boolean // Is this required for Statement of Work?
}

export const enhancedQuestionMetadata: EnhancedQuestionMetadata[] = [
  // DISCOVERY - UI - Top 3 Journeys
  {
    questionKeywords: ['top 3 journeys', 'user journeys', 'outcomes and success metrics'],
    phase: 'DISCOVERY',
    tier: 'UI',
    detailedQuestion: 'User Journey Prioritization and Impact Assessment: We need to identify the three most critical user workflows that, if improved, would deliver the greatest business value. For each journey, we must understand the complete context: who the users are, what they\'re trying to accomplish, what\'s currently preventing success, and how we\'ll measure improvement. This forms the foundation of our UI modernization roadmap.',
    subQuestions: [
      '1. "Can you walk me through the top 3 user workflows that cause the most problems or have the biggest business impact?"',
      '2. "For each journey, who are the users? (Roles, technical proficiency, frequency of use)"',
      '3. "What specific problems do users encounter in each journey? (Where do they get stuck, confused, or give up?)"',
      '4. "How is this currently measured? (Do you have analytics, error rates, completion times, support tickets?)"',
      '5. "What would success look like? (How much faster, fewer errors, higher completion rate?)"',
      '6. "What\'s the business impact of fixing this? (Revenue, efficiency, customer satisfaction, compliance risk?)"',
      '7. "Can you show me the current user flow? (Screenshots, screen recording, or walk through live)"',
      '8. "Are there different user segments with different needs? (Mobile vs desktop, power users vs casual, internal vs external?)"'
    ],
    whyItMatters: 'These three journeys will drive your entire UI transformation budget, timeline, and success criteria. Without clear prioritization and measurable outcomes, we risk building the wrong features or being unable to demonstrate ROI. This also helps us right-size the project scope and set realistic expectations with stakeholders. The specific metrics become our baseline for measuring transformation success and justifying the investment in the Statement of Work.',
    whatToListenFor: [
      '🎯 Specific journey names (not vague like "improve UX")',
      '📊 Quantifiable pain points ("40% abandon cart" not "some users have problems")',
      '👥 Clear user personas and volumes',
      '💰 Business impact ($, time, risk)',
      '📈 Current state metrics (baseline data)',
      '🎯 Specific target metrics (not "make it better")',
      '🔍 Evidence of the problem (analytics, tickets, feedback)',
      '⚠️ RED FLAG: Stakeholders disagree on priorities',
      '⚠️ RED FLAG: No data or metrics available'
    ],
    exampleGoodAnswer: 'Journey 1: Patient appointment booking (external patients, 15k monthly bookings). Current: 12 clicks, 8 minutes average, 40% abandon before completion (Google Analytics). Pain: confusing multi-step form, unclear availability, no confirmation until 24hrs later. Users: 65% mobile, 35% desktop, ages 25-75. Target: Reduce to 4 clicks, 3 minutes, <10% abandonment. Success metric: GA4 funnel tracking + appointment completion rate. Business impact: 40% abandonment × 15k bookings × $200 avg value = $1.2M annual revenue opportunity. Shown: Current multi-step flow screenshots, GA abandonment funnel, user feedback themes from 200+ support tickets.',
    examplePoorAnswer: 'We want to improve the user experience on our website. Users complain it\'s slow and hard to use. We should make it more modern and user-friendly.',
    criticalForSOW: true
  },

  // DISCOVERY - UI - Tech Stack
  {
    questionKeywords: ['ui stacks', 'telemetry', 'stacks in use'],
    phase: 'DISCOVERY',
    tier: 'UI',
    detailedQuestion: 'Front-End Technology Inventory and Observability Assessment: We need a complete inventory of your UI technology landscape to assess technical debt, security vulnerabilities, and migration complexity. This includes all frameworks, libraries, build tools, and dependencies across all applications and modules. Equally important is understanding what visibility you have into production behavior - analytics, error tracking, performance monitoring, and user behavior tracking. This determines our ability to measure improvement and troubleshoot issues during and after migration.',
    subQuestions: [
      '1. "What front-end frameworks and libraries are you using? (Please include version numbers)"',
      '2. "Walk me through your package.json or dependency list - what are the key dependencies?"',
      '3. "Are there different tech stacks for different parts of the application? (Admin vs user-facing, mobile vs web, legacy vs modern?)"',
      '4. "How old are these technologies? When were they last updated or upgraded?"',
      '5. "What build tools do you use? (Webpack, Vite, Rollup, Parcel, etc.)"',
      '6. "What analytics do you have in place? (Google Analytics, Mixpanel, Amplitude, etc.)"',
      '7. "How do you track errors in production? (Sentry, Rollbar, LogRocket, etc.)"',
      '8. "Do you have performance monitoring? (Core Web Vitals, Lighthouse, etc.)"',
      '9. "Any session replay tools? (Fullstory, Hotjar, LogRocket?)"',
      '10. "What browser/device compatibility do you need to support? (IE11, mobile, specific browsers?)"',
      '11. "Can I see your build pipeline and deployment process?"',
      '12. "Do you have automated testing? What\'s the coverage percentage?"'
    ],
    whyItMatters: 'Your technology stack determines migration strategy, effort estimates, and total cost. Legacy frameworks mean higher migration complexity. Missing monitoring means we\'re flying blind during deployment. Known security vulnerabilities create compliance risk. This assessment directly feeds into the technical approach section of the SOW, including timeline, team composition, and technology recommendations. It also identifies any blockers (like IE11 support preventing modern framework adoption) that must be addressed.',
    whatToListenFor: [
      '🔧 Specific framework names AND version numbers',
      '📅 How far behind current versions (technical debt indicator)',
      '🔍 Multiple tech stacks = complexity and migration risk',
      '📊 What monitoring exists (or gaps that need filling)',
      '🔒 Security vulnerabilities in dependencies',
      '⚠️ Browser compatibility constraints (IE11 = major blocker)',
      '🧪 Testing coverage percentage',
      '⚠️ RED FLAG: No one knows the full tech stack',
      '⚠️ RED FLAG: No monitoring/analytics whatsoever',
      '⚠️ RED FLAG: Critical dependencies 2+ years out of date'
    ],
    exampleGoodAnswer: 'Primary: React 18.2.0, TypeScript 4.9.5, Vite 4.1.0 bundler. Main app deployed weekly. Legacy admin portal: Angular 1.6.8 (scheduled for deprecation, represents ~20% of codebase, 2 developers maintain it). Dependencies: React Router 6.8, Material-UI 5.11, Axios 1.3. Build: Vite for main app (2min builds), Webpack 4 for legacy (8min builds). Analytics: Google Analytics 4 (pageviews, events), Mixpanel (product analytics). Error tracking: Sentry (5k events/month, alert on error rate >1%). Performance: Lighthouse CI in build pipeline, targeting >90 score. NO session replay currently. Browsers: Chrome/Firefox/Safari latest 2 versions, Edge, NO IE11 (sunset 2022). Testing: Jest + React Testing Library, 78% coverage. Shown: package.json, build configs, Sentry dashboard, Lighthouse scores.',
    examplePoorAnswer: 'We use React and some other libraries. We have Google Analytics. Not sure about versions or what else is installed.',
    criticalForSOW: true
  },

  // DISCOVERY - API - Capabilities Blocked
  {
    questionKeywords: ['capabilities', 'blocked', 'api limitations', 'sla issues'],
    phase: 'DISCOVERY',
    tier: 'API',
    detailedQuestion: 'API Capability Gap Analysis and Service Level Assessment: We need to identify business capabilities that are currently impossible, too slow, or unreliable due to API limitations. This includes missing endpoints, performance issues, authentication barriers, rate limiting problems, or SLA violations. Understanding these gaps helps us prioritize API development and set appropriate service level objectives for the new architecture. We also need to understand the business impact of these limitations - what revenue, efficiency, or customer experience improvements are being blocked.',
    subQuestions: [
      '1. "What business capabilities or features can\'t you build today because of API limitations?"',
      '2. "Are there any APIs that are too slow or unreliable? (What are the current response times and SLAs?)"',
      '3. "Do you experience rate limiting or throttling issues with any APIs?"',
      '4. "Are there authentication or authorization barriers preventing API integration?"',
      '5. "Which partner or third-party integrations are problematic? (Failed connections, timeouts, etc.)"',
      '6. "What\'s the business impact of these API limitations? (Lost revenue, manual workarounds, poor UX?)"',
      '7. "Are there any APIs you wish existed but don\'t? (What would they enable?)"',
      '8. "How do you currently monitor API health and performance?"',
      '9. "What are the most frequent API errors or failures?"',
      '10. "Are there seasonal or peak-time issues with API capacity?"'
    ],
    whyItMatters: 'API limitations directly translate to blocked business value. Every missing or problematic API represents lost revenue, manual workarounds, or competitive disadvantage. This analysis helps us prioritize which APIs to build or fix first based on business impact. It also sets the performance requirements and SLA targets for the new API layer. In the SOW, this drives the API development roadmap, capacity planning, and success criteria. We need quantified impact to justify the investment and set appropriate expectations.',
    whatToListenFor: [
      '🚫 Specific capabilities blocked (not vague complaints)',
      '⏱️ Quantified performance issues ("3 second response time" not "slow")',
      '📊 Current SLA violations and frequency',
      '💰 Business impact of limitations ($, efficiency, customers)',
      '🔌 Partner integration pain points',
      '📈 Growth limitations (can\'t scale to handle volume)',
      '🔧 Workarounds currently in place (= real pain)',
      '⚠️ RED FLAG: No API monitoring in place',
      '⚠️ RED FLAG: Can\'t quantify business impact',
      '⚠️ RED FLAG: "Everything works fine" (likely unaware of issues)'
    ],
    exampleGoodAnswer: 'Critical gap: Cannot build mobile app feature for real-time order tracking because Order Status API doesn\'t support webhooks (only polling every 5 minutes). Business impact: Customers call support for order status (2,500 calls/month × $8/call = $20k monthly cost). Performance issue: Product Search API averages 2.3 seconds response time, target <500ms. Causes 15% cart abandonment per Mixpanel funnel analysis. Partner integration: Shipping carrier API fails 3-5 times daily, requires manual order re-processing (30 min/incident, 100 incidents/month = 50 hours manual work). SLA violations: Payment API has 99.5% uptime, need 99.95% for PCI compliance. Peak issues: Black Friday traffic (10x normal) causes API timeouts, lost estimated $200k revenue in 2023. Monitoring: New Relic APM tracking response times and error rates. Shown: API response time graphs, error logs, support ticket volume.',
    examplePoorAnswer: 'Our APIs are slow sometimes and we have some integration issues. It would be nice to have better APIs.',
    criticalForSOW: true
  },

  // DISCOVERY - DATA - Decisions and SLAs
  {
    questionKeywords: ['decisions', 'freshness', 'accuracy', 'define slas'],
    phase: 'DISCOVERY',
    tier: 'DATA',
    detailedQuestion: 'Data-Driven Decision Requirements and Service Level Definition: We need to understand which business decisions depend on data, how current those decisions are today, and how current they need to be. This includes identifying data quality issues, establishing freshness requirements (real-time, hourly, daily, etc.), and defining accuracy expectations. We also need to understand the business impact of data delays or inaccuracies. This drives our data platform architecture, pipeline design, and technology choices (batch vs streaming, data warehouse vs data lake, etc.).',
    subQuestions: [
      '1. "What are the key business decisions that depend on data? (Pricing, inventory, forecasting, reporting, etc.)"',
      '2. "For each decision, how fresh does the data need to be? (Real-time, hourly, daily, weekly?)"',
      '3. "How current is the data today? (What\'s the delay between event and availability?)"',
      '4. "What data quality issues exist? (Missing data, duplicates, inaccuracies?)"',
      '5. "How do you measure data accuracy today? (What percentage of data is correct?)"',
      '6. "What\'s the business impact of stale or inaccurate data? (Revenue loss, compliance risk, poor decisions?)"',
      '7. "Are there regulatory or compliance requirements for data accuracy and retention? (GDPR, SOX, HIPAA?)"',
      '8. "What reports or dashboards are most critical to the business?"',
      '9. "How long does it take to generate these reports today?"',
      '10. "What data is currently unavailable but would be valuable for decision-making?"'
    ],
    whyItMatters: 'Data SLAs drive architecture decisions and technology costs. Real-time requirements mean streaming infrastructure (Kafka, Kinesis), while daily batch is much simpler. Data quality directly impacts decision quality - 10% error rate could mean millions in bad decisions. Compliance requirements are non-negotiable and determine retention policies, access controls, and audit capabilities. In the SOW, this defines the data platform scope, technology stack, and operational complexity. It also sets measurable success criteria that business stakeholders care about.',
    whatToListenFor: [
      '⏰ Specific freshness requirements by use case',
      '📊 Current vs required data freshness gap',
      '✅ Data quality metrics (% accuracy, completeness)',
      '💰 Quantified impact of bad data',
      '📋 Compliance requirements (GDPR, HIPAA, SOX, etc.)',
      '🔍 Critical reports and their generation time',
      '📈 Data volume and growth rate',
      '⚠️ RED FLAG: No data quality measurement',
      '⚠️ RED FLAG: Can\'t articulate business impact',
      '⚠️ RED FLAG: "Real-time" without understanding cost'
    ],
    exampleGoodAnswer: 'Critical decision: Dynamic pricing for 50k SKUs. Current: Prices updated daily at midnight based on previous day\'s sales. Need: Hourly updates to respond to competitors (who change prices 10-20 times daily). Gap costs estimated $2M annually in lost margin. Data quality: Inventory accuracy 94%, need >99% to prevent overselling (costs $100/incident in customer service, 50 incidents/month). Compliance: GDPR requires ability to export customer data within 30 days, currently takes 5 days manual work. Report: Executive dashboard currently takes 6 hours to generate (runs overnight), need <15 minutes for morning meetings. Data sources: 5 operational databases, 2 SaaS tools, 3 partner feeds. Volume: 10M transactions/month, growing 30% YoY. Quality issues: 5-8% of product data missing dimensions/weights, breaks shipping cost calculations. Shown: Pricing delay impact analysis, inventory error logs, data quality dashboard.',
    examplePoorAnswer: 'We need better data quality and faster reporting. Sometimes the data is wrong or out of date.',
    criticalForSOW: true
  },

  // DISCOVERY - CLOUD - Cost and Regional
  {
    questionKeywords: ['cost pressures', 'regional constraints', 'cloud'],
    phase: 'DISCOVERY',
    tier: 'CLOUD',
    detailedQuestion: 'Cloud Economics and Geographic Requirements Assessment: We need to understand your current cloud spend, cost pressures, and optimization opportunities. This includes identifying waste (unused resources, over-provisioned instances, etc.), understanding billing patterns, and establishing budget constraints. We also need to know your geographic requirements - where are your users, where is your data required to be stored (data sovereignty), and what regional availability you need. This directly impacts architecture decisions, provider selection, and cost modeling for the transformation.',
    subQuestions: [
      '1. "What\'s your current monthly cloud spend? (Break down by service if possible)"',
      '2. "How has cloud cost trended over the past year? (Growing, stable, decreasing?)"',
      '3. "What are your biggest cost drivers? (Compute, storage, data transfer, specific services?)"',
      '4. "Are there known areas of waste? (Unused resources, over-provisioned instances, etc.)"',
      '5. "Do you have budget constraints or cost reduction targets for the transformation?"',
      '6. "Where are your users geographically distributed?"',
      '7. "Are there data residency requirements? (GDPR, data sovereignty, regulatory?)"',
      '8. "What regions do you currently operate in? What regions do you need to support?"',
      '9. "Do you have disaster recovery or business continuity requirements? (Multi-region?)"',
      '10. "Are there seasonal or event-driven scaling patterns? (Black Friday, tax season, etc.)"',
      '11. "What\'s your disaster recovery time objective (RTO) and data loss tolerance (RPO)?"'
    ],
    whyItMatters: 'Cloud costs directly impact project ROI and ongoing operational budget. Understanding current spend helps us set realistic cost targets and identify quick wins. Regional requirements are architectural constraints - GDPR data residency isn\'t optional. Seasonal patterns determine autoscaling needs. In the SOW, this drives the cloud architecture design, region selection, disaster recovery approach, and total cost of ownership projections. Cost optimization opportunities can partially fund the transformation investment.',
    whatToListenFor: [
      '💵 Specific monthly/annual cloud spend',
      '📈 Cost trends and growth rate',
      '💸 Identified waste or optimization opportunities',
      '🌍 Geographic distribution of users',
      '📋 Data residency/sovereignty requirements',
      '🔄 DR/BC requirements (RTO/RPO)',
      '📊 Seasonal scaling patterns and volumes',
      '🎯 Cost reduction targets or budget limits',
      '⚠️ RED FLAG: No cost visibility or tracking',
      '⚠️ RED FLAG: No understanding of cost drivers',
      '⚠️ RED FLAG: Data residency requirements not identified'
    ],
    exampleGoodAnswer: 'Current spend: $45k/month AWS ($540k annually). Breakdown: EC2 $20k, RDS $12k, S3 $5k, data transfer $6k, other $2k. Trend: Growing 25% annually with business growth. Waste identified: $8k/month in unused EBS volumes and over-provisioned RDS instances (AWS Trusted Advisor report). Target: Reduce monthly spend by 20% ($9k/month, $108k annually) through rightsizing and reserved instances. Users: 60% North America, 25% Europe, 15% Asia-Pacific. Data residency: GDPR requires EU customer data stored in eu-west-1, currently all in us-east-1 (compliance risk). Operate: Single region (us-east-1) today, need to add eu-west-1 for compliance. DR: Currently none, need RTO <4 hours, RPO <15 minutes for financial data. Scaling: Black Friday traffic 10x normal, currently manual scaling (causes outages). Shown: AWS Cost Explorer reports, Trusted Advisor recommendations, traffic pattern graphs.',
    examplePoorAnswer: 'Cloud costs are high and we want to reduce them. We have users all over the world.',
    criticalForSOW: true
  },

  // Add more enhanced questions for other phases and tiers...
]

// Function to find enhanced metadata for a question
export function getEnhancedQuestionMetadata(
  questionText: string,
  phase: Phase,
  tier: Tier
): EnhancedQuestionMetadata | null {
  // Try exact keyword match first
  for (const metadata of enhancedQuestionMetadata) {
    // Check phase and tier match
    if (metadata.phase && metadata.phase !== phase) continue
    if (metadata.tier && metadata.tier !== tier) continue

    // Check if any keyword matches
    const matches = metadata.questionKeywords.some((keyword) =>
      questionText.toLowerCase().includes(keyword.toLowerCase())
    )

    if (matches) {
      return metadata
    }
  }

  return null
}
