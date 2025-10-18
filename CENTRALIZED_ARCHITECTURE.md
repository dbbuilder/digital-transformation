# Centralized Collaborative Architecture - Evolution Plan

**Purpose**: Evolve the offline-first planning tool into a centralized, multi-user collaborative platform with client-consultant interaction, document management, and shared repositories.

**Status**: Architecture Design Phase
**Target**: Production-ready collaborative SaaS platform
**Last Updated**: 2025-10-17

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Evolution](#architecture-evolution)
3. [Database Selection & Rationale](#database-selection--rationale)
4. [System Architecture](#system-architecture)
5. [Database Schema Design](#database-schema-design)
6. [CSV Import & Migration](#csv-import--migration)
7. [Next.js API Layer](#nextjs-api-layer)
8. [Collaboration Features](#collaboration-features)
9. [Authentication & Authorization](#authentication--authorization)
10. [File Storage & Document Management](#file-storage--document-management)
11. [Real-Time Collaboration](#real-time-collaboration)
12. [Migration Path](#migration-path)
13. [Deployment Architecture](#deployment-architecture)
14. [Cost Analysis](#cost-analysis)
15. [Implementation Roadmap](#implementation-roadmap)

---

## 1. Executive Summary

### Current State (Phase 1): Offline-First Tool
- **Architecture**: Browser-based, IndexedDB storage
- **Users**: Single consultant working offline
- **Data**: Siloed in individual browsers
- **Limitations**: No collaboration, no sharing, manual export

### Future State (Phase 2): Centralized Collaborative Platform
- **Architecture**: Next.js + Supabase (PostgreSQL) + Real-time
- **Users**: Multi-user (consultants + clients)
- **Data**: Centralized, synchronized, collaborative
- **Features**: Comments, document uploads, real-time updates, shared repositories

### Why This Evolution?

**Business Value**:
- **Collaboration**: Clients and consultants work together in real-time
- **Transparency**: Clients see progress as it happens
- **Efficiency**: No more emailing documents back and forth
- **Scalability**: Support multiple consultants × multiple clients
- **Revenue**: SaaS model with per-project or per-user pricing

**Technical Benefits**:
- **Data Integrity**: Single source of truth
- **Backup**: Automatic, always available
- **Access Anywhere**: Web + mobile
- **Version Control**: Track all changes
- **Security**: Enterprise-grade with row-level security

---

## 2. Architecture Evolution

### Phase 1 → Phase 2 Comparison

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: Offline-First (Current)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Browser A                 Browser B                        │
│  ┌─────────────┐          ┌─────────────┐                 │
│  │ React App   │          │ React App   │                 │
│  │ IndexedDB   │          │ IndexedDB   │                 │
│  │ (Isolated)  │          │ (Isolated)  │                 │
│  └─────────────┘          └─────────────┘                 │
│       ↓ Export                 ↓ Export                    │
│     Email/PDF              Email/PDF                       │
│                                                             │
│  ❌ No sync                                                │
│  ❌ No collaboration                                       │
│  ❌ Manual sharing                                         │
└─────────────────────────────────────────────────────────────┘

                         ↓ EVOLUTION ↓

┌─────────────────────────────────────────────────────────────┐
│  PHASE 2: Centralized Collaborative (Future)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Consultant Browser        Client Browser                   │
│  ┌─────────────┐          ┌─────────────┐                 │
│  │ Next.js App │          │ Next.js App │                 │
│  │ (React)     │          │ (React)     │                 │
│  └──────┬──────┘          └──────┬──────┘                 │
│         │                        │                         │
│         └────────┬───────────────┘                         │
│                  │ HTTPS + WebSocket                       │
│                  ▼                                         │
│         ┌─────────────────┐                                │
│         │   Next.js API   │                                │
│         │   (Middleware)  │                                │
│         └────────┬────────┘                                │
│                  │                                         │
│                  ▼                                         │
│         ┌─────────────────┐                                │
│         │    Supabase     │                                │
│         │   PostgreSQL    │                                │
│         │   + Real-time   │                                │
│         │   + Storage     │                                │
│         └─────────────────┘                                │
│                                                             │
│  ✅ Real-time sync                                         │
│  ✅ Multi-user collaboration                               │
│  ✅ Automatic backup                                       │
│  ✅ Document repository                                    │
│  ✅ Comments & discussions                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Database Selection & Rationale

### Evaluated Options

| Database | Type | Pros | Cons | Score |
|----------|------|------|------|-------|
| **Supabase (PostgreSQL)** | Relational + Document | ✅ JSONB for flexibility<br>✅ ACID compliance<br>✅ Real-time subscriptions<br>✅ Built-in auth<br>✅ File storage<br>✅ Row-level security<br>✅ Open source | ⚠️ Slightly more complex schema | ⭐⭐⭐⭐⭐ |
| MongoDB | NoSQL | ✅ Flexible schema<br>✅ Good for documents | ❌ No ACID across collections<br>❌ Need separate auth<br>❌ No built-in real-time | ⭐⭐⭐ |
| Firebase Firestore | NoSQL | ✅ Real-time<br>✅ Easy setup | ❌ Vendor lock-in (Google)<br>❌ Complex pricing<br>❌ Not open source | ⭐⭐ |
| Plain PostgreSQL | Relational | ✅ Mature<br>✅ ACID | ❌ Need to build auth<br>❌ No real-time<br>❌ More infra work | ⭐⭐⭐ |

### 🏆 Recommendation: Supabase (PostgreSQL)

**Why Supabase?**

1. **Open Source & Self-Hostable**
   - MIT licensed
   - Can self-host if needed (no vendor lock-in)
   - PostgreSQL under the hood (industry standard)

2. **Best of Both Worlds**
   - Relational structure (projects, users, assessments)
   - Document flexibility (JSONB for dynamic interview responses)
   - Full SQL power when needed

3. **Built-in Features Save Months of Development**
   ```
   Supabase Includes (Free):
   ├─ PostgreSQL database
   ├─ Authentication (email, OAuth, magic links)
   ├─ Row-level security (RLS)
   ├─ Real-time subscriptions
   ├─ File storage
   ├─ Auto-generated REST API
   ├─ Auto-generated TypeScript types
   └─ Database migrations

   Build Time Saved: 8-12 weeks
   Cost Saved: $50,000 - $80,000 in dev time
   ```

4. **Perfect for Next.js**
   - Official Next.js integration
   - Server Components support
   - API routes work seamlessly
   - TypeScript types auto-generated

5. **Real-Time Collaboration Built-In**
   - PostgreSQL LISTEN/NOTIFY
   - WebSocket connections
   - Subscribe to table changes
   - Perfect for comments, updates, document uploads

6. **Enterprise-Ready Security**
   - Row-Level Security (RLS): "Users can only see their own projects"
   - Policies: "Clients can comment but not edit assessments"
   - Audit logs: Track all changes
   - Encryption at rest and in transit

7. **Cost-Effective**
   - Free tier: 500 MB database, 1 GB file storage, 50k monthly active users
   - Pro tier: $25/month for production needs
   - Scales to millions of rows

---

## 4. System Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
├──────────────────────────────────────────────────────────────┤
│  Web Browser (Desktop)              Mobile Browser           │
│  ┌────────────────────┐             ┌────────────────────┐  │
│  │   Next.js App      │             │   Next.js App      │  │
│  │   (React 18)       │             │   (Responsive)     │  │
│  │                    │             │                    │  │
│  │ • Projects List    │             │ • Read-only view   │  │
│  │ • Assessment Forms │             │ • Comments         │  │
│  │ • Four-Corner      │             │ • Status tracking  │  │
│  │ • Roadmap Builder  │             │                    │  │
│  │ • Document Upload  │             │                    │  │
│  │ • Real-time Chat   │             │                    │  │
│  └─────────┬──────────┘             └─────────┬──────────┘  │
└────────────┼──────────────────────────────────┼─────────────┘
             │                                  │
             │         HTTPS + WebSocket        │
             │                                  │
┌────────────▼──────────────────────────────────▼─────────────┐
│                   APPLICATION LAYER                          │
├──────────────────────────────────────────────────────────────┤
│                   Next.js 14+ (App Router)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Frontend (Server Components + Client Components)      │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Routes (/app/api/*)                               │ │
│  │  ├─ /api/projects/*        (CRUD operations)           │ │
│  │  ├─ /api/assessments/*     (Interview responses)       │ │
│  │  ├─ /api/comments/*        (Collaboration)             │ │
│  │  ├─ /api/documents/*       (File upload/download)      │ │
│  │  ├─ /api/csv-import/*      (CSV template import)       │ │
│  │  ├─ /api/export/*          (PDF, Excel generation)     │ │
│  │  └─ /api/webhooks/*        (SendGrid, Stripe)          │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Middleware                                             │ │
│  │  ├─ Authentication (Supabase Auth)                     │ │
│  │  ├─ Authorization (RLS policies)                       │ │
│  │  ├─ Rate Limiting                                      │ │
│  │  └─ Request Logging                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────┬─────────────────────────────────────────────────┘
             │
             │ Supabase Client
             │
┌────────────▼─────────────────────────────────────────────────┐
│                    DATA LAYER                                │
├──────────────────────────────────────────────────────────────┤
│                    Supabase Backend                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                                    │ │
│  │  ├─ Organizations                                       │ │
│  │  ├─ Users (Consultants + Clients)                      │ │
│  │  ├─ Projects                                            │ │
│  │  ├─ Assessments                                         │ │
│  │  ├─ Assessment Responses (JSONB)                       │ │
│  │  ├─ Roadmaps                                            │ │
│  │  ├─ Comments (threaded)                                │ │
│  │  ├─ Documents (metadata)                               │ │
│  │  └─ Audit Logs                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Storage (Files)                                        │ │
│  │  ├─ project-documents/                                 │ │
│  │  ├─ assessment-evidence/                               │ │
│  │  ├─ exported-reports/                                  │ │
│  │  └─ user-avatars/                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Real-time Engine                                       │ │
│  │  └─ WebSocket connections for live updates             │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
             │
             │ Backups & Replication
             ▼
┌──────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE                            │
├──────────────────────────────────────────────────────────────┤
│  • Vercel (Next.js hosting)                                  │
│  • Supabase Cloud (Database + Storage)                       │
│  • CloudFlare CDN (Static assets)                            │
│  • SendGrid (Email notifications)                            │
│  • Sentry (Error tracking)                                   │
│  • Plausible/PostHog (Analytics)                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Database Schema Design

### Core Tables

```sql
-- =====================================================
-- ORGANIZATIONS & USERS
-- =====================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subscription_tier TEXT DEFAULT 'free', -- free, pro, enterprise
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL, -- consultant, client, admin
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PROJECTS
-- =====================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  transformation_path TEXT, -- AI_INCLUDED, AI_FREE, UNDECIDED
  current_phase TEXT, -- DISCOVERY, FOUNDATION, MODERNIZATION, INTELLIGENCE, OPTIMIZATION
  status TEXT DEFAULT 'active', -- active, paused, completed, archived
  start_date DATE,
  target_completion_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata (flexible JSONB)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', name || ' ' || COALESCE(description, ''))
  ) STORED
);

CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_search ON projects USING GIN(search_vector);

-- =====================================================
-- PROJECT MEMBERS (Many-to-Many)
-- =====================================================

CREATE TABLE project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- lead_consultant, consultant, client_stakeholder, viewer
  permissions JSONB DEFAULT '{"can_edit": false, "can_comment": true, "can_view": true}'::jsonb,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

-- =====================================================
-- ASSESSMENTS (Interview Templates)
-- =====================================================

CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  phase TEXT NOT NULL, -- DISCOVERY, FOUNDATION, MODERNIZATION, INTELLIGENCE
  tier TEXT NOT NULL, -- UI, API, DATA, CLOUD, AI
  template_name TEXT, -- Reference to CSV template
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_assessments_project ON assessments(project_id);

-- =====================================================
-- ASSESSMENT RESPONSES (Dynamic JSONB)
-- =====================================================

CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL, -- From CSV template
  question_text TEXT NOT NULL,
  answer JSONB, -- Flexible: text, number, array, object
  priority TEXT, -- HIGH, MEDIUM, LOW
  notes TEXT,
  evidence_urls TEXT[], -- Links to uploaded documents
  answered_by UUID REFERENCES users(id),
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Allow multiple versions (history)
  version INT DEFAULT 1,

  UNIQUE(assessment_id, question_id, version)
);

CREATE INDEX idx_responses_assessment ON assessment_responses(assessment_id);

-- =====================================================
-- ROADMAPS
-- =====================================================

CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  total_weeks INT DEFAULT 32,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'draft', -- draft, approved, in_progress, completed
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE roadmap_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
  phase_number INT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INT NOT NULL,
  start_week INT NOT NULL,
  deliverables JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, blocked
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(roadmap_id, phase_number)
);

-- =====================================================
-- FOUR-CORNER FRAMEWORK DATA
-- =====================================================

CREATE TABLE four_corner_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  quadrant TEXT NOT NULL, -- FUTURE_UI, CURRENT_UI, FUTURE_DATA, CURRENT_DATA
  tier TEXT NOT NULL, -- UI, API, DATA, CLOUD, AI
  content JSONB NOT NULL, -- Flexible structure
  version INT DEFAULT 1,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, quadrant, tier, version)
);

-- =====================================================
-- COMMENTS & COLLABORATION
-- =====================================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Polymorphic: can comment on anything
  entity_type TEXT NOT NULL, -- project, assessment, roadmap, phase, response
  entity_id UUID NOT NULL,

  parent_comment_id UUID REFERENCES comments(id), -- For threaded discussions

  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id),

  -- Mentions
  mentions UUID[] DEFAULT '{}', -- Array of user IDs

  -- Reactions
  reactions JSONB DEFAULT '{}'::jsonb, -- {"👍": [user_id1, user_id2], "❤️": [...]}

  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX idx_comments_project ON comments(project_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);

-- =====================================================
-- DOCUMENTS & FILE METADATA
-- =====================================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- File info
  name TEXT NOT NULL,
  description TEXT,
  file_type TEXT NOT NULL, -- pdf, docx, xlsx, png, etc.
  file_size BIGINT, -- bytes
  storage_path TEXT NOT NULL, -- Path in Supabase Storage

  -- Categorization
  category TEXT, -- assessment_evidence, roadmap, report, presentation, other
  tags TEXT[] DEFAULT '{}',

  -- Linking to entities
  linked_entity_type TEXT, -- assessment, roadmap_phase, response
  linked_entity_id UUID,

  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),

  -- Version control
  version INT DEFAULT 1,
  previous_version_id UUID REFERENCES documents(id),

  -- Access control
  visibility TEXT DEFAULT 'project_members', -- project_members, consultants_only, public

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_linked ON documents(linked_entity_type, linked_entity_id);

-- =====================================================
-- AUDIT LOG
-- =====================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL, -- created, updated, deleted, viewed
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  changes JSONB, -- Before/after values
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_project ON audit_logs(project_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- comment, mention, assignment, phase_complete, etc.
  title TEXT NOT NULL,
  message TEXT,
  link TEXT, -- Deep link to relevant entity
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

### PostgreSQL JSONB Examples

**Why JSONB for Interview Responses?**

Interview questions vary by phase/tier, so rigid columns don't work. JSONB gives us:
- Flexibility (store any response structure)
- Query power (can query inside JSON)
- Type safety (enforced JSON validity)

**Example 1: Text Answer**
```json
{
  "type": "text",
  "value": "Currently using ASP.NET WebForms with jQuery"
}
```

**Example 2: Multiple Choice**
```json
{
  "type": "multiple_choice",
  "selected": ["React", "Angular"],
  "other": "Considering Svelte"
}
```

**Example 3: Rating Scale**
```json
{
  "type": "rating",
  "score": 3,
  "max": 5,
  "label": "Technical Debt Level"
}
```

**Query JSONB**:
```sql
-- Find all responses mentioning "React"
SELECT * FROM assessment_responses
WHERE answer->>'value' ILIKE '%React%';

-- Find all high-priority responses
SELECT * FROM assessment_responses
WHERE priority = 'HIGH'
AND answer->'score' > 3;
```

---

## 6. CSV Import & Migration

### CSV Template Integration Strategy

**Challenge**: We have 4 CSV files with 100+ interview questions. How do we get them into the database?

**Solution**: Multi-stage import process

### Stage 1: CSV → Database Template Library

```typescript
// Import CSV templates into database
// Run once during setup

import { createClient } from '@supabase/supabase-js'
import Papa from 'papaparse'
import fs from 'fs'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function importCSVTemplates() {
  const csvFiles = [
    'Interview_Templates_Discovery_AI.csv',
    'Interview_Templates_Foundation_AI.csv',
    'Interview_Templates_Modernization_AI.csv',
    'Interview_Templates_Intelligence_AI.csv'
  ]

  for (const file of csvFiles) {
    const csvData = fs.readFileSync(`./data/${file}`, 'utf8')

    Papa.parse(csvData, {
      header: true,
      complete: async (results) => {
        // Create template questions library
        const questions = results.data.map((row, index) => ({
          id: `${row.Phase}_${row.Tier}_${index}`,
          phase: row.Phase,
          track: row.Track,
          tier: row.Tier,
          question: row.Question,
          notes: row.Notes,
          priority: row.Priority,
          ai_readiness: row['AI Readiness'],
          source_file: file
        }))

        // Insert into question_library table
        const { error } = await supabase
          .from('question_library')
          .upsert(questions)

        if (error) console.error(`Error importing ${file}:`, error)
        else console.log(`✓ Imported ${questions.length} questions from ${file}`)
      }
    })
  }
}
```

### Stage 2: Create Assessment from Template

```typescript
// When consultant creates new assessment, populate from template

async function createAssessmentFromTemplate(
  projectId: string,
  phase: string,
  tier: string
) {
  // 1. Fetch template questions for this phase/tier
  const { data: templateQuestions } = await supabase
    .from('question_library')
    .select('*')
    .eq('phase', phase)
    .eq('tier', tier)

  // 2. Create assessment
  const { data: assessment } = await supabase
    .from('assessments')
    .insert({
      project_id: projectId,
      phase,
      tier,
      status: 'not_started'
    })
    .select()
    .single()

  // 3. Create empty responses for all questions
  const responses = templateQuestions.map(q => ({
    assessment_id: assessment.id,
    question_id: q.id,
    question_text: q.question,
    answer: null, // Will be filled in by user
    priority: q.priority
  }))

  await supabase
    .from('assessment_responses')
    .insert(responses)

  return assessment
}
```

### Stage 3: Export Assessment to CSV

```typescript
// Export completed assessment back to CSV for offline use

async function exportAssessmentToCSV(assessmentId: string) {
  const { data: responses } = await supabase
    .from('assessment_responses')
    .select(`
      question_text,
      answer,
      priority,
      notes,
      answered_at
    `)
    .eq('assessment_id', assessmentId)

  const csv = Papa.unparse(responses)
  return csv // Download or email
}
```

---

## 7. Next.js API Layer

### Next.js 14+ App Router Structure

```
app/
├── (auth)/
│   ├── login/
│   ├── signup/
│   └── reset-password/
├── (dashboard)/
│   ├── projects/
│   │   ├── page.tsx                    # List all projects
│   │   ├── [projectId]/
│   │   │   ├── page.tsx                # Project overview
│   │   │   ├── assessments/
│   │   │   │   ├── page.tsx            # List assessments
│   │   │   │   └── [assessmentId]/
│   │   │   │       └── page.tsx        # Assessment detail
│   │   │   ├── roadmap/
│   │   │   │   └── page.tsx            # Roadmap builder
│   │   │   ├── four-corner/
│   │   │   │   └── page.tsx            # Four-corner viz
│   │   │   ├── documents/
│   │   │   │   └── page.tsx            # Document repository
│   │   │   └── settings/
│   │   │       └── page.tsx            # Project settings
│   │   └── new/
│   │       └── page.tsx                # Create project
│   ├── settings/
│   └── layout.tsx                      # Dashboard layout
├── api/
│   ├── projects/
│   │   ├── route.ts                    # GET /api/projects
│   │   ├── [projectId]/
│   │   │   ├── route.ts                # GET/PUT/DELETE /api/projects/:id
│   │   │   └── members/
│   │   │       └── route.ts            # Manage project members
│   ├── assessments/
│   │   ├── route.ts                    # GET/POST assessments
│   │   ├── [assessmentId]/
│   │   │   ├── route.ts                # GET/PUT/DELETE assessment
│   │   │   └── responses/
│   │   │       └── route.ts            # Save responses
│   ├── comments/
│   │   └── route.ts                    # CRUD comments
│   ├── documents/
│   │   ├── upload/
│   │   │   └── route.ts                # POST file upload
│   │   └── [documentId]/
│   │       └── route.ts                # GET/DELETE document
│   ├── csv-import/
│   │   └── route.ts                    # Import CSV templates
│   ├── export/
│   │   ├── pdf/
│   │   │   └── route.ts                # Generate PDF
│   │   └── excel/
│   │       └── route.ts                # Generate Excel
│   └── webhooks/
│       ├── sendgrid/
│       │   └── route.ts                # Email webhooks
│       └── stripe/
│           └── route.ts                # Payment webhooks
├── layout.tsx                          # Root layout
└── page.tsx                            # Home page
```

### Example API Route: Projects

**File: `app/api/projects/route.ts`**

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET /api/projects - List all projects user has access to
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch projects (RLS automatically filters to user's accessible projects)
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      organization:organizations(name),
      created_by:users(full_name, email),
      members:project_members(
        user:users(full_name, email, role),
        role
      )
    `)
    .order('updated_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ projects })
}

// POST /api/projects - Create new project
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, transformation_path } = body

  // Validation
  if (!name || name.trim().length < 3) {
    return NextResponse.json(
      { error: 'Project name must be at least 3 characters' },
      { status: 400 }
    )
  }

  // Get user's organization
  const { data: userData } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  // Create project
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      organization_id: userData.organization_id,
      name: name.trim(),
      description,
      transformation_path,
      created_by: user.id,
      current_phase: 'DISCOVERY',
      status: 'active'
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Add creator as project lead
  await supabase
    .from('project_members')
    .insert({
      project_id: project.id,
      user_id: user.id,
      role: 'lead_consultant',
      permissions: {
        can_edit: true,
        can_comment: true,
        can_view: true,
        can_delete: true
      }
    })

  // Log audit
  await supabase
    .from('audit_logs')
    .insert({
      project_id: project.id,
      user_id: user.id,
      action: 'created',
      entity_type: 'project',
      entity_id: project.id
    })

  return NextResponse.json({ project }, { status: 201 })
}
```

### Example API Route: Assessment Responses

**File: `app/api/assessments/[assessmentId]/responses/route.ts`**

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// PUT /api/assessments/:id/responses - Save assessment responses
export async function PUT(
  request: Request,
  { params }: { params: { assessmentId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { responses } = await request.json() // Array of { question_id, answer, notes }

  // Update or insert responses
  const updates = responses.map((r: any) => ({
    assessment_id: params.assessmentId,
    question_id: r.question_id,
    question_text: r.question_text,
    answer: r.answer,
    notes: r.notes,
    answered_by: user.id,
    answered_at: new Date().toISOString()
  }))

  const { data, error } = await supabase
    .from('assessment_responses')
    .upsert(updates, {
      onConflict: 'assessment_id,question_id,version'
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Calculate completion percentage
  const { count: totalQuestions } = await supabase
    .from('assessment_responses')
    .select('*', { count: 'exact', head: true })
    .eq('assessment_id', params.assessmentId)

  const { count: answeredQuestions } = await supabase
    .from('assessment_responses')
    .select('*', { count: 'exact', head: true })
    .eq('assessment_id', params.assessmentId)
    .not('answer', 'is', null)

  const completionPercentage = (answeredQuestions / totalQuestions) * 100

  // Update assessment
  await supabase
    .from('assessments')
    .update({
      completion_percentage: completionPercentage,
      status: completionPercentage === 100 ? 'completed' : 'in_progress',
      updated_at: new Date().toISOString()
    })
    .eq('id', params.assessmentId)

  return NextResponse.json({ success: true, completionPercentage })
}
```

---

## 8. Collaboration Features

### 8.1 Real-Time Comments

**Frontend Component**:

```typescript
// components/CommentThread.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Comment {
  id: string
  content: string
  author: { full_name: string; avatar_url: string }
  created_at: string
  reactions: Record<string, string[]>
}

export function CommentThread({
  entityType,
  entityId
}: {
  entityType: string
  entityId: string
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Load existing comments
    loadComments()

    // Subscribe to real-time updates
    const channel: RealtimeChannel = supabase
      .channel(`comments:${entityType}:${entityId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `entity_type=eq.${entityType},entity_id=eq.${entityId}`
        },
        (payload) => {
          setComments(prev => [...prev, payload.new as Comment])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [entityType, entityId])

  async function loadComments() {
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        author:users(full_name, avatar_url)
      `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: true })

    if (data) setComments(data)
  }

  async function postComment() {
    if (!newComment.trim()) return

    const { error } = await supabase
      .from('comments')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        content: newComment.trim()
      })

    if (!error) {
      setNewComment('')
    }
  }

  return (
    <div className="space-y-4">
      {/* Comment list */}
      <div className="space-y-3">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3">
            <img
              src={comment.author.avatar_url}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <div className="text-sm font-medium">
                {comment.author.full_name}
              </div>
              <div className="text-sm text-neutral-700">
                {comment.content}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {new Date(comment.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New comment */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && postComment()}
          placeholder="Add a comment..."
          className="input flex-1"
        />
        <button onClick={postComment} className="btn-primary">
          Post
        </button>
      </div>
    </div>
  )
}
```

### 8.2 Document Upload with Progress

```typescript
// components/DocumentUpload.tsx
'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function DocumentUpload({ projectId }: { projectId: string }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const supabase = createClientComponentClient()

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${projectId}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('project-documents')
        .upload(fileName, file, {
          onUploadProgress: (progress) => {
            setProgress((progress.loaded / progress.total) * 100)
          }
        })

      if (uploadError) throw uploadError

      // 2. Create document metadata record
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          project_id: projectId,
          name: file.name,
          file_type: fileExt,
          file_size: file.size,
          storage_path: uploadData.path,
          category: 'general'
        })

      if (dbError) throw dbError

      alert('Document uploaded successfully!')

    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div>
      <input
        type="file"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="btn-secondary cursor-pointer">
        {uploading ? `Uploading... ${Math.round(progress)}%` : 'Upload Document'}
      </label>
    </div>
  )
}
```

---

## 9. Authentication & Authorization

### Row-Level Security (RLS) Policies

**Key Principle**: Database enforces access control, not application code.

```sql
-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see projects they're members of
CREATE POLICY "Users can view their projects"
  ON projects FOR SELECT
  USING (
    id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Only consultants can create projects
CREATE POLICY "Consultants can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users
      WHERE role IN ('consultant', 'admin')
    )
  );

-- Policy: Only project leads can delete projects
CREATE POLICY "Project leads can delete"
  ON projects FOR DELETE
  USING (
    id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid()
      AND role = 'lead_consultant'
    )
  );

-- Policy: Users can comment on projects they're members of
CREATE POLICY "Members can comment"
  ON comments FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can only see documents for their projects
CREATE POLICY "View project documents"
  ON documents FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Clients can upload evidence, consultants can upload anything
CREATE POLICY "Upload documents"
  ON documents FOR INSERT
  WITH CHECK (
    -- Clients can only upload to assessments they're part of
    (
      auth.uid() IN (
        SELECT pm.user_id FROM project_members pm
        INNER JOIN users u ON pm.user_id = u.id
        WHERE pm.project_id = documents.project_id
        AND u.role = 'client'
        AND documents.category = 'assessment_evidence'
      )
    )
    OR
    -- Consultants can upload anything
    (
      auth.uid() IN (
        SELECT pm.user_id FROM project_members pm
        INNER JOIN users u ON pm.user_id = u.id
        WHERE pm.project_id = documents.project_id
        AND u.role IN ('consultant', 'admin')
      )
    )
  );
```

### User Roles & Permissions

```typescript
// lib/permissions.ts

export const ROLES = {
  ADMIN: 'admin',
  CONSULTANT: 'consultant',
  LEAD_CONSULTANT: 'lead_consultant',
  CLIENT: 'client',
  VIEWER: 'viewer'
} as const

export const PERMISSIONS = {
  // Projects
  CREATE_PROJECT: ['admin', 'consultant'],
  EDIT_PROJECT: ['admin', 'lead_consultant', 'consultant'],
  DELETE_PROJECT: ['admin', 'lead_consultant'],
  VIEW_PROJECT: ['admin', 'lead_consultant', 'consultant', 'client', 'viewer'],

  // Assessments
  CREATE_ASSESSMENT: ['admin', 'lead_consultant', 'consultant'],
  EDIT_ASSESSMENT: ['admin', 'lead_consultant', 'consultant'],
  VIEW_ASSESSMENT: ['admin', 'lead_consultant', 'consultant', 'client'],
  ANSWER_ASSESSMENT: ['admin', 'consultant', 'client'], // Clients can provide input

  // Comments
  POST_COMMENT: ['admin', 'lead_consultant', 'consultant', 'client'],
  EDIT_OWN_COMMENT: ['admin', 'lead_consultant', 'consultant', 'client'],
  DELETE_ANY_COMMENT: ['admin', 'lead_consultant'],

  // Documents
  UPLOAD_DOCUMENT: ['admin', 'lead_consultant', 'consultant', 'client'],
  DELETE_DOCUMENT: ['admin', 'lead_consultant', 'consultant'],
  VIEW_DOCUMENT: ['admin', 'lead_consultant', 'consultant', 'client', 'viewer'],
} as const

export function hasPermission(
  userRole: string,
  permission: keyof typeof PERMISSIONS
): boolean {
  return PERMISSIONS[permission].includes(userRole)
}
```

---

## 10. File Storage & Document Management

### Supabase Storage Buckets

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('project-documents', 'project-documents', false),
  ('assessment-evidence', 'assessment-evidence', false),
  ('exported-reports', 'exported-reports', false),
  ('user-avatars', 'user-avatars', true);

-- Storage policies (similar to RLS)
CREATE POLICY "Users can upload to their projects"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-documents'
    AND auth.uid() IN (
      SELECT user_id FROM project_members
      WHERE project_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Users can view their project documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-documents'
    AND auth.uid() IN (
      SELECT user_id FROM project_members
      WHERE project_id::text = (storage.foldername(name))[1]
    )
  );
```

### Document Versioning

```typescript
// Upload new version of document

async function uploadNewVersion(
  documentId: string,
  file: File,
  supabase: SupabaseClient
) {
  // 1. Get current document
  const { data: currentDoc } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()

  // 2. Upload new file
  const newFileName = `${currentDoc.project_id}/${Date.now()}_${file.name}`
  const { data: uploadData } = await supabase
    .storage
    .from('project-documents')
    .upload(newFileName, file)

  // 3. Create new document version
  const { data: newDoc } = await supabase
    .from('documents')
    .insert({
      project_id: currentDoc.project_id,
      name: file.name,
      file_type: file.name.split('.').pop(),
      file_size: file.size,
      storage_path: uploadData.path,
      category: currentDoc.category,
      linked_entity_type: currentDoc.linked_entity_type,
      linked_entity_id: currentDoc.linked_entity_id,
      version: currentDoc.version + 1,
      previous_version_id: currentDoc.id
    })
    .select()
    .single()

  return newDoc
}
```

---

## 11. Real-Time Collaboration

### Supabase Real-time Subscriptions

```typescript
// Subscribe to project updates

const channel = supabase
  .channel('project-updates')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'projects',
      filter: `id=eq.${projectId}`
    },
    (payload) => {
      console.log('Project updated:', payload.new)
      // Update UI
    }
  )
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'comments',
      filter: `project_id=eq.${projectId}`
    },
    (payload) => {
      // New comment, show notification
      toast.info('New comment added')
    }
  )
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'documents',
      filter: `project_id=eq.${projectId}`
    },
    (payload) => {
      // New document uploaded
      toast.info('New document uploaded')
    }
  )
  .subscribe()

// Clean up on unmount
return () => {
  supabase.removeChannel(channel)
}
```

### Presence: See who's online

```typescript
// Track online users

const presenceChannel = supabase
  .channel('online-users')
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState()
    const users = Object.values(state).flat()
    console.log('Online users:', users)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      // Track this user
      await presenceChannel.track({
        user_id: user.id,
        full_name: user.full_name,
        online_at: new Date().toISOString()
      })
    }
  })
```

---

## 12. Migration Path

### Phase 1 → Phase 2 Migration Strategy

**Step 1: Export from IndexedDB**

```typescript
// Export all local data to JSON

async function exportLocalData() {
  const db = new TransformationDB() // Dexie.js database

  const data = {
    projects: await db.projects.toArray(),
    assessments: await db.assessments.toArray(),
    responses: await db.assessmentResponses.toArray(),
    roadmaps: await db.roadmaps.toArray(),
    fourCorner: await db.fourCornerData.toArray(),
    documents: await db.documents.toArray()
  }

  // Download as JSON
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'transformation-data-export.json'
  a.click()

  return data
}
```

**Step 2: Import to Supabase**

```typescript
// Import exported data to centralized database

async function importToSupabase(exportedData: any) {
  const supabase = createClient(...)

  // 1. Create organization
  const { data: org } = await supabase
    .from('organizations')
    .insert({ name: 'Imported Data' })
    .select()
    .single()

  // 2. Import projects
  const projectIdMap = new Map() // old ID → new ID

  for (const project of exportedData.projects) {
    const { data: newProject } = await supabase
      .from('projects')
      .insert({
        organization_id: org.id,
        name: project.name,
        transformation_path: project.transformationPath,
        // ... map other fields
      })
      .select()
      .single()

    projectIdMap.set(project.id, newProject.id)
  }

  // 3. Import assessments (with remapped project IDs)
  for (const assessment of exportedData.assessments) {
    await supabase
      .from('assessments')
      .insert({
        project_id: projectIdMap.get(assessment.projectId),
        phase: assessment.phase,
        tier: assessment.tier,
        // ...
      })
  }

  // 4. Import responses, roadmaps, etc.
  // ...

  console.log('Import complete!')
}
```

**Step 3: Hybrid Mode (Optional)**

```typescript
// Allow offline work with periodic sync

class HybridStore {
  constructor() {
    this.localDB = new Dexie('TransformationDB')
    this.supabase = createClient(...)
    this.syncQueue = []
  }

  async saveProject(project: Project) {
    // 1. Save locally (instant)
    await this.localDB.projects.put(project)

    // 2. Queue for sync
    this.syncQueue.push({
      action: 'upsert',
      table: 'projects',
      data: project
    })

    // 3. Attempt sync (if online)
    this.syncNow()
  }

  async syncNow() {
    if (!navigator.onLine) return

    while (this.syncQueue.length > 0) {
      const item = this.syncQueue.shift()

      try {
        await this.supabase
          .from(item.table)
          .upsert(item.data)

        console.log('Synced:', item)
      } catch (error) {
        // Re-queue on error
        this.syncQueue.unshift(item)
        break
      }
    }
  }
}
```

---

## 13. Deployment Architecture

### Recommended Stack

```
┌──────────────────────────────────────────────────────┐
│                   PRODUCTION STACK                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Frontend & API:   Vercel                            │
│  ├─ Next.js app deployed                            │
│  ├─ Edge functions globally distributed             │
│  ├─ Automatic HTTPS                                 │
│  └─ Preview deployments for branches                │
│                                                      │
│  Database & Auth:  Supabase Cloud                    │
│  ├─ PostgreSQL (managed)                            │
│  ├─ Real-time engine                                │
│  ├─ File storage                                    │
│  └─ Authentication service                          │
│                                                      │
│  CDN:              CloudFlare                        │
│  ├─ Static assets                                   │
│  ├─ DDoS protection                                 │
│  └─ WAF (Web Application Firewall)                  │
│                                                      │
│  Email:            SendGrid                          │
│  └─ Transactional emails                            │
│                                                      │
│  Monitoring:       Sentry + PostHog                  │
│  ├─ Error tracking                                  │
│  ├─ Performance monitoring                          │
│  └─ Analytics (privacy-friendly)                    │
│                                                      │
│  Payments:         Stripe                            │
│  └─ Subscription billing (if SaaS)                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Environment Variables

```bash
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Server-only, never expose

SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

STRIPE_SECRET_KEY=sk_test_xxx (test) / sk_live_xxx (prod)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx / pk_live_xxx

SENTRY_DSN=https://xxx@sentry.io/xxx

# Production: Set in Vercel dashboard
```

---

## 14. Cost Analysis

### Monthly Operating Costs (Production)

| Service | Plan | Users | Cost/Month |
|---------|------|-------|------------|
| **Vercel** | Pro | Unlimited | $20 |
| **Supabase** | Pro | 50k MAU | $25 |
| **SendGrid** | Essentials | 40k emails | $15 |
| **CloudFlare** | Pro | Unlimited | $20 |
| **Sentry** | Team | 1k errors | $26 |
| **Domain** | .com | - | $1 |
| **Total** | | | **$107/month** |

**Scaling Costs**:
- 100k users: ~$200/month
- 500k users: ~$500/month
- 1M users: ~$1,500/month

**Revenue Model** (SaaS):
- **Free tier**: 1 project, 2 users
- **Pro tier**: $29/user/month (unlimited projects)
- **Enterprise**: $99/user/month (custom features, white-label)

**Break-even**: 4 paying users ($116/month revenue > $107/month cost)

---

## 15. Implementation Roadmap

### Phase 2A: Foundation (Weeks 1-4)

**Week 1: Setup**
- [ ] Set up Supabase project
- [ ] Design database schema
- [ ] Create RLS policies
- [ ] Set up Next.js project
- [ ] Configure authentication

**Week 2: Core Features**
- [ ] Implement project CRUD
- [ ] User management
- [ ] Organization setup
- [ ] Basic UI (projects list, detail)

**Week 3: Assessment System**
- [ ] Import CSV templates to database
- [ ] Create assessment from template
- [ ] Assessment response UI
- [ ] Progress tracking

**Week 4: Testing & Refinement**
- [ ] End-to-end testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] Deploy to staging

### Phase 2B: Collaboration (Weeks 5-8)

**Week 5: Comments & Real-time**
- [ ] Comment system
- [ ] Real-time subscriptions
- [ ] Notifications

**Week 6: Documents**
- [ ] File upload
- [ ] Document repository
- [ ] Version control
- [ ] Preview generation

**Week 7: Advanced Features**
- [ ] Four-corner visualization
- [ ] Roadmap builder
- [ ] Export (PDF, Excel)

**Week 8: Polish & Launch**
- [ ] UI refinements
- [ ] Onboarding flow
- [ ] Documentation
- [ ] Production deploy

### Phase 2C: Scale & Monetize (Weeks 9-12)

**Week 9: Billing**
- [ ] Stripe integration
- [ ] Subscription tiers
- [ ] Usage limits

**Week 10: Analytics**
- [ ] User analytics
- [ ] Performance monitoring
- [ ] Business intelligence

**Week 11: Marketing**
- [ ] Landing page
- [ ] SEO optimization
- [ ] Content marketing

**Week 12: Support & Growth**
- [ ] Customer support system
- [ ] Feedback loop
- [ ] Iterate based on usage

---

## 16. Next Steps

**Immediate Actions**:

1. **Review this architecture** with stakeholders
2. **Validate database schema** against use cases
3. **Set up Supabase project** (free tier to start)
4. **Create Next.js monorepo** structure
5. **Migrate 1 sample project** from offline to centralized
6. **Build MVP collaboration features** (comments + documents)
7. **Beta test** with 3-5 consultants
8. **Iterate** based on feedback
9. **Launch** publicly

**Decision Points**:

- ✅ **Database**: Supabase (PostgreSQL) - APPROVED
- ✅ **API Layer**: Next.js 14+ - APPROVED
- ⏳ **Pricing Model**: TBD (Free tier + Pro at $29/user?)
- ⏳ **White-label**: Offer to consulting firms? (Enterprise plan)
- ⏳ **Mobile Apps**: Native or PWA? (Phase 3)

---

## Summary

**From Offline Tool → Collaborative Platform**

We've designed a comprehensive architecture to evolve your digital transformation planning system into a centralized, multi-user collaborative SaaS platform:

✅ **Database**: Supabase (PostgreSQL + Real-time + Storage)
✅ **API**: Next.js 14+ App Router
✅ **Features**: Projects, Assessments, Comments, Documents, Real-time
✅ **Security**: Row-Level Security, Authentication, Authorization
✅ **Scalability**: Handles 1M+ users
✅ **Cost**: $107/month for production (break-even at 4 users)
✅ **Timeline**: 12 weeks to production-ready

**The system will enable**:
- Consultants and clients working together in real-time
- Shared document repositories
- Comments and discussions
- CSV template import
- Automatic sync and backup
- Professional, scalable SaaS business

**Ready to build the future of digital transformation consulting!** 🚀
