// Reference Materials - Documents, guides, and resources for interview questions

import type { Phase, Tier } from '../types'

export interface ReferenceMaterial {
  id: string
  title: string
  description: string
  type: 'pdf' | 'link' | 'markdown' | 'checklist' | 'template' | 'diagram'
  url?: string // External URL or path to file
  content?: string // Inline markdown content
  tags: string[]

  // Association
  phases?: Phase[] // Which phases this applies to (empty = all)
  tiers?: Tier[] // Which tiers this applies to (empty = all)
  questionKeywords?: string[] // Keywords to match questions
}

export const referenceMaterials: ReferenceMaterial[] = [
  // UI Tier - Discovery Phase
  {
    id: 'ui-discovery-checklist',
    title: 'UI Discovery Interview Checklist',
    description: 'Complete checklist of information to gather during UI discovery interviews',
    type: 'checklist',
    content: `# UI Discovery Checklist

## User Journeys & Experience
- [ ] Identified top 3-5 critical user journeys
- [ ] Documented current pain points for each journey
- [ ] Collected user feedback, analytics, or session recordings
- [ ] Defined success metrics for each journey (baseline + targets)
- [ ] Identified user personas and roles
- [ ] Documented accessibility requirements (WCAG level, screen readers, etc.)

## Current Technology Stack
- [ ] Listed all UI frameworks and their versions
- [ ] Documented build tools and bundlers
- [ ] Identified UI component libraries in use
- [ ] Cataloged all JavaScript dependencies
- [ ] Noted browser and device compatibility requirements
- [ ] Documented any custom or legacy code

## Analytics & Monitoring
- [ ] Identified current analytics tools (GA, Mixpanel, etc.)
- [ ] Documented error tracking setup (Sentry, Rollbar, etc.)
- [ ] Checked for session replay tools
- [ ] Verified A/B testing capabilities
- [ ] Assessed performance monitoring (Core Web Vitals, etc.)

## Evidence Collected
- [ ] Screenshots of current UI and workflows
- [ ] Analytics reports showing usage patterns
- [ ] User feedback or support tickets
- [ ] Performance metrics and load times
- [ ] Competitive analysis or benchmarks

## Compliance & Security
- [ ] Identified data privacy requirements (GDPR, CCPA, etc.)
- [ ] Documented authentication/authorization flows
- [ ] Noted content security policies
- [ ] Verified SSL/TLS requirements
`,
    tags: ['checklist', 'ui', 'discovery', 'interview-guide'],
    phases: ['DISCOVERY'],
    tiers: ['UI'],
  },

  {
    id: 'ui-modernization-patterns',
    title: 'Modern UI Architecture Patterns',
    description: 'Reference guide for modern UI patterns and best practices',
    type: 'markdown',
    content: `# Modern UI Architecture Patterns

## Component-Based Architecture
Modern UI development is built around reusable components:
- **Atomic Design**: Atoms → Molecules → Organisms → Templates → Pages
- **Component Libraries**: MUI, Ant Design, Chakra UI, Tailwind UI
- **Design Systems**: Centralized tokens, themes, and guidelines

## State Management Patterns
Choose based on complexity:
- **Local State**: useState, useReducer (simple components)
- **Global State**: Zustand, Redux Toolkit, Jotai (complex apps)
- **Server State**: React Query, SWR, RTK Query (API data)
- **URL State**: React Router, Next.js routing (shareable state)

## Performance Optimization
- **Code Splitting**: Lazy loading routes and heavy components
- **Virtual Scrolling**: For long lists (react-window, react-virtuoso)
- **Image Optimization**: WebP, lazy loading, responsive images
- **Bundle Analysis**: webpack-bundle-analyzer, @next/bundle-analyzer

## Accessibility Standards
- **WCAG 2.1 Level AA**: Minimum for most organizations
- **ARIA Attributes**: When semantic HTML isn't enough
- **Keyboard Navigation**: All interactive elements must be keyboard accessible
- **Color Contrast**: 4.5:1 for normal text, 3:1 for large text

## Testing Strategy
- **Unit Tests**: Jest + React Testing Library (components)
- **Integration Tests**: Testing Library (user flows)
- **E2E Tests**: Playwright, Cypress (critical paths)
- **Visual Regression**: Percy, Chromatic (UI consistency)

## Common Migration Paths
- **jQuery → React**: Component-based refactor, incremental adoption
- **Angular 1 → Modern**: Complete rewrite or ngUpgrade bridge
- **Class Components → Hooks**: Incremental refactor
- **JavaScript → TypeScript**: Add types gradually
`,
    tags: ['architecture', 'ui', 'patterns', 'best-practices'],
    tiers: ['UI'],
  },

  {
    id: 'user-journey-mapping-template',
    title: 'User Journey Mapping Template',
    description: 'Template for documenting user journeys and pain points',
    type: 'template',
    content: `# User Journey Template

## Journey Name: [e.g., "Patient Appointment Booking"]

### User Persona
- **Role**: [e.g., "Returning patient"]
- **Technical Proficiency**: [High/Medium/Low]
- **Access Method**: [Desktop/Mobile/Tablet]
- **Frequency**: [Daily/Weekly/Occasionally]

### Current State (As-Is)
**Steps**:
1. [Step 1 with description]
2. [Step 2 with description]
3. ...

**Metrics**:
- Time to Complete: [X minutes]
- Number of Clicks: [X]
- Completion Rate: [X%]
- Drop-off Points: [Step X, Step Y]

**Pain Points**:
- [Pain point 1 with evidence]
- [Pain point 2 with evidence]

**User Quotes**:
> "[Direct quote from user feedback]"

### Future State (To-Be)
**Improved Steps**:
1. [Step 1 - simplified]
2. [Step 2 - streamlined]
3. ...

**Target Metrics**:
- Time to Complete: [Y minutes] (Z% reduction)
- Number of Clicks: [Y] (Z% reduction)
- Completion Rate: [Y%] (Z% improvement)

**Success Criteria**:
- [ ] [Measurable criterion 1]
- [ ] [Measurable criterion 2]

**Required Features**:
- [Feature 1 to enable this journey]
- [Feature 2 to enable this journey]

### Business Impact
- **Users Affected**: [X users/day, Y% of total]
- **Revenue Impact**: [$X/year or X% improvement]
- **Support Ticket Reduction**: [X tickets/month]
- **Competitive Advantage**: [Description]
`,
    tags: ['template', 'user-journey', 'ux', 'documentation'],
    questionKeywords: ['journey', 'user', 'workflow', 'experience'],
  },

  // API Tier Resources
  {
    id: 'api-design-best-practices',
    title: 'RESTful API Design Best Practices',
    description: 'Guidelines for designing robust, scalable APIs',
    type: 'markdown',
    content: `# API Design Best Practices

## RESTful Principles
- **Resource-Based URLs**: /users/123 not /getUser?id=123
- **HTTP Verbs**: GET (read), POST (create), PUT (update), DELETE (delete)
- **Status Codes**: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error
- **Versioning**: /v1/users or Accept: application/vnd.myapi.v1+json

## Authentication & Authorization
- **OAuth 2.0**: Industry standard for authorization
- **JWT Tokens**: Stateless authentication
- **API Keys**: For service-to-service communication
- **Rate Limiting**: Prevent abuse (e.g., 100 requests/minute)

## Error Handling
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "field": "email",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
\`\`\`

## Performance Patterns
- **Pagination**: Limit, offset, or cursor-based
- **Caching**: ETag headers, Cache-Control
- **Compression**: gzip response bodies
- **Async Processing**: For long-running operations (job queues)

## Documentation
- **OpenAPI/Swagger**: Auto-generated interactive docs
- **Examples**: Include request/response samples
- **Versioning**: Document breaking changes
- **SDKs**: Provide client libraries for major languages
`,
    tags: ['api', 'rest', 'best-practices', 'design'],
    tiers: ['API'],
  },

  {
    id: 'data-governance-framework',
    title: 'Data Governance Framework',
    description: 'Essential data governance policies and practices',
    type: 'markdown',
    content: `# Data Governance Framework

## Data Classification
Classify all data by sensitivity:
- **Public**: No risk if exposed (marketing content)
- **Internal**: Moderate risk (internal reports)
- **Confidential**: High risk (customer data, financials)
- **Restricted**: Severe risk (PHI, PII, payment info)

## Data Contracts
Define explicit contracts between data producers and consumers:
- **Schema**: Field names, types, constraints
- **SLAs**: Freshness, accuracy, completeness
- **Ownership**: Who is responsible for this data
- **Lineage**: Where does this data come from

## Compliance Requirements

### GDPR (EU)
- Right to access, rectification, erasure
- Data portability
- Consent management
- Breach notification (72 hours)

### HIPAA (Healthcare)
- PHI encryption at rest and in transit
- Access controls and audit logs
- Business Associate Agreements (BAAs)
- Minimum necessary access

### PCI-DSS (Payment Card)
- Never store CVV/CVC codes
- Encrypt cardholder data
- Secure network transmission
- Regular security testing

## Data Quality Metrics
- **Completeness**: % of required fields populated
- **Accuracy**: % of records matching source of truth
- **Consistency**: % of records without contradictions
- **Timeliness**: Data age vs. SLA
`,
    tags: ['data', 'governance', 'compliance', 'gdpr', 'hipaa'],
    tiers: ['DATA'],
  },

  {
    id: 'cloud-architecture-decision-tree',
    title: 'Cloud Architecture Decision Tree',
    description: 'Guide for choosing cloud services and architecture patterns',
    type: 'markdown',
    content: `# Cloud Architecture Decisions

## Compute Options

### When to use Serverless (Lambda/Functions)
- Event-driven workloads
- Unpredictable or spiky traffic
- Short-running tasks (<15 min)
- Want zero infrastructure management

### When to use Containers (ECS/AKS/GKE)
- Need full OS control
- Long-running processes
- Microservices architecture
- Want portability across clouds

### When to use VMs (EC2/Azure VMs)
- Legacy applications
- Windows-specific workloads
- Need GPU or specialized hardware
- Migrating from on-prem

## Database Options

### Relational (RDS, Azure SQL)
- Structured data with relationships
- ACID transactions required
- Complex queries and joins
- Strong consistency needs

### NoSQL (DynamoDB, CosmosDB)
- Unstructured or semi-structured data
- Extreme scale (millions of reads/sec)
- Flexible schema
- Eventual consistency acceptable

### Data Warehouse (Redshift, Synapse)
- Analytics and BI workloads
- Historical data analysis
- Complex aggregations
- OLAP (not OLTP)

## Networking Patterns

### Public Internet
- External-facing APIs
- Static websites
- CDN-distributed content

### Private Network (VPC)
- Internal services
- Database access
- Sensitive workloads

### Hybrid Cloud
- On-prem to cloud communication
- VPN or Direct Connect
- Active Directory integration
`,
    tags: ['cloud', 'architecture', 'aws', 'azure', 'decision-guide'],
    tiers: ['CLOUD'],
  },

  {
    id: 'ai-readiness-assessment',
    title: 'AI Readiness Assessment Guide',
    description: 'Evaluate organizational readiness for AI adoption',
    type: 'checklist',
    content: `# AI Readiness Assessment

## Data Readiness
- [ ] Data is labeled, structured, and accessible
- [ ] Historical data is available (minimum 6-12 months)
- [ ] Data quality is good (>90% accuracy)
- [ ] Data governance policies are in place
- [ ] Can handle data privacy requirements (anonymization, etc.)

## Technical Readiness
- [ ] Cloud infrastructure is available
- [ ] Can support ML workloads (GPUs, specialized instances)
- [ ] APIs exist to integrate AI services
- [ ] Monitoring and logging infrastructure is mature
- [ ] Can deploy and version models

## Organizational Readiness
- [ ] Executive sponsorship for AI initiatives
- [ ] Budget allocated for AI experimentation
- [ ] Team has AI/ML skills or can hire/train
- [ ] Clear use cases identified with business value
- [ ] Stakeholders understand AI limitations

## Governance Readiness
- [ ] Ethical AI guidelines established
- [ ] Bias testing and fairness policies defined
- [ ] Model explainability requirements understood
- [ ] Human-in-the-loop workflows designed
- [ ] Compliance with regulations (GDPR Article 22, etc.)

## Low-Risk Starting Points
1. **Internal Copilots**: Code completion, documentation generation
2. **RAG Systems**: Knowledge base Q&A with cited sources
3. **Content Classification**: Auto-tag documents, emails, tickets
4. **Anomaly Detection**: Identify unusual patterns in logs/metrics
5. **Recommendations**: Product suggestions, content personalization

## High-Risk Areas (Avoid Initially)
- Automated decision-making affecting rights or finances
- Healthcare diagnosis or treatment recommendations
- Legal advice or compliance decisions
- Hiring or promotion decisions
- Content moderation without human review
`,
    tags: ['ai', 'ml', 'readiness', 'checklist', 'governance'],
    tiers: ['AI'],
  },

  // General Resources
  {
    id: 'transformation-glossary',
    title: 'Digital Transformation Glossary',
    description: 'Key terms and definitions for digital transformation',
    type: 'markdown',
    content: `# Digital Transformation Glossary

## Architecture Terms

**API Gateway**: Central entry point for all API requests, handles auth, rate limiting, routing

**Event-Driven Architecture**: Systems that communicate via asynchronous events (publish/subscribe)

**Microservices**: Small, independent services that work together (vs. monolithic applications)

**Service Mesh**: Infrastructure layer for service-to-service communication (Istio, Linkerd)

## Cloud Terms

**IaC (Infrastructure as Code)**: Managing infrastructure via version-controlled configuration files

**FinOps**: Financial operations - optimizing cloud costs while maintaining performance

**Multi-tenancy**: Single application instance serving multiple customers (tenants)

**Serverless**: Cloud services that auto-scale and charge per-use (no server management)

## Data Terms

**CDC (Change Data Capture)**: Tracking changes in databases to sync data systems

**Data Lake**: Storage for raw, unstructured data in native format

**Data Warehouse**: Structured storage optimized for analytics (Redshift, Snowflake)

**ETL vs ELT**: Extract-Transform-Load vs Extract-Load-Transform

**Feature Store**: Centralized repository for ML features

## AI/ML Terms

**RAG (Retrieval-Augmented Generation)**: AI that searches knowledge base before answering

**Vector Database**: Stores embeddings for semantic search (Pinecone, Weaviate)

**MLOps**: Practices for deploying and maintaining ML models in production

**Prompt Engineering**: Crafting inputs to get better AI outputs

**Guardrails**: Constraints to prevent AI from generating harmful/incorrect outputs

## Agile & DevOps

**CI/CD**: Continuous Integration / Continuous Deployment (automated pipelines)

**SRE (Site Reliability Engineering)**: Applying software engineering to operations

**Observability**: Understanding system internals via logs, metrics, traces

**Chaos Engineering**: Intentionally breaking things to improve resilience
`,
    tags: ['glossary', 'definitions', 'terminology', 'reference'],
  },
]

// Function to get relevant materials for a question
export function getRelevantMaterials(
  questionText: string,
  phase: Phase,
  tier: Tier
): ReferenceMaterial[] {
  const relevant: ReferenceMaterial[] = []

  for (const material of referenceMaterials) {
    // Check phase match
    if (material.phases && material.phases.length > 0 && !material.phases.includes(phase)) {
      continue
    }

    // Check tier match
    if (material.tiers && material.tiers.length > 0 && !material.tiers.includes(tier)) {
      continue
    }

    // Check keyword match
    if (material.questionKeywords && material.questionKeywords.length > 0) {
      const hasKeyword = material.questionKeywords.some((keyword) =>
        questionText.toLowerCase().includes(keyword.toLowerCase())
      )
      if (!hasKeyword) continue
    }

    relevant.push(material)
  }

  return relevant
}
