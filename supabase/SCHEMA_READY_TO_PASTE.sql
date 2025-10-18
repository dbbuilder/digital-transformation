-- Digital Transformation Planning System - Multi-Tenant Schema
-- Run this in Supabase SQL Editor

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS & PROJECT ACCESS
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
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

CREATE TABLE public.projects (
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
CREATE TABLE public.project_members (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see projects they're members of
CREATE POLICY "Users can view their projects"
  ON public.projects FOR SELECT
  USING (
    id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update projects they own or edit"
  ON public.projects FOR UPDATE
  USING (
    id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can view project members"
  ON public.project_members FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- TEAMS
-- ============================================================================

CREATE TABLE public.teams (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  parent_team_id BIGINT REFERENCES public.teams(id) ON DELETE SET NULL,
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

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view teams in their projects"
  ON public.teams FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can modify teams in projects they edit"
  ON public.teams FOR ALL
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

-- ============================================================================
-- STAKEHOLDERS
-- ============================================================================

CREATE TABLE public.stakeholders (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  role TEXT NOT NULL,
  team_id BIGINT REFERENCES public.teams(id) ON DELETE SET NULL,
  department TEXT,
  email TEXT,
  phone TEXT,
  reports_to_id BIGINT REFERENCES public.stakeholders(id) ON DELETE SET NULL,

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

ALTER TABLE public.stakeholders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stakeholders in their projects"
  ON public.stakeholders FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can modify stakeholders in projects they edit"
  ON public.stakeholders FOR ALL
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

-- Add foreign key for team lead
ALTER TABLE public.teams
  ADD CONSTRAINT fk_team_lead
  FOREIGN KEY (lead_stakeholder_id)
  REFERENCES public.stakeholders(id)
  ON DELETE SET NULL;

-- ============================================================================
-- ASSESSMENTS
-- ============================================================================

CREATE TABLE public.assessments (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES public.projects(id) ON DELETE CASCADE,
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

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assessments in their projects"
  ON public.assessments FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can modify assessments in projects they edit"
  ON public.assessments FOR ALL
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

-- ============================================================================
-- ASSESSMENT RESPONSES
-- ============================================================================

CREATE TABLE public.assessment_responses (
  id BIGSERIAL PRIMARY KEY,
  assessment_id BIGINT REFERENCES public.assessments(id) ON DELETE CASCADE,
  project_id BIGINT REFERENCES public.projects(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer TEXT,
  notes TEXT,
  priority TEXT CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  answered_by BIGINT REFERENCES public.stakeholders(id) ON DELETE SET NULL,
  reviewed_by BIGINT[], -- Array of stakeholder IDs
  approved_by BIGINT REFERENCES public.stakeholders(id) ON DELETE SET NULL,
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Sync metadata
  _version BIGINT DEFAULT 1,
  _last_modified_at TIMESTAMPTZ DEFAULT NOW(),
  _last_modified_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view responses in their projects"
  ON public.assessment_responses FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can modify responses in projects they edit"
  ON public.assessment_responses FOR ALL
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

-- ============================================================================
-- SOW SECTION APPROVALS
-- ============================================================================

CREATE TABLE public.sow_section_approvals (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES public.projects(id) ON DELETE CASCADE,
  assessment_id BIGINT REFERENCES public.assessments(id) ON DELETE CASCADE,
  section_name TEXT NOT NULL,
  approval_required BOOLEAN DEFAULT true,
  required_approvers BIGINT[], -- Array of stakeholder IDs
  approvals JSONB DEFAULT '[]'::jsonb, -- Array of {stakeholderId, status, comments, approvedAt}
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  finalized_at TIMESTAMPTZ,
  finalized_by BIGINT REFERENCES public.stakeholders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Sync metadata
  _version BIGINT DEFAULT 1,
  _last_modified_at TIMESTAMPTZ DEFAULT NOW(),
  _last_modified_by UUID REFERENCES auth.users(id),

  UNIQUE(project_id, assessment_id, section_name)
);

ALTER TABLE public.sow_section_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view SOW approvals in their projects"
  ON public.sow_section_approvals FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can modify SOW approvals in projects they edit"
  ON public.sow_section_approvals FOR ALL
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

-- ============================================================================
-- SOW APPROVAL WORKFLOWS
-- ============================================================================

CREATE TABLE public.sow_approval_workflows (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES public.projects(id) ON DELETE CASCADE,
  assessment_id BIGINT REFERENCES public.assessments(id) ON DELETE CASCADE,
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

ALTER TABLE public.sow_approval_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflows in their projects"
  ON public.sow_approval_workflows FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can modify workflows in projects they edit"
  ON public.sow_approval_workflows FOR ALL
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

-- ============================================================================
-- SYNC METADATA TRACKING
-- ============================================================================

-- Track last sync for each table per user
CREATE TABLE public.sync_metadata (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  last_sync_version BIGINT DEFAULT 0,
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, table_name)
);

ALTER TABLE public.sync_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sync metadata"
  ON public.sync_metadata FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sync metadata"
  ON public.sync_metadata FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS (Auto-increment version on UPDATE)
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_version()
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
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION increment_version();

CREATE TRIGGER teams_version_trigger
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION increment_version();

CREATE TRIGGER stakeholders_version_trigger
  BEFORE UPDATE ON public.stakeholders
  FOR EACH ROW EXECUTE FUNCTION increment_version();

CREATE TRIGGER assessments_version_trigger
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION increment_version();

CREATE TRIGGER responses_version_trigger
  BEFORE UPDATE ON public.assessment_responses
  FOR EACH ROW EXECUTE FUNCTION increment_version();

CREATE TRIGGER approvals_version_trigger
  BEFORE UPDATE ON public.sow_section_approvals
  FOR EACH ROW EXECUTE FUNCTION increment_version();

CREATE TRIGGER workflows_version_trigger
  BEFORE UPDATE ON public.sow_approval_workflows
  FOR EACH ROW EXECUTE FUNCTION increment_version();

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
CREATE OR REPLACE FUNCTION add_project_member(
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
  INSERT INTO public.project_members (project_id, user_id, role)
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

CREATE INDEX idx_projects_created_by ON public.projects(created_by);
CREATE INDEX idx_project_members_user ON public.project_members(user_id);
CREATE INDEX idx_project_members_project ON public.project_members(project_id);

CREATE INDEX idx_teams_project ON public.teams(project_id);
CREATE INDEX idx_stakeholders_project ON public.stakeholders(project_id);
CREATE INDEX idx_stakeholders_team ON public.stakeholders(team_id);

CREATE INDEX idx_assessments_project ON public.assessments(project_id);
CREATE INDEX idx_assessments_phase_tier ON public.assessments(project_id, phase, tier);

CREATE INDEX idx_responses_assessment ON public.assessment_responses(assessment_id);
CREATE INDEX idx_responses_project ON public.assessment_responses(project_id);
CREATE INDEX idx_responses_answered_by ON public.assessment_responses(answered_by);

CREATE INDEX idx_approvals_project_assessment ON public.sow_section_approvals(project_id, assessment_id);

-- Indexes for sync queries
CREATE INDEX idx_projects_version ON public.projects(_version, _last_modified_at);
CREATE INDEX idx_responses_version ON public.assessment_responses(_version, _last_modified_at);
CREATE INDEX idx_stakeholders_version ON public.stakeholders(_version, _last_modified_at);

-- ============================================================================
-- INITIAL DATA (Optional)
-- ============================================================================

-- Create a system user for automated actions
-- INSERT INTO auth.users (email) VALUES ('system@internal') ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.projects IS 'Multi-tenant: Each digital transformation project';
COMMENT ON TABLE public.project_members IS 'Access control: Who can access which projects';
COMMENT ON TABLE public.stakeholders IS 'People involved in transformation projects';
COMMENT ON TABLE public.assessment_responses IS 'Answers to interview questions';
COMMENT ON COLUMN public.projects._version IS 'Incremented on each update for conflict detection';
COMMENT ON COLUMN public.projects._last_modified_by IS 'UUID of user who made last change';
