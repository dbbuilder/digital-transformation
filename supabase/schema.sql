-- Digital Transformation Planning System - Multi-Tenant Schema
-- Run this in Supabase SQL Editor

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CREATE DIGIFORM SCHEMA
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS digiform;

-- Grant permissions
GRANT USAGE ON SCHEMA digiform TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA digiform TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA digiform TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA digiform TO postgres, anon, authenticated, service_role;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA digiform GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA digiform GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA digiform GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;

-- ============================================================================
-- USERS & PROJECT ACCESS
-- ============================================================================

-- Users table (extends Supabase auth.users) - Keep in public schema for auth integration
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  organization TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Policies: Users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- PROJECTS (Multi-tenant root)
-- ============================================================================

CREATE TABLE digiform.projects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  organization_name TEXT,
  description TEXT,
  transformation_path TEXT CHECK (transformation_path IN ('AI_INCLUDED', 'AI_FREE')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Sync metadata
  _version BIGINT DEFAULT 1,
  _last_modified_at TIMESTAMPTZ DEFAULT NOW(),
  _last_modified_by UUID REFERENCES auth.users(id)
);

-- Project members (who can access which projects)
CREATE TABLE digiform.project_members (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES digiform.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Enable RLS
ALTER TABLE digiform.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE digiform.project_members ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see projects they're members of
CREATE POLICY "Users can view their projects"
  ON digiform.projects FOR SELECT
  USING (
    id IN (
      SELECT project_id FROM digiform.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update projects they own or edit"
  ON digiform.projects FOR UPDATE
  USING (
    id IN (
      SELECT project_id FROM digiform.project_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Users can create projects"
  ON digiform.projects FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can view project members"
  ON digiform.project_members FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM digiform.project_members
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- TEAMS
-- ============================================================================

CREATE TABLE digiform.teams (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES digiform.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  parent_team_id BIGINT REFERENCES digiform.teams(id) ON DELETE SET NULL,
  lead_stakeholder_id BIGINT, -- Foreign key added later
  responsibilities TEXT[],
  knowledge_areas TEXT[],
  approval_authority TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Sync metadata
  _version BIGINT DEFAULT 1,
  _last_modified_at TIMESTAMPTZ DEFAULT NOW(),
  _last_modified_by UUID REFERENCES auth.users(id)
);

ALTER TABLE digiform.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view teams in their projects"
  ON digiform.teams FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM digiform.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can modify teams in projects they edit"
  ON digiform.teams FOR ALL
  USING (
    project_id IN (
      SELECT project_id FROM digiform.project_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

-- ============================================================================
-- STAKEHOLDERS
-- ============================================================================

CREATE TABLE digiform.stakeholders (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES digiform.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  role TEXT NOT NULL,
  team_id BIGINT REFERENCES digiform.teams(id) ON DELETE SET NULL,
  department TEXT,
  email TEXT,
  phone TEXT,
  reports_to_id BIGINT REFERENCES digiform.stakeholders(id) ON DELETE SET NULL,

  -- Knowledge & Expertise
  knowledge_areas TEXT[], -- ["UI", "API", "DATA", "CLOUD", "AI"]
  specializations TEXT[],

  -- Responsibilities
  responsibilities TEXT[],
  can_approve TEXT[],

  -- Availability & Involvement
  involvement_level TEXT CHECK (involvement_level IN ('RESPONSIBLE', 'ACCOUNTABLE', 'CONSULTED', 'INFORMED', 'APPROVER')),
  availability_hours INTEGER,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Sync metadata
  _version BIGINT DEFAULT 1,
  _last_modified_at TIMESTAMPTZ DEFAULT NOW(),
  _last_modified_by UUID REFERENCES auth.users(id)
);

ALTER TABLE digiform.stakeholders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stakeholders in their projects"
  ON digiform.stakeholders FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM digiform.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can modify stakeholders in projects they edit"
  ON digiform.stakeholders FOR ALL
  USING (
    project_id IN (
      SELECT project_id FROM digiform.project_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

-- Add foreign key for team lead
ALTER TABLE digiform.teams
  ADD CONSTRAINT fk_team_lead
  FOREIGN KEY (lead_stakeholder_id)
  REFERENCES digiform.stakeholders(id)
  ON DELETE SET NULL;

-- ============================================================================
-- ASSESSMENTS
-- ============================================================================

CREATE TABLE digiform.assessments (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES digiform.projects(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('DISCOVERY', 'FOUNDATION', 'MODERNIZATION', 'INTELLIGENCE', 'OPTIMIZATION')),
  tier TEXT NOT NULL CHECK (tier IN ('UI', 'API', 'DATA', 'CLOUD', 'AI')),
  transformation_path TEXT CHECK (transformation_path IN ('AI_INCLUDED', 'AI_FREE')),
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completion_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Sync metadata
  _version BIGINT DEFAULT 1,
  _last_modified_at TIMESTAMPTZ DEFAULT NOW(),
  _last_modified_by UUID REFERENCES auth.users(id),

  UNIQUE(project_id, phase, tier)
);

ALTER TABLE digiform.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assessments in their projects"
  ON digiform.assessments FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM digiform.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can modify assessments in projects they edit"
  ON digiform.assessments FOR ALL
  USING (
    project_id IN (
      SELECT project_id FROM digiform.project_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

-- ============================================================================
-- ASSESSMENT RESPONSES
-- ============================================================================

CREATE TABLE digiform.assessment_responses (
  id BIGSERIAL PRIMARY KEY,
  assessment_id BIGINT REFERENCES digiform.assessments(id) ON DELETE CASCADE,
  project_id BIGINT REFERENCES digiform.projects(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer TEXT,
  notes TEXT,
  priority TEXT CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  answered_by BIGINT REFERENCES digiform.stakeholders(id) ON DELETE SET NULL,
  reviewed_by BIGINT[], -- Array of stakeholder IDs
  approved_by BIGINT REFERENCES digiform.stakeholders(id) ON DELETE SET NULL,
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Sync metadata
  _version BIGINT DEFAULT 1,
  _last_modified_at TIMESTAMPTZ DEFAULT NOW(),
  _last_modified_by UUID REFERENCES auth.users(id)
);

ALTER TABLE digiform.assessment_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view responses in their projects"
  ON digiform.assessment_responses FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM digiform.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can modify responses in projects they edit"
  ON digiform.assessment_responses FOR ALL
  USING (
    project_id IN (
      SELECT project_id FROM digiform.project_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

-- ============================================================================
-- SOW SECTION APPROVALS
-- ============================================================================

CREATE TABLE digiform.sow_section_approvals (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES digiform.projects(id) ON DELETE CASCADE,
  assessment_id BIGINT REFERENCES digiform.assessments(id) ON DELETE CASCADE,
  section_name TEXT NOT NULL,
  approval_required BOOLEAN DEFAULT true,
  required_approvers BIGINT[], -- Array of stakeholder IDs
  approvals JSONB DEFAULT '[]'::jsonb, -- Array of {stakeholderId, status, comments, approvedAt}
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  finalized_at TIMESTAMPTZ,
  finalized_by BIGINT REFERENCES digiform.stakeholders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Sync metadata
  _version BIGINT DEFAULT 1,
  _last_modified_at TIMESTAMPTZ DEFAULT NOW(),
  _last_modified_by UUID REFERENCES auth.users(id),

  UNIQUE(project_id, assessment_id, section_name)
);

ALTER TABLE digiform.sow_section_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view SOW approvals in their projects"
  ON digiform.sow_section_approvals FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM digiform.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can modify SOW approvals in projects they edit"
  ON digiform.sow_section_approvals FOR ALL
  USING (
    project_id IN (
      SELECT project_id FROM digiform.project_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

-- ============================================================================
-- SOW APPROVAL WORKFLOWS
-- ============================================================================

CREATE TABLE digiform.sow_approval_workflows (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES digiform.projects(id) ON DELETE CASCADE,
  assessment_id BIGINT REFERENCES digiform.assessments(id) ON DELETE CASCADE,
  workflow_steps JSONB DEFAULT '[]'::jsonb,
  current_step INTEGER DEFAULT 1,
  overall_status TEXT DEFAULT 'not_started' CHECK (overall_status IN ('not_started', 'in_progress', 'completed', 'cancelled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Sync metadata
  _version BIGINT DEFAULT 1,
  _last_modified_at TIMESTAMPTZ DEFAULT NOW(),
  _last_modified_by UUID REFERENCES auth.users(id)
);

ALTER TABLE digiform.sow_approval_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflows in their projects"
  ON digiform.sow_approval_workflows FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM digiform.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can modify workflows in projects they edit"
  ON digiform.sow_approval_workflows FOR ALL
  USING (
    project_id IN (
      SELECT project_id FROM digiform.project_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

-- ============================================================================
-- SYNC METADATA TRACKING
-- ============================================================================

-- Track last sync for each table per user
CREATE TABLE digiform.sync_metadata (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  last_sync_version BIGINT DEFAULT 0,
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, table_name)
);

ALTER TABLE digiform.sync_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sync metadata"
  ON digiform.sync_metadata FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sync metadata"
  ON digiform.sync_metadata FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS (Auto-increment version on UPDATE)
-- ============================================================================

CREATE OR REPLACE FUNCTION digiform.increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW._version := OLD._version + 1;
  NEW._last_modified_at := NOW();
  NEW._last_modified_by := auth.uid();
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to all syncable tables
CREATE TRIGGER projects_version_trigger
  BEFORE UPDATE ON digiform.projects
  FOR EACH ROW EXECUTE FUNCTION digiform.increment_version();

CREATE TRIGGER teams_version_trigger
  BEFORE UPDATE ON digiform.teams
  FOR EACH ROW EXECUTE FUNCTION digiform.increment_version();

CREATE TRIGGER stakeholders_version_trigger
  BEFORE UPDATE ON digiform.stakeholders
  FOR EACH ROW EXECUTE FUNCTION digiform.increment_version();

CREATE TRIGGER assessments_version_trigger
  BEFORE UPDATE ON digiform.assessments
  FOR EACH ROW EXECUTE FUNCTION digiform.increment_version();

CREATE TRIGGER responses_version_trigger
  BEFORE UPDATE ON digiform.assessment_responses
  FOR EACH ROW EXECUTE FUNCTION digiform.increment_version();

CREATE TRIGGER approvals_version_trigger
  BEFORE UPDATE ON digiform.sow_section_approvals
  FOR EACH ROW EXECUTE FUNCTION digiform.increment_version();

CREATE TRIGGER workflows_version_trigger
  BEFORE UPDATE ON digiform.sow_approval_workflows
  FOR EACH ROW EXECUTE FUNCTION digiform.increment_version();

-- ============================================================================
-- TRIGGER (Auto-create profile on signup)
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to add user to project
CREATE OR REPLACE FUNCTION digiform.add_project_member(
  p_project_id BIGINT,
  p_user_email TEXT,
  p_role TEXT DEFAULT 'viewer'
)
RETURNS BIGINT AS $$
DECLARE
  v_user_id UUID;
  v_member_id BIGINT;
BEGIN
  -- Get user ID from email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_user_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', p_user_email;
  END IF;

  -- Insert or update member
  INSERT INTO digiform.project_members (project_id, user_id, role)
  VALUES (p_project_id, v_user_id, p_role)
  ON CONFLICT (project_id, user_id)
  DO UPDATE SET role = p_role
  RETURNING id INTO v_member_id;

  RETURN v_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_projects_created_by ON digiform.projects(created_by);
CREATE INDEX idx_project_members_user ON digiform.project_members(user_id);
CREATE INDEX idx_project_members_project ON digiform.project_members(project_id);

CREATE INDEX idx_teams_project ON digiform.teams(project_id);
CREATE INDEX idx_stakeholders_project ON digiform.stakeholders(project_id);
CREATE INDEX idx_stakeholders_team ON digiform.stakeholders(team_id);

CREATE INDEX idx_assessments_project ON digiform.assessments(project_id);
CREATE INDEX idx_assessments_phase_tier ON digiform.assessments(project_id, phase, tier);

CREATE INDEX idx_responses_assessment ON digiform.assessment_responses(assessment_id);
CREATE INDEX idx_responses_project ON digiform.assessment_responses(project_id);
CREATE INDEX idx_responses_answered_by ON digiform.assessment_responses(answered_by);

CREATE INDEX idx_approvals_project_assessment ON digiform.sow_section_approvals(project_id, assessment_id);

-- Indexes for sync queries
CREATE INDEX idx_projects_version ON digiform.projects(_version, _last_modified_at);
CREATE INDEX idx_responses_version ON digiform.assessment_responses(_version, _last_modified_at);
CREATE INDEX idx_stakeholders_version ON digiform.stakeholders(_version, _last_modified_at);

-- ============================================================================
-- INITIAL DATA (Optional)
-- ============================================================================

-- Create a system user for automated actions
-- INSERT INTO auth.users (email) VALUES ('system@internal') ON CONFLICT DO NOTHING;

COMMENT ON TABLE digiform.projects IS 'Multi-tenant: Each digital transformation project';
COMMENT ON TABLE digiform.project_members IS 'Access control: Who can access which projects';
COMMENT ON TABLE digiform.stakeholders IS 'People involved in transformation projects';
COMMENT ON TABLE digiform.assessment_responses IS 'Answers to interview questions';
COMMENT ON COLUMN digiform.projects._version IS 'Incremented on each update for conflict detection';
COMMENT ON COLUMN digiform.projects._last_modified_by IS 'UUID of user who made last change';
