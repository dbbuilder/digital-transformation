# Database Schema Structure

The Digital Transformation Planner uses a dedicated `digiform` schema for application data, separate from the `public` schema.

**Last Updated**: 2025-10-18

---

## 📊 Schema Organization

### `digiform` Schema (Application Data)

All application tables, functions, and objects live in the `digiform` schema for namespace isolation and security.

**Tables** (9 total):
- `projects` - Multi-tenant root table for transformation projects
- `project_members` - Access control (who can access which projects)
- `teams` - Organizational teams within projects
- `stakeholders` - People involved in transformation projects
- `assessments` - Interview assessments by phase and tier
- `assessment_responses` - Answers to interview questions
- `sow_section_approvals` - Statement of Work section approvals
- `sow_approval_workflows` - Multi-step approval workflows
- `sync_metadata` - Sync status tracking for offline support

**Functions**:
- `increment_version()` - Auto-increment version for conflict detection
- `add_project_member(project_id, user_email, role)` - Helper to add project members

**Sequences**:
- Auto-generated sequences for BIGSERIAL primary keys

### `public` Schema (Auth Integration)

Only auth-related tables remain in `public` for Supabase integration.

**Tables** (1 total):
- `profiles` - Extends `auth.users` with custom user data

**Functions**:
- `handle_new_user()` - Trigger function to create profile on signup

---

## 🔐 Row-Level Security (RLS)

All tables have RLS enabled with policies based on project membership.

### Access Pattern

```sql
-- Users can only access data from projects they're members of
WHERE project_id IN (
  SELECT project_id FROM digiform.project_members
  WHERE user_id = auth.uid()
)
```

### Roles

- **owner** - Full control (CRUD + delete + manage members)
- **editor** - Can edit (CRUD, no delete, no member management)
- **viewer** - Read-only access

---

## 📈 Database Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        auth.users (Supabase)                    │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ 1:1
                  ▼
          ┌───────────────┐
          │ public.profiles │
          └───────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     DIGIFORM SCHEMA                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────┐                                            │
│  │   projects     │ ◄─────┐                                    │
│  └────────┬───────┘       │                                    │
│           │ 1             │                                    │
│           │               │                                    │
│           │ N             │ N                                  │
│  ┌────────▼────────┐      │                                    │
│  │project_members  │──────┘                                    │
│  │ (access control)│                                           │
│  └─────────────────┘                                           │
│                                                                 │
│  ┌─────────────────┐      ┌──────────────────┐                │
│  │     teams       │      │  stakeholders    │                │
│  └────────┬────────┘      └────────┬─────────┘                │
│           │ 1                       │ N                        │
│           │                    ┌────▼────┐                     │
│           └───────────────────►│ team_id │                     │
│                                └─────────┘                     │
│                                                                 │
│  ┌─────────────────┐                                           │
│  │  assessments    │                                           │
│  └────────┬────────┘                                           │
│           │ 1                                                  │
│           │                                                    │
│           │ N                                                  │
│  ┌────────▼──────────────┐                                    │
│  │ assessment_responses  │                                    │
│  └───────────────────────┘                                    │
│                                                                 │
│  ┌──────────────────────┐      ┌──────────────────────┐       │
│  │sow_section_approvals │      │ sow_approval_workflows│       │
│  └──────────────────────┘      └──────────────────────┘       │
│                                                                 │
│  ┌──────────────────┐                                         │
│  │  sync_metadata   │ (for offline sync)                      │
│  └──────────────────┘                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Sync & Versioning

### Version Tracking

All main tables include sync metadata:
- `_version` - Incremented on each UPDATE
- `_last_modified_at` - Timestamp of last change
- `_last_modified_by` - UUID of user who made change

### Automatic Version Increment

```sql
CREATE TRIGGER projects_version_trigger
  BEFORE UPDATE ON digiform.projects
  FOR EACH ROW EXECUTE FUNCTION digiform.increment_version();
```

Triggers applied to:
- projects
- teams
- stakeholders
- assessments
- assessment_responses
- sow_section_approvals
- sow_approval_workflows

---

## 🎯 Multi-Tenancy

### Project Isolation

Every table (except `profiles`) has a `project_id` foreign key referencing `digiform.projects`.

RLS policies ensure:
- Users only see data from their projects
- Project members table controls access
- No cross-project data leakage

### Adding a User to a Project

```sql
SELECT digiform.add_project_member(
  p_project_id := 123,
  p_user_email := 'user@example.com',
  p_role := 'editor'
);
```

---

## 📝 Querying Data

### From Application Code

Always qualify table names with schema:

```typescript
// ✅ CORRECT
const { data } = await supabase
  .from('digiform.projects')
  .select('*')

// ❌ WRONG (will fail - table not in public schema)
const { data } = await supabase
  .from('projects')
  .select('*')
```

### Search Path Configuration

If you want to avoid schema prefixes, set search path:

```sql
-- Set for session
SET search_path TO digiform, public;

-- Or permanently for a role
ALTER ROLE authenticated SET search_path TO digiform, public;
```

Then you can query without prefix:
```sql
SELECT * FROM projects;  -- Resolves to digiform.projects
```

---

## 🛠️ Indexes

Performance indexes created on:

**Foreign Keys**:
- `idx_projects_created_by` - Projects by creator
- `idx_project_members_user` - Members by user
- `idx_project_members_project` - Members by project
- `idx_teams_project` - Teams by project
- `idx_stakeholders_project` - Stakeholders by project
- `idx_stakeholders_team` - Stakeholders by team
- `idx_assessments_project` - Assessments by project
- `idx_responses_assessment` - Responses by assessment

**Composite Indexes**:
- `idx_assessments_phase_tier` - Fast lookups by phase + tier
- `idx_approvals_project_assessment` - Approvals by project + assessment

**Sync Indexes**:
- `idx_projects_version` - Optimized for sync queries
- `idx_responses_version` - Version-based sync
- `idx_stakeholders_version` - Version tracking

---

## 🚀 Migration from Public Schema

If you have existing data in `public` schema, migrate with:

```sql
-- Backup first!
-- pg_dump your existing database

-- Move tables to digiform
ALTER TABLE public.projects SET SCHEMA digiform;
ALTER TABLE public.project_members SET SCHEMA digiform;
ALTER TABLE public.teams SET SCHEMA digiform;
ALTER TABLE public.stakeholders SET SCHEMA digiform;
ALTER TABLE public.assessments SET SCHEMA digiform;
ALTER TABLE public.assessment_responses SET SCHEMA digiform;
ALTER TABLE public.sow_section_approvals SET SCHEMA digiform;
ALTER TABLE public.sow_approval_workflows SET SCHEMA digiform;
ALTER TABLE public.sync_metadata SET SCHEMA digiform;

-- Move functions
ALTER FUNCTION public.increment_version() SET SCHEMA digiform;
ALTER FUNCTION public.add_project_member(BIGINT, TEXT, TEXT) SET SCHEMA digiform;

-- Update search path for roles (optional)
ALTER ROLE authenticated SET search_path TO digiform, public;
```

---

## 📚 Benefits of Dedicated Schema

### 1. **Namespace Isolation**
- Clear separation from system tables (`public`, `auth`, `storage`)
- No naming conflicts
- Easier to identify application vs system tables

### 2. **Security**
- Fine-grained permissions at schema level
- RLS policies apply only to `digiform` schema
- System tables remain untouched

### 3. **Multi-Tenancy**
- Easy to add more applications to same database
- Each app gets its own schema
- Shared `public` schema for common data

### 4. **Backup & Restore**
- Can backup/restore just `digiform` schema
- System schemas remain stable
- Easier testing with schema clones

### 5. **Future-Proof**
- Add new features without polluting `public`
- Versioned schemas (`digiform_v2`, etc.)
- Blue-green deployments at schema level

---

## 🔗 Related Documentation

- **Supabase Schema Best Practices**: https://supabase.com/docs/guides/database/schema-best-practices
- **PostgreSQL Schemas**: https://www.postgresql.org/docs/current/ddl-schemas.html
- **Multi-Tenancy Patterns**: https://supabase.com/docs/guides/auth/row-level-security

---

## 📞 Schema Questions?

If you have questions about the schema structure:

1. Check this document first
2. Review `supabase/schema.sql` for full DDL
3. Check RLS policies in Supabase dashboard
4. Ask in project discussions

---

**Schema Version**: 1.0.0
**Tables**: 10 (9 in digiform, 1 in public)
**Functions**: 3 (2 in digiform, 1 in public)
**RLS Enabled**: ✅ All tables
