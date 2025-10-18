// Education Hub - Educational content and playbook viewer

import { useState } from 'react'

interface ContentCategory {
  id: string
  name: string
  description: string
  icon: JSX.Element
  items: ContentItem[]
}

interface ContentItem {
  id: string
  title: string
  description: string
  content: string
}

export function EducationHub() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)

  const categories: ContentCategory[] = [
    {
      id: 'methodology',
      name: 'Transformation Methodology',
      description: 'Four-corner framework and dual-path approach',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      items: [
        {
          id: 'four-corner',
          title: 'Four-Corner Framework Overview',
          description: 'The proven methodology for visualizing digital transformation',
          content: `# Four-Corner Framework

## Overview

The Four-Corner Framework is a proven methodology for digital transformation planning that helps organizations visualize their journey from current state to future state across both UI/UX and Data Platform layers.

## The Four Quadrants

### 1. Current State - UI/UX (Top Right)
Document existing user interfaces, workflows, and user experience:
- Current technology stack (frameworks, libraries)
- User pain points and friction areas
- Existing workflows and processes
- Legacy constraints and technical debt
- User research and feedback

### 2. Future State - UI/UX (Top Left)
Design the ideal user experience and interface:
- Target UX patterns and design system
- Modern frameworks and technologies
- Responsive and accessible design
- Performance targets
- User-centered workflows

### 3. Current State - Data Platform (Bottom Right)
Assess existing data infrastructure and architecture:
- Current databases and data stores
- Data pipelines and ETL processes
- Data quality and governance issues
- Integration points and APIs
- Technical debt and limitations

### 4. Future State - Data Platform (Bottom Left)
Design the target data architecture:
- Modern data platform (cloud-native)
- Real-time data pipelines
- Data governance framework
- API-first architecture
- Scalability and performance targets

## Five Architectural Tiers

Each quadrant should address all five tiers:

1. **UI Tier**: User interface and experience
2. **API/Mid-Tier**: Application logic and services
3. **Data Tier**: Databases and data platforms
4. **Cloud Tier**: Infrastructure and compute
5. **AI/External Tier**: AI services and integrations

## Transformation Flow

Transformation progresses **diagonally** across the framework:

- **Future UI ↔ Current Data**: Build new UIs on existing data
- **Current UI ↔ Future Data**: Migrate data while maintaining existing UIs
- **Cross-cutting**: Cloud and API layers enable both paths

## Using the Framework

1. **Discovery Phase**: Fill out all four quadrants with stakeholder input
2. **Gap Analysis**: Identify differences between current and future states
3. **Prioritization**: Determine which gaps to address first
4. **Roadmap**: Create phased approach to close gaps
5. **Execution**: Implement changes systematically

## Key Benefits

- **Visual Communication**: Stakeholders can see the transformation journey
- **Comprehensive**: Covers all architectural layers
- **Flexible**: Supports both AI-Included and AI-Free paths
- **Risk Management**: Identifies dependencies and constraints
- **Alignment**: Ensures technical and business goals align`,
        },
        {
          id: 'dual-path',
          title: 'Dual-Path Methodology: AI-Included vs AI-Free',
          description: 'Choosing the right transformation approach for your organization',
          content: `# Dual-Path Transformation Methodology

## Overview

Not all organizations are ready for AI. The Dual-Path methodology provides two distinct transformation approaches based on organizational readiness, compliance requirements, and risk tolerance.

## Path 1: AI-Included Transformation

### When to Choose AI-Included Path

Choose this path if your organization has:
- **Data Governance**: Established data quality and governance frameworks
- **Risk Tolerance**: Willingness to accept probabilistic outcomes
- **Compliance Readiness**: AI regulations are understood and addressable
- **Technical Capability**: Data science and ML Ops expertise available
- **Executive Sponsorship**: Leadership committed to AI investment

### AI-Included Features

- **Intelligent Automation**: ML-powered workflow optimization
- **Predictive Analytics**: Forecasting and anomaly detection
- **Natural Language Processing**: Chatbots, document analysis
- **Computer Vision**: Image recognition and analysis
- **Recommendation Engines**: Personalization and content discovery

### Additional Requirements

- AI governance framework and policies
- Evaluation harness for model testing
- Human-in-the-loop approval workflows
- Red-teaming and adversarial testing
- Continuous monitoring and retraining
- Explainability and transparency measures

## Path 2: AI-Free Transformation

### When to Choose AI-Free Path

Choose this path if your organization:
- **Compliance-Heavy**: Healthcare (HIPAA), Finance (SOX), Government
- **Risk-Averse**: Cannot accept probabilistic outcomes
- **Data Limitations**: Insufficient quality/quantity of training data
- **Resource Constraints**: Lack of AI/ML expertise
- **Regulatory Uncertainty**: AI regulations unclear in your jurisdiction

### AI-Free Features

- **Deterministic Automation**: Rule-based workflow automation
- **Business Intelligence**: Dashboards and reporting
- **Data Warehousing**: Traditional analytics and queries
- **Integration Platforms**: API-based integrations
- **Modern UI/UX**: Responsive, accessible interfaces

### Benefits of AI-Free

- Lower complexity and maintenance costs
- Predictable, explainable outcomes
- Easier compliance and audit trails
- Faster time to value
- Reduced technical risk

## Hybrid Approach

Many organizations start AI-Free and add AI capabilities later:

### Phase 1: Foundation (AI-Free)
- Establish cloud platform
- Modernize data infrastructure
- Build API layer
- Deploy new UI/UX

### Phase 2: AI Readiness
- Improve data quality and governance
- Establish ML Ops practices
- Pilot low-risk AI use cases
- Build evaluation frameworks

### Phase 3: AI Integration
- Deploy AI features incrementally
- Monitor performance and outcomes
- Expand based on results
- Maintain fallback to deterministic logic

## Decision Framework

Use this checklist to determine your path:

### AI-Included Prerequisites
- [ ] Executive commitment to AI investment
- [ ] Data governance framework in place
- [ ] Quality training data available (labeled, clean)
- [ ] ML Ops capability or partnerships
- [ ] Acceptable risk tolerance for probabilistic outcomes
- [ ] Compliance pathway for AI clear
- [ ] Resources for ongoing model maintenance

### AI-Free Indicators
- [ ] Healthcare, finance, or government sector
- [ ] Strict regulatory environment
- [ ] Limited data science expertise
- [ ] Budget constraints
- [ ] Need for 100% explainable decisions
- [ ] Risk-averse culture
- [ ] Insufficient quality training data

## Path Selection Timeline

- **Discovery (Weeks 1-4)**: Assess AI readiness
- **Foundation (Weeks 4-12)**: Build platform (same for both paths)
- **Decision Point (Week 8)**: Finalize path selection
- **Modernization (Weeks 13-24)**: Execute chosen path
- **Intelligence (Weeks 25-32)**: AI features (AI-Included only)

## Key Principle

**Either path delivers transformational value.** AI-Free is not a compromise—it's often the right choice for compliance-heavy industries.`,
        },
      ],
    },
    {
      id: 'governance',
      name: 'Governance & Compliance',
      description: 'AI governance, compliance frameworks, and legal considerations',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      items: [
        {
          id: 'ai-governance',
          title: 'AI Governance Framework',
          description: 'Policies and procedures for responsible AI deployment',
          content: `# AI Governance Framework

## Overview

AI governance is essential for responsible AI deployment. This framework provides policies, procedures, and controls for managing AI throughout its lifecycle.

## Core Principles

### 1. Transparency
- Model decisions must be explainable
- Document training data sources and biases
- Maintain audit trails for all AI decisions
- Provide user visibility into AI usage

### 2. Accountability
- Assign clear ownership for AI systems
- Define escalation paths for AI failures
- Human oversight for high-stakes decisions
- Regular review and approval processes

### 3. Fairness
- Test for bias across demographics
- Ensure equitable outcomes
- Monitor for discriminatory patterns
- Regular bias audits

### 4. Safety & Security
- Red-teaming and adversarial testing
- Rate limiting and abuse prevention
- Data privacy and encryption
- Incident response procedures

## Governance Structure

### AI Governance Board
- **Composition**: C-suite, legal, compliance, data science, IT
- **Cadence**: Monthly review meetings
- **Responsibilities**:
  - Approve new AI use cases
  - Review model performance metrics
  - Address ethical concerns
  - Set policy and standards

### AI Review Process

**Phase 1: Proposal**
- Business case and value proposition
- Risk assessment
- Compliance review
- Resource requirements

**Phase 2: Development**
- Data source documentation
- Model architecture review
- Bias testing results
- Security assessment

**Phase 3: Evaluation**
- Performance metrics vs. baseline
- Fairness and bias analysis
- User acceptance testing
- Compliance sign-off

**Phase 4: Deployment**
- Monitoring plan
- Rollback procedures
- Human-in-loop workflows
- Ongoing evaluation schedule

**Phase 5: Maintenance**
- Monthly performance reviews
- Quarterly retraining evaluation
- Annual comprehensive audit
- Continuous monitoring

## Model Registry

Maintain a central registry of all AI models:

- **Model ID**: Unique identifier
- **Owner**: Responsible team/individual
- **Use Case**: Business problem addressed
- **Training Data**: Sources, date, volume
- **Performance Metrics**: Accuracy, precision, recall
- **Deployment Date**: When model went live
- **Last Retrained**: Date of last retraining
- **Approval Status**: Current governance approval
- **Risk Level**: Low/Medium/High based on impact

## Evaluation Harness

Required testing before deployment:

### Functional Tests
- Accuracy on test set (minimum threshold)
- Precision and recall metrics
- F1 score or appropriate metric
- Comparison to baseline/benchmark

### Fairness Tests
- Demographic parity analysis
- Equal opportunity testing
- Disparate impact assessment
- Calibration across groups

### Security Tests
- Adversarial attack resilience
- Data poisoning resistance
- Model inversion testing
- Privacy leakage assessment

### Production Tests
- Latency and performance
- Scalability under load
- Graceful degradation
- Fallback behavior

## Human-in-the-Loop (HITL)

Define when human oversight is required:

### Mandatory HITL Scenarios
- High-stakes decisions (healthcare, finance, legal)
- Novel situations outside training data
- Low confidence predictions (below threshold)
- User-requested human review
- Regulatory requirements

### HITL Workflow
1. Model generates prediction with confidence score
2. If confidence < threshold, route to human
3. Human reviews model recommendation + supporting data
4. Human makes final decision
5. Log human decision for model feedback
6. Periodic review of HITL cases for patterns

## Compliance Framework

### Regulatory Considerations

**GDPR (EU)**
- Right to explanation for automated decisions
- Data minimization and purpose limitation
- Privacy by design
- Data subject rights (access, deletion)

**CCPA (California)**
- Disclosure of automated decision-making
- Opt-out rights for consumers
- Data sale restrictions

**HIPAA (Healthcare)**
- PHI protection in training data
- Business associate agreements for AI vendors
- Audit trails for all data access

**SOX (Finance)**
- Internal controls for AI systems
- Audit trail requirements
- Model validation and testing

### Compliance Checklist
- [ ] Legal review of AI use case
- [ ] Privacy impact assessment
- [ ] Data usage agreements
- [ ] User consent mechanisms
- [ ] Audit trail implementation
- [ ] Data retention policies
- [ ] Incident response plan
- [ ] Regular compliance audits

## Monitoring & Alerting

### Key Metrics to Monitor

**Model Performance**
- Accuracy drift over time
- Precision/recall trends
- Latency percentiles
- Error rates

**Fairness Metrics**
- Demographic parity
- Equal opportunity
- Calibration across groups

**Security Metrics**
- Failed authentication attempts
- Unusual API usage patterns
- Model query anomalies
- Data access violations

### Alert Thresholds

- **Critical**: Accuracy drop > 5% → Immediate review
- **Warning**: Accuracy drop > 2% → Weekly review
- **Info**: Latency > p95 target → Daily review

## Incident Response

### Severity Levels

**P0: Critical**
- Model producing harmful outcomes
- Data breach or privacy violation
- Major bias discovered in production
- **Response**: Immediate rollback, executive notification

**P1: High**
- Significant accuracy degradation
- Fairness metric violation
- Security vulnerability
- **Response**: Within 24 hours, implement fix or rollback

**P2: Medium**
- Minor performance issues
- Edge case failures
- User complaints
- **Response**: Within 1 week, schedule fix

### Incident Workflow
1. Detect issue (monitoring or user report)
2. Triage severity
3. Notify stakeholders
4. Implement immediate mitigation (rollback if needed)
5. Root cause analysis
6. Permanent fix
7. Post-mortem and lessons learned
8. Update policies/procedures

## Documentation Requirements

For each AI system, maintain:
- [ ] Business case and objectives
- [ ] Model architecture documentation
- [ ] Training data provenance
- [ ] Feature engineering details
- [ ] Hyperparameter tuning logs
- [ ] Evaluation results
- [ ] Bias testing reports
- [ ] Security assessment
- [ ] Deployment checklist
- [ ] Monitoring dashboards
- [ ] Incident logs
- [ ] Retraining schedule

## Key Takeaways

1. **AI governance is not optional** for responsible AI deployment
2. **Human oversight** is required for high-stakes decisions
3. **Continuous monitoring** is essential to detect drift and bias
4. **Documentation** enables accountability and compliance
5. **Cross-functional collaboration** ensures balanced decision-making`,
        },
      ],
    },
    {
      id: 'change',
      name: 'Change Management',
      description: 'Stakeholder communication and organizational change',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      items: [
        {
          id: 'stakeholder-communication',
          title: 'Stakeholder Communication Strategy',
          description: 'Effective communication throughout transformation',
          content: `# Stakeholder Communication Strategy

## Overview

Digital transformation affects every part of an organization. A comprehensive communication strategy ensures stakeholders are informed, engaged, and supportive throughout the journey.

## Stakeholder Groups

### 1. Executive Leadership
- **Concerns**: ROI, risk, strategic alignment
- **Communication**: Monthly executive briefings, quarterly business reviews
- **Content**: High-level metrics, business outcomes, risk mitigation
- **Format**: Executive decks, dashboards, face-to-face meetings

### 2. Middle Management
- **Concerns**: Team impact, resource allocation, timelines
- **Communication**: Bi-weekly updates, town halls
- **Content**: Project progress, dependencies, resource needs
- **Format**: Email updates, team meetings, Slack/Teams channels

### 3. End Users
- **Concerns**: Workflow changes, training, support
- **Communication**: Weekly updates, training sessions
- **Content**: Feature previews, training materials, FAQs
- **Format**: Email, demos, hands-on training

### 4. IT/Technical Teams
- **Concerns**: Technical architecture, integration, support
- **Communication**: Daily standups, weekly sprints
- **Content**: Technical specs, API docs, architecture diagrams
- **Format**: Jira/GitHub, technical wikis, code reviews

### 5. Compliance/Legal
- **Concerns**: Regulatory compliance, data privacy, contracts
- **Communication**: As-needed reviews, quarterly audits
- **Content**: Compliance checklists, risk assessments, audit reports
- **Format**: Formal documentation, review meetings

## Communication Cadence

### Daily
- Development team standups
- Critical issue escalations
- User support tickets

### Weekly
- Project status updates to management
- User training sessions
- End-user newsletters

### Monthly
- Executive steering committee meetings
- All-hands town halls
- Performance dashboards

### Quarterly
- Business review presentations
- Comprehensive audits
- Strategic planning sessions

## Communication Channels

### Formal Channels
- **Executive Reports**: PowerPoint decks with metrics and outcomes
- **Project Status**: Weekly status reports in standardized format
- **Documentation**: Confluence, SharePoint, or wiki
- **Compliance**: Audit trails and formal sign-offs

### Informal Channels
- **Slack/Teams**: Quick questions, daily updates
- **Email**: Regular updates and announcements
- **Demo Days**: Show progress to stakeholders
- **Office Hours**: Open Q&A sessions

## Change Communication Plan

### Phase 1: Awareness (Weeks 1-4)
**Goal**: Stakeholders understand the need for change

**Messages**:
- Why transformation is necessary
- Current state pain points
- Vision for the future
- High-level timeline

**Tactics**:
- Executive kickoff presentation
- Town hall meetings
- Email announcement
- FAQ document

### Phase 2: Understanding (Weeks 5-12)
**Goal**: Stakeholders understand what will change

**Messages**:
- Detailed transformation roadmap
- Specific changes to workflows
- Timeline and milestones
- Training plan

**Tactics**:
- Department-specific briefings
- Process walkthrough sessions
- Training material previews
- User champions program

### Phase 3: Adoption (Weeks 13-24)
**Goal**: Stakeholders actively engage with changes

**Messages**:
- Hands-on training
- Support resources available
- Early wins and successes
- Feedback mechanisms

**Tactics**:
- Interactive training sessions
- Pilot user programs
- Celebration of milestones
- User feedback surveys

### Phase 4: Institutionalization (Weeks 25-32+)
**Goal**: New ways of working become the norm

**Messages**:
- Outcomes achieved
- Continuous improvement
- Long-term vision
- Next phases

**Tactics**:
- Success story showcases
- Ongoing training and support
- Performance metrics sharing
- Future roadmap previews

## Messaging Framework

### Core Message
"We're modernizing our technology to better serve our customers, empower our teams, and position the organization for future growth."

### Supporting Messages

**For Executives**
"This transformation will reduce operating costs by 30%, improve customer satisfaction by 40%, and enable new revenue streams worth $X million."

**For Managers**
"Your team will have modern tools that automate repetitive tasks, giving them more time for strategic work."

**For End Users**
"The new system is faster, easier to use, and works on any device. You'll spend less time on manual tasks and more time on value-added work."

**For Technical Teams**
"We're moving to a modern, cloud-native architecture that reduces technical debt and enables faster feature delivery."

## Resistance Management

### Common Resistance Patterns

**"The old system works fine"**
- Response: Show specific pain points and inefficiencies
- Tactic: Quantify time wasted and errors caused

**"I don't have time to learn something new"**
- Response: Emphasize long-term time savings
- Tactic: Provide hands-on training and support

**"What if I can't figure it out?"**
- Response: Comprehensive training and ongoing support
- Tactic: User champions and help desk

**"My job will be automated away"**
- Response: Automation frees up time for higher-value work
- Tactic: Show career development opportunities

### Overcoming Resistance

1. **Listen**: Understand specific concerns
2. **Acknowledge**: Validate legitimate concerns
3. **Address**: Provide specific solutions
4. **Involve**: Include resisters in planning
5. **Support**: Extra training and resources
6. **Celebrate**: Recognize adoption and success

## Success Metrics

### Awareness Metrics
- % stakeholders who can articulate transformation goals
- Town hall attendance rates
- Email open rates

### Engagement Metrics
- Training session attendance
- Pilot program participation
- Feedback survey completion

### Adoption Metrics
- Active users of new system
- Feature adoption rates
- Support ticket volume trends

### Outcome Metrics
- Time savings achieved
- Error rate reduction
- User satisfaction scores

## Key Takeaways

1. **Communication is continuous**, not one-time
2. **Tailor messages** to each stakeholder group
3. **Use multiple channels** to reach everyone
4. **Address resistance** proactively
5. **Celebrate wins** to build momentum
6. **Measure success** to demonstrate value`,
        },
      ],
    },
  ]

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory)

  // If viewing a specific content item
  if (selectedItem) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => setSelectedItem(null)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {selectedCategoryData?.name}
        </button>

        {/* Content */}
        <div className="card">
          <h1 className="mb-2 text-3xl font-bold text-neutral-900">{selectedItem.title}</h1>
          <p className="mb-6 text-neutral-600">{selectedItem.description}</p>
          <div className="prose prose-neutral max-w-none">
            <div className="whitespace-pre-wrap text-neutral-700">{selectedItem.content}</div>
          </div>
        </div>
      </div>
    )
  }

  // If viewing a category
  if (selectedCategory && selectedCategoryData) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to all categories
        </button>

        {/* Category header */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
              {selectedCategoryData.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">{selectedCategoryData.name}</h2>
              <p className="text-neutral-600">{selectedCategoryData.description}</p>
            </div>
          </div>
        </div>

        {/* Content items */}
        <div className="space-y-4">
          {selectedCategoryData.items.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="card w-full text-left transition-all hover:shadow-md"
            >
              <h3 className="mb-2 text-lg font-semibold text-neutral-900">{item.title}</h3>
              <p className="text-sm text-neutral-600">{item.description}</p>
              <div className="mt-3 flex items-center gap-1 text-primary-600">
                <span className="text-sm font-medium">Read more</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Default: Show all categories
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Education Hub</h2>
        <p className="text-neutral-600">
          Learn about digital transformation methodologies, governance frameworks, and best practices
        </p>
      </div>

      {/* Categories */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className="card text-left transition-all hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
              {category.icon}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-900">{category.name}</h3>
            <p className="mb-3 text-sm text-neutral-600">{category.description}</p>
            <div className="flex items-center gap-1 text-sm text-primary-600">
              <span className="font-medium">{category.items.length} articles</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Links */}
      <div className="card">
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">Quick Start Guides</h3>
        <div className="space-y-2">
          <button
            onClick={() => {
              setSelectedCategory('methodology')
              const item = categories[0].items[0]
              setSelectedItem(item)
            }}
            className="flex w-full items-center justify-between rounded-lg border border-neutral-200 p-3 text-left hover:bg-neutral-50"
          >
            <span className="text-sm font-medium text-neutral-900">
              Getting Started with Four-Corner Framework
            </span>
            <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => {
              setSelectedCategory('methodology')
              const item = categories[0].items[1]
              setSelectedItem(item)
            }}
            className="flex w-full items-center justify-between rounded-lg border border-neutral-200 p-3 text-left hover:bg-neutral-50"
          >
            <span className="text-sm font-medium text-neutral-900">
              Choosing Between AI-Included and AI-Free Paths
            </span>
            <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
