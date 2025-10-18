# Sync Architecture Plan - Local-First to Collaborative

## Current State
- **Offline-first**: All data in browser IndexedDB via Dexie.js
- **Single-user**: No sync, no collaboration
- **Privacy-preserving**: No external servers

## Target State
- **Local-first + Sync**: Keep offline capability, add server sync
- **Multi-user collaborative**: Multiple interviewers on same project
- **Conflict resolution**: Track edits, manage conflicts
- **Real-time awareness**: See who else is working

---

## Architecture Recommendation

### **Primary Recommendation: Supabase + PowerSync**

**Why this stack:**
1. **Supabase** (PostgreSQL + Real-time)
   - Open source (can self-host or use cloud)
   - Built-in authentication
   - Row-level security (RLS)
   - Real-time subscriptions via WebSockets
   - RESTful API + GraphQL
   - Cloud: $25/month, Self-hosted: Free

2. **PowerSync** or **Electric SQL** (Sync Layer)
   - Local-first sync engine
   - Bidirectional sync with PostgreSQL
   - Works with existing IndexedDB/Dexie
   - Offline-first with conflict resolution
   - Open source option available

**Alternative: PocketBase** (Simpler option)
- Single Go binary (100MB)
- Built-in real-time subscriptions
- SQLite backend
- Extremely easy to deploy
- Good for small teams (< 10 users)

---

## Sync Architecture Design

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Client 1                         │
│  ┌────────────────┐         ┌──────────────────┐            │
│  │  React UI      │ ◄────── │  Zustand Store   │            │
│  └────────────────┘         └──────────────────┘            │
│           │                          │                       │
│           ▼                          ▼                       │
│  ┌────────────────────────────────────────────┐             │
│  │         Service Layer                       │             │
│  └────────────────────────────────────────────┘             │
│           │                          │                       │
│           ▼                          ▼                       │
│  ┌─────────────────┐      ┌──────────────────┐             │
│  │  Dexie (Local)  │ ◄──► │  Sync Service    │             │
│  │  IndexedDB      │      │  (PowerSync)     │             │
│  └─────────────────┘      └──────────────────┘             │
│                                     │                        │
└─────────────────────────────────────┼────────────────────────┘
                                      │
                                      │ WebSocket + HTTP
                                      │
                    ┌─────────────────▼──────────────────┐
                    │      Supabase Server               │
                    │  ┌──────────────────────────────┐  │
                    │  │  PostgreSQL Database         │  │
                    │  │  - Projects                  │  │
                    │  │  - Assessments               │  │
                    │  │  - Responses (with versions) │  │
                    │  │  - Change log                │  │
                    │  └──────────────────────────────┘  │
                    │  ┌──────────────────────────────┐  │
                    │  │  Real-time Engine            │  │
                    │  │  (WebSocket broadcasts)      │  │
                    │  └──────────────────────────────┘  │
                    │  ┌──────────────────────────────┐  │
                    │  │  Auth & Row-Level Security   │  │
                    │  └──────────────────────────────┘  │
                    └────────────────┬───────────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                             │
        ▼                            ▼                             ▼
┌───────────────┐          ┌───────────────┐            ┌───────────────┐
│ Browser       │          │ Browser       │            │ Browser       │
│ Client 2      │          │ Client 3      │            │ Client N      │
└───────────────┘          └───────────────┘            └───────────────┘
```

---

## Data Sync Strategy

### 1. Change Tracking (Local)

Every table gets these additional fields:
```typescript
interface SyncableRecord {
  id: number

  // Existing fields...

  // Sync metadata
  _version: number              // Incremented on each change
  _lastModifiedAt: Date         // Local timestamp
  _lastModifiedBy: string       // User ID
  _syncStatus: 'synced' | 'pending' | 'conflict'
  _serverVersion?: number       // Version on server
  _conflictData?: any           // Conflict resolution data
}
```

### 2. Sync Service (Client-Side)

```typescript
// src/services/SyncService.ts

class SyncService {
  private supabase: SupabaseClient
  private syncQueue: SyncOperation[] = []
  private isOnline: boolean = navigator.onLine
  private syncInterval: number = 5000 // 5 seconds

  async initialize() {
    // Start sync loop
    setInterval(() => this.sync(), this.syncInterval)

    // Listen for online/offline
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())

    // Subscribe to real-time changes
    this.subscribeToChanges()
  }

  async sync() {
    if (!this.isOnline) return

    // 1. Push local changes to server
    await this.pushLocalChanges()

    // 2. Pull server changes to local
    await this.pullServerChanges()

    // 3. Resolve conflicts
    await this.resolveConflicts()
  }

  async pushLocalChanges() {
    // Get all records with _syncStatus = 'pending'
    const pendingChanges = await this.getPendingChanges()

    for (const change of pendingChanges) {
      try {
        const result = await this.supabase
          .from(change.table)
          .upsert(change.data, {
            onConflict: 'id',
            returning: 'representation'
          })

        if (result.error) {
          // Mark as conflict
          await this.markAsConflict(change)
        } else {
          // Mark as synced
          await this.markAsSynced(change, result.data[0]._version)
        }
      } catch (error) {
        console.error('Sync error:', error)
      }
    }
  }

  async pullServerChanges() {
    // Get latest _serverVersion for each table
    const lastSyncVersions = await this.getLastSyncVersions()

    for (const [table, version] of Object.entries(lastSyncVersions)) {
      // Fetch changes since last sync
      const { data } = await this.supabase
        .from(table)
        .select('*')
        .gt('_version', version)
        .order('_version', { ascending: true })

      // Apply changes to local DB
      for (const record of data || []) {
        await this.applyServerChange(table, record)
      }
    }
  }

  async subscribeToChanges() {
    // Real-time subscription for live updates
    this.supabase
      .channel('db-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => this.handleRealtimeChange(payload)
      )
      .subscribe()
  }
}
```

### 3. Conflict Resolution Strategies

**Automatic Resolution:**
```typescript
type ConflictStrategy =
  | 'last-write-wins'      // Use latest timestamp
  | 'server-wins'          // Always prefer server
  | 'client-wins'          // Always prefer client
  | 'merge-fields'         // Merge non-conflicting fields
  | 'manual'               // Require user decision

const conflictStrategies: Record<string, ConflictStrategy> = {
  // Simple fields: last write wins
  'projects.name': 'last-write-wins',
  'projects.description': 'last-write-wins',

  // Assessment responses: manual review
  'assessmentResponses.answer': 'manual',

  // Metadata: server wins
  'assessments.completionPercentage': 'server-wins',
}
```

**Manual Resolution UI:**
```typescript
// Component for resolving conflicts
function ConflictResolver({ conflict }: { conflict: Conflict }) {
  return (
    <div className="conflict-resolver">
      <h3>Conflict in {conflict.table}</h3>

      <div className="versions">
        <div className="local-version">
          <h4>Your Version</h4>
          <pre>{JSON.stringify(conflict.local, null, 2)}</pre>
          <button onClick={() => resolveConflict(conflict, 'local')}>
            Use My Version
          </button>
        </div>

        <div className="server-version">
          <h4>Server Version (by {conflict.server._lastModifiedBy})</h4>
          <pre>{JSON.stringify(conflict.server, null, 2)}</pre>
          <button onClick={() => resolveConflict(conflict, 'server')}>
            Use Server Version
          </button>
        </div>
      </div>

      <button onClick={() => resolveConflict(conflict, 'merge')}>
        Merge Both
      </button>
    </div>
  )
}
```

---

## Hosting Options

### Option 1: Supabase Cloud (Recommended for Quick Start)

**Pros:**
- Managed infrastructure
- Automatic backups
- SSL certificates
- Global CDN
- Monitoring included

**Cons:**
- Monthly cost ($25+ depending on usage)
- Data hosted externally

**Pricing:**
- Free tier: 500MB database, 2GB bandwidth
- Pro: $25/month - 8GB database, 100GB bandwidth
- Team: $599/month - 100GB database, 1TB bandwidth

**Setup:**
```bash
# 1. Create account at supabase.com
# 2. Create new project
# 3. Get connection details

# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Option 2: Self-Hosted Supabase (Best for Privacy)

**Pros:**
- Full control
- Data stays on your servers
- No per-user costs
- Can run on-premise

**Cons:**
- Need to manage infrastructure
- DevOps knowledge required
- Responsible for backups

**Infrastructure:**
```yaml
# docker-compose.yml
version: '3.8'

services:
  supabase-db:
    image: supabase/postgres:15.1.0.117
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - ./volumes/db/data:/var/lib/postgresql/data
    ports:
      - 5432:5432

  supabase-kong:
    image: kong:3.1
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /var/lib/kong/kong.yml
    ports:
      - 8000:8000

  supabase-auth:
    image: supabase/gotrue:v2.99.0
    environment:
      GOTRUE_DB_DRIVER: postgres
      DATABASE_URL: ${DATABASE_URL}

  supabase-realtime:
    image: supabase/realtime:v2.10.1
    environment:
      DB_HOST: supabase-db
      DB_PORT: 5432

  supabase-studio:
    image: supabase/studio:20231123-64a766a
    ports:
      - 3000:3000
```

**Hosting Cost Estimates:**
- **DigitalOcean Droplet** (4GB RAM): $24/month
- **Linode VPS** (4GB RAM): $24/month
- **AWS EC2 t3.medium**: ~$30/month
- **On-premise server**: Hardware cost only

### Option 3: PocketBase (Simplest Self-Hosted)

**Pros:**
- Single binary (< 100MB)
- Zero dependencies
- Built-in admin UI
- SQLite backend
- Very easy deployment

**Cons:**
- Less mature than Supabase
- Smaller ecosystem
- SQLite limitations at scale

**Deployment:**
```bash
# Download binary
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip
unzip pocketbase_0.22.0_linux_amd64.zip

# Run
./pocketbase serve --http=0.0.0.0:8080

# Or with Docker
docker run -d \
  -p 8080:8080 \
  -v /path/to/data:/pb_data \
  ghcr.io/pocketbase/pocketbase:latest
```

**Cost:** Same as self-hosted Supabase, but can run on smaller VPS ($12/month)

---

## Implementation Phases

### Phase 1: Add Sync Infrastructure (Week 1-2)

**Tasks:**
1. Set up Supabase project (cloud or self-hosted)
2. Create PostgreSQL schema matching Dexie schema
3. Add sync metadata fields to all tables
4. Implement basic SyncService
5. Add sync status indicators in UI

**Deliverables:**
- Supabase backend running
- Database schema migrated
- Basic push/pull sync working

### Phase 2: Conflict Resolution (Week 3-4)

**Tasks:**
1. Implement conflict detection
2. Build automatic resolution for simple fields
3. Create ConflictResolver UI component
4. Add conflict notification system
5. Test multi-user scenarios

**Deliverables:**
- Conflict detection working
- Manual conflict resolution UI
- Automatic strategies for common cases

### Phase 3: Real-time Collaboration (Week 5-6)

**Tasks:**
1. Implement real-time subscriptions
2. Add presence awareness (who's online)
3. Show live cursors/activity indicators
4. Implement optimistic updates
5. Add collaboration notifications

**Deliverables:**
- See other users in real-time
- Live activity indicators
- Optimistic UI updates

### Phase 4: Performance & Scale (Week 7-8)

**Tasks:**
1. Implement pagination for large datasets
2. Add incremental sync (delta sync)
3. Optimize IndexedDB queries
4. Add background sync worker
5. Implement retry logic

**Deliverables:**
- Fast sync even with large data
- Background sync doesn't block UI
- Reliable sync with poor connections

---

## Security & Authentication

### Row-Level Security (RLS) Policies

```sql
-- Only see projects you're a member of
CREATE POLICY "Users can view their projects"
ON projects FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM project_members
    WHERE project_id = id
  )
);

-- Only edit projects you have write access to
CREATE POLICY "Users can edit their projects"
ON projects FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM project_members
    WHERE project_id = id
    AND role IN ('owner', 'editor')
  )
);

-- Responses can be edited by any project member
CREATE POLICY "Project members can edit responses"
ON assessment_responses FOR ALL
USING (
  project_id IN (
    SELECT project_id FROM project_members
    WHERE user_id = auth.uid()
  )
);
```

### Authentication Flow

```typescript
// 1. Email/Password signup
const { user, error } = await supabase.auth.signUp({
  email: 'interviewer@company.com',
  password: 'secure-password'
})

// 2. Email/Password login
const { user, error } = await supabase.auth.signInWithPassword({
  email: 'interviewer@company.com',
  password: 'secure-password'
})

// 3. Get current user
const { data: { user } } = await supabase.auth.getUser()

// 4. Sign out
await supabase.auth.signOut()
```

---

## Migration Strategy

### Database Schema Changes

**Add sync columns to existing Dexie schema:**

```typescript
// src/lib/database.ts (updated)

this.version(3).stores({
  projects: '++id, name, organizationName, _version, _lastModifiedAt, _syncStatus',
  assessments: '++id, projectId, phase, tier, _version, _lastModifiedAt, _syncStatus',
  assessmentResponses: '++id, assessmentId, projectId, questionId, answeredBy, _version, _lastModifiedAt, _syncStatus',
  // ... other tables

  // New tables
  syncQueue: '++id, table, operation, timestamp',
  conflicts: '++id, table, recordId, resolvedAt',
  syncMetadata: 'table, lastSyncVersion, lastSyncAt',
}).upgrade(async tx => {
  // Add sync columns to existing records
  const tables = ['projects', 'assessments', 'assessmentResponses',
                 'stakeholders', 'teams', 'sowSectionApprovals']

  for (const tableName of tables) {
    await tx.table(tableName).toCollection().modify(record => {
      if (!record._version) record._version = 1
      if (!record._lastModifiedAt) record._lastModifiedAt = new Date()
      if (!record._syncStatus) record._syncStatus = 'pending'
    })
  }
})
```

### PostgreSQL Schema

```sql
-- migrations/001_initial_schema.sql

-- Projects table
CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  organization_name TEXT,
  description TEXT,
  transformation_path TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Sync metadata
  _version BIGINT DEFAULT 1,
  _last_modified_at TIMESTAMPTZ DEFAULT NOW(),
  _last_modified_by UUID REFERENCES auth.users(id)
);

-- Assessment responses with version history
CREATE TABLE assessment_responses (
  id BIGSERIAL PRIMARY KEY,
  assessment_id BIGINT REFERENCES assessments(id),
  project_id BIGINT REFERENCES projects(id),
  question_id TEXT,
  question_text TEXT,
  answer TEXT,
  notes TEXT,
  priority TEXT,
  answered_by BIGINT REFERENCES stakeholders(id),
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Sync metadata
  _version BIGINT DEFAULT 1,
  _last_modified_at TIMESTAMPTZ DEFAULT NOW(),
  _last_modified_by UUID REFERENCES auth.users(id)
);

-- Trigger to auto-increment version on update
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW._version := OLD._version + 1;
  NEW._last_modified_at := NOW();
  NEW._last_modified_by := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_version_trigger
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION increment_version();

-- Similar triggers for all syncable tables...
```

---

## Cost Analysis

### Total Cost of Ownership (Monthly)

**Option 1: Supabase Cloud**
- Supabase Pro: $25/month
- Total: **$25/month**

**Option 2: Self-Hosted Supabase**
- DigitalOcean Droplet (4GB): $24/month
- Backups (20GB): $4/month
- Domain + SSL: $1/month
- Total: **$29/month**

**Option 3: Self-Hosted PocketBase**
- Linode VPS (2GB): $12/month
- Backups (10GB): $2/month
- Domain + SSL: $1/month
- Total: **$15/month**

**Option 4: On-Premise**
- Hardware: One-time cost (~$500 for NUC/mini PC)
- Power: ~$10/month
- Total: **$10/month** (after hardware amortization)

---

## Recommendation Summary

### For Quick Start (1-2 weeks)
**Use Supabase Cloud** ($25/month)
- Fastest to production
- Managed infrastructure
- Focus on features, not DevOps

### For Privacy/Control (2-4 weeks)
**Use Self-Hosted Supabase** ($29/month)
- Data stays on your infrastructure
- Full control
- Moderate DevOps effort

### For Simplicity (1 week)
**Use PocketBase** ($15/month)
- Easiest deployment
- Single binary
- Good for small teams

### For Maximum Privacy (4+ weeks)
**On-Premise Server**
- Complete data sovereignty
- One-time hardware investment
- Requires in-house IT

---

## Next Steps

1. **Choose hosting option** based on requirements
2. **Set up Supabase/PocketBase** backend
3. **Implement SyncService** in client
4. **Add sync UI indicators** (syncing, conflicts, etc.)
5. **Test multi-user scenarios**
6. **Deploy to production**

---

## Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **PowerSync Docs**: https://www.powersync.com/
- **Electric SQL**: https://electric-sql.com/
- **PocketBase Docs**: https://pocketbase.io/docs/
- **Dexie Sync**: https://dexie.org/docs/Syncable/

---

**Created**: 2025-10-18
**Status**: Planning Document
**Decision Deadline**: Week 1 (Choose hosting option)
