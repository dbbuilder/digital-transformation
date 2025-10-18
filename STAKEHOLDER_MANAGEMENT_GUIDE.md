# Stakeholder Management Guide

## Overview

The Digital Transformation Planning System now includes comprehensive stakeholder and team management to track **who knows what**, **who's responsible**, **who approves**, and **who signs off** on each stage of documentation.

This guide explains the complete stakeholder management workflow from setup to SOW approval.

---

## Key Features

### 1. Team Hierarchy
- Define organizational teams (Frontend, Backend, Data, Leadership, etc.)
- Set team leads and parent/child team relationships
- Assign knowledge areas to teams (UI, API, DATA, CLOUD, AI)
- Define team responsibilities and approval authority

### 2. Stakeholder Profiles
- **Basic Information**: Name, title, role, department, contact info
- **Hierarchy**: Team membership, reporting relationships
- **Knowledge Areas**: Expertise in specific tiers (UI/API/DATA/CLOUD/AI)
- **Specializations**: Specific technologies (React, PostgreSQL, AWS, etc.)
- **Responsibilities**: What they're accountable for
- **Approval Authority**: What they can approve
- **RACI Model**: Involvement level (Responsible, Accountable, Consulted, Informed, Approver)
- **Availability**: Hours per week available for project

### 3. Intelligent Stakeholder Suggestions
- Automatically suggest stakeholders for questions based on:
  - Tier expertise match (UI expert for UI questions)
  - Specialization keywords (PostgreSQL expert for database questions)
  - Responsibilities alignment
  - Phase-specific roles (Product Owner in Discovery, Architects in Foundation)
- Confidence scoring (High/Medium/Low)
- Top pick identification

### 4. Response Tracking
- Track who answered each question
- Link responses to stakeholder profiles
- View stakeholder involvement across assessments
- Audit trail of who provided what information

### 5. Approval Workflows (Coming Soon)
- Define multi-step approval processes
- Track approval status for SOW sections
- Require specific approvers before finalization
- Approval comments and change requests

---

## Getting Started

### Step 1: Define Your Teams

**Navigation**: Projects → Select Project → Team & Stakeholder Management

1. Click "**+ Add Team**"
2. Fill in team details:
   - **Name**: e.g., "Frontend Development Team"
   - **Description**: Brief purpose
   - **Team Lead**: Select from stakeholders
   - **Knowledge Areas**: Select tiers (UI, API, DATA, etc.)
   - **Approval Authority**: What this team can approve

**Example Teams**:
- **Frontend Team**: Knowledge = UI, Can Approve = UI designs, UX workflows
- **Backend Team**: Knowledge = API, DATA, Can Approve = API specs, Database schemas
- **Architecture Team**: Knowledge = All tiers, Can Approve = Architecture decisions
- **Leadership**: Can Approve = Budget, SOW, Final plans

### Step 2: Add Stakeholders

1. Click "**+ Add Stakeholder**"
2. Fill in comprehensive profile:

**Basic Information**:
- Full Name
- Job Title (e.g., "Senior Software Engineer")
- Project Role (optional, e.g., "Lead Developer")
- Department
- Email & Phone

**Team & Reporting**:
- Assign to team
- Set manager (Reports To)
- Default involvement level (RESPONSIBLE/ACCOUNTABLE/CONSULTED/INFORMED/APPROVER)
- Availability hours per week

**Knowledge & Expertise**:
- Select knowledge areas (tiers): UI ☑️ API ☑️ DATA ☐ CLOUD ☐ AI ☐
- Add specializations: React, TypeScript, Node.js, PostgreSQL

**Responsibilities**:
- "Frontend architecture decisions"
- "UI/UX quality assurance"
- "Performance optimization"

**Approval Authority**:
- "UI designs"
- "Frontend code reviews"
- "UX workflows"

### Step 3: View Organization Chart

Click "**🏢 Org Chart**" tab to see reporting relationships and team structure.

---

## Using Stakeholder Assignment in Assessments

### During Interviews

When answering assessment questions, the system now shows:

**1. Suggested Stakeholders**
- Automatically suggests who should answer based on:
  - Question tier (UI/API/DATA/CLOUD/AI)
  - Question content keywords
  - Stakeholder expertise
- Shows confidence level (High/Medium/Low)
- Displays top pick with ⭐ badge

**2. Stakeholder Selection**
- Click suggested stakeholder to select
- Selected stakeholder is saved with the response
- Can expand to see all suggestions with reasons

**3. Suggestion Reasons**
System explains why each stakeholder is suggested:
- "UI expertise" (matches tier)
- "Specialization: React, TypeScript" (matches keywords)
- "RESPONSIBLE" (RACI role)
- "Responsible for: Frontend architecture decisions"

### Example Workflow

**Question**: "What are your top 3 critical user journeys for the UI?"

**System Suggests**:
1. ⭐ **Sarah Johnson** - Senior UX Designer
   - Confidence: **High**
   - Reason: UI expertise • Specialization: User Research, Figma • RESPONSIBLE
   - **[Selected]**

2. **Mike Chen** - Frontend Lead
   - Confidence: **Medium**
   - Reason: UI expertise • Responsible for: UI architecture

3. **Emma Davis** - Product Manager
   - Confidence: **Medium**
   - Reason: Product role in Discovery phase

**Interviewer Action**:
- Clicks Sarah Johnson to select her
- Sarah's profile appears with contact info
- Proceeds to interview Sarah
- Enters Sarah's response
- System saves response with `answeredBy: Sarah Johnson (ID: 5)`

---

## Stakeholder Roles Explained (RACI Model)

### RESPONSIBLE (R)
- **Who**: Person doing the actual work
- **Example**: Frontend developer implementing UI changes
- **In Assessments**: Should provide answers to technical questions in their domain

### ACCOUNTABLE (A)
- **Who**: Person ultimately answerable for the work (only ONE person)
- **Example**: Tech Lead or Team Lead
- **In Assessments**: Reviews and approves responses from their team

### CONSULTED (C)
- **Who**: People whose opinions are sought
- **Example**: Architects, Senior Engineers, Subject Matter Experts
- **In Assessments**: Provides input on complex questions, validates technical approaches

### INFORMED (I)
- **Who**: People who are kept informed of progress
- **Example**: Stakeholders, managers not directly involved
- **In Assessments**: Receives copies of assessment results

### APPROVER (Special)
- **Who**: Person with authority to approve decisions/documents
- **Example**: CTO, Director, VP
- **In Assessments**: Must approve SOW sections before finalization

---

## SOW Approval Workflow (Coming Soon)

### Workflow Steps

**Step 1: Complete Assessment**
- All questions answered
- Stakeholders assigned to responses
- Quality scores >70%

**Step 2: Generate SOW Preview**
- System generates 8 SOW sections
- Maps sections to approvers based on content:
  - **Executive Summary** → CTO, CEO, Product Owner
  - **Current State Assessment** → Tech Leads, Architects
  - **Business Drivers** → CFO, Product Owner, Business Analysts
  - **Proposed Solution** → CTO, Architects, Tech Leads
  - **Scope & Deliverables** → Project Manager, Tech Leads
  - **Success Criteria** → Product Owner, Stakeholders
  - **Timeline** → Project Manager, CTO
  - **Assumptions & Constraints** → Project Manager, Legal/Compliance

**Step 3: Section Approvals**
- Each section routed to required approvers
- Approvers review content
- Can approve, reject, or request changes
- Track approval status per section

**Step 4: Final SOW Approval**
- All sections approved
- Final approval by CTO/CEO
- SOW marked as "Ready for Client"
- Generate final PDF with approval signatures

### Approval States

- ⏳ **Pending**: Waiting for approver action
- ✅ **Approved**: Approver signed off
- ❌ **Rejected**: Approver rejected (must revise)
- 🔄 **Changes Requested**: Approver wants specific changes

---

## Best Practices

### Setting Up Teams

**Do**:
✅ Create teams aligned with actual org structure
✅ Assign clear knowledge areas to each team
✅ Set team leads who can approve team deliverables
✅ Use hierarchical teams (parent/child) for large orgs

**Don't**:
❌ Create overlapping teams with same knowledge areas
❌ Leave teams without leads
❌ Assign approval authority too broadly

### Defining Stakeholder Profiles

**Do**:
✅ Be specific with specializations (React 18, PostgreSQL 14, AWS Lambda)
✅ Match responsibilities to actual job duties
✅ Assign approval authority based on real decision-making power
✅ Update profiles as roles change

**Don't**:
❌ Use vague specializations ("coding", "databases")
❌ Assign approval authority to people who don't have it
❌ Forget to set knowledge areas (system can't suggest them)

### Using Stakeholder Suggestions

**Do**:
✅ Review all suggestions before selecting
✅ Choose stakeholders with high confidence when possible
✅ Consider multiple stakeholders for complex questions
✅ Document in notes if you interviewed multiple people

**Don't**:
❌ Ignore suggestions completely
❌ Always pick top suggestion without thinking
❌ Interview people outside their expertise area

### Managing Approvals

**Do**:
✅ Define approval requirements upfront
✅ Set realistic approval deadlines
✅ Route to appropriate level (don't escalate unnecessarily)
✅ Provide context with each approval request

**Don't**:
❌ Require too many approvers (slows process)
❌ Skip approval for critical sections
❌ Approve without actually reviewing

---

## Troubleshooting

### "No stakeholders with [TIER] expertise"

**Cause**: No stakeholders have this tier in their knowledge areas

**Solution**:
1. Add stakeholders with expertise in this tier
2. Edit existing stakeholders to add the tier
3. Temporarily assign closest match

### "Low confidence suggestions"

**Cause**: System can't find strong matches for this question

**Solution**:
1. Add more specializations to stakeholder profiles
2. Update responsibilities to match question topics
3. Review question content for keywords
4. Manually select best available stakeholder

### "Stakeholder not available"

**Cause**: Selected stakeholder has limited availability

**Solution**:
1. Check availability hours in stakeholder profile
2. Select alternate stakeholder
3. Update stakeholder availability if changed
4. Plan interview for time stakeholder is available

---

## Data Model Reference

### Team
```typescript
{
  id: number
  projectId: number
  name: string
  description?: string
  parentTeamId?: number
  leadStakeholderId?: number
  responsibilities?: string[]
  knowledgeAreas?: string[]  // e.g., ["UI", "API"]
  approvalAuthority?: string[]  // e.g., ["UI designs", "API specs"]
}
```

### Stakeholder
```typescript
{
  id: number
  projectId: number
  name: string
  title: string  // Job title
  role: string  // Project role
  teamId?: number
  department?: string
  email?: string
  phone?: string
  reportsToId?: number

  knowledgeAreas?: Tier[]  // ["UI", "API", "DATA", "CLOUD", "AI"]
  specializations?: string[]  // ["React", "PostgreSQL"]
  responsibilities?: string[]
  canApprove?: string[]
  involvementLevel?: 'RESPONSIBLE' | 'ACCOUNTABLE' | 'CONSULTED' | 'INFORMED' | 'APPROVER'
  availabilityHours?: number

  notes?: string
}
```

### AssessmentResponse (Extended)
```typescript
{
  // Existing fields...
  answeredBy?: number  // Stakeholder ID
  reviewedBy?: number[]  // Stakeholder IDs who reviewed
  approvedBy?: number  // Stakeholder ID who approved
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'changes_requested'
}
```

---

## Keyboard Shortcuts

- `Tab` to navigate between stakeholder suggestions
- `Enter` to select focused stakeholder
- `Esc` to collapse stakeholder suggestions

---

## Next Steps

1. **Set up your teams** - Define organizational structure
2. **Add stakeholders** - Create comprehensive profiles
3. **Start assessment** - System will suggest stakeholders automatically
4. **Track responses** - See who answered what
5. **Review approvals** - Ensure right people signed off (coming soon)

---

## Support

For help with stakeholder management:
- Review the **Org Chart** to validate team structure
- Check stakeholder **Knowledge Areas** if suggestions seem off
- Update **Specializations** to improve suggestion accuracy
- Use **Notes** field for context about stakeholder roles

**Remember**: The goal is to ensure every question is answered by someone with the right knowledge, reviewed by someone accountable, and approved by someone with authority. This creates SOWs you can trust.
