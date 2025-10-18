/**
 * Supabase Database Type Definitions
 *
 * This file defines the TypeScript types for the Supabase database schema.
 * It mirrors the schema defined in supabase/schema.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: number
          name: string
          organization_name: string | null
          description: string | null
          transformation_path: 'AI_INCLUDED' | 'AI_FREE' | null
          status: string
          created_by: string | null
          created_at: string
          updated_at: string
          _version: number
          _last_modified_at: string
          _last_modified_by: string | null
        }
        Insert: {
          id?: number
          name: string
          organization_name?: string | null
          description?: string | null
          transformation_path?: 'AI_INCLUDED' | 'AI_FREE' | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
          _version?: number
          _last_modified_at?: string
          _last_modified_by?: string | null
        }
        Update: {
          id?: number
          name?: string
          organization_name?: string | null
          description?: string | null
          transformation_path?: 'AI_INCLUDED' | 'AI_FREE' | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
          _version?: number
          _last_modified_at?: string
          _last_modified_by?: string | null
        }
      }
      project_members: {
        Row: {
          id: number
          project_id: number
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          joined_at: string
        }
        Insert: {
          id?: number
          project_id: number
          user_id: string
          role?: 'owner' | 'editor' | 'viewer'
          joined_at?: string
        }
        Update: {
          id?: number
          project_id?: number
          user_id?: string
          role?: 'owner' | 'editor' | 'viewer'
          joined_at?: string
        }
      }
      teams: {
        Row: {
          id: number
          project_id: number
          name: string
          description: string | null
          parent_team_id: number | null
          created_at: string
          updated_at: string
          _version: number
          _last_modified_at: string
          _last_modified_by: string | null
        }
        Insert: {
          id?: number
          project_id: number
          name: string
          description?: string | null
          parent_team_id?: number | null
          created_at?: string
          updated_at?: string
          _version?: number
          _last_modified_at?: string
          _last_modified_by?: string | null
        }
        Update: {
          id?: number
          project_id?: number
          name?: string
          description?: string | null
          parent_team_id?: number | null
          created_at?: string
          updated_at?: string
          _version?: number
          _last_modified_at?: string
          _last_modified_by?: string | null
        }
      }
      stakeholders: {
        Row: {
          id: number
          project_id: number
          team_id: number | null
          name: string
          title: string | null
          email: string | null
          phone: string | null
          involvement_level: 'EXECUTIVE_SPONSOR' | 'DECISION_MAKER' | 'APPROVER' | 'INFLUENCER' | 'END_USER' | 'SUPPORT'
          relevant_tiers: string[]
          relevant_phases: string[]
          can_approve: string[]
          should_interview: boolean
          notes: string | null
          created_at: string
          updated_at: string
          _version: number
          _last_modified_at: string
          _last_modified_by: string | null
        }
        Insert: {
          id?: number
          project_id: number
          team_id?: number | null
          name: string
          title?: string | null
          email?: string | null
          phone?: string | null
          involvement_level: 'EXECUTIVE_SPONSOR' | 'DECISION_MAKER' | 'APPROVER' | 'INFLUENCER' | 'END_USER' | 'SUPPORT'
          relevant_tiers?: string[]
          relevant_phases?: string[]
          can_approve?: string[]
          should_interview?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          _version?: number
          _last_modified_at?: string
          _last_modified_by?: string | null
        }
        Update: {
          id?: number
          project_id?: number
          team_id?: number | null
          name?: string
          title?: string | null
          email?: string | null
          phone?: string | null
          involvement_level?: 'EXECUTIVE_SPONSOR' | 'DECISION_MAKER' | 'APPROVER' | 'INFLUENCER' | 'END_USER' | 'SUPPORT'
          relevant_tiers?: string[]
          relevant_phases?: string[]
          can_approve?: string[]
          should_interview?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          _version?: number
          _last_modified_at?: string
          _last_modified_by?: string | null
        }
      }
      assessments: {
        Row: {
          id: number
          project_id: number
          phase: string
          tier: string
          track: 'BUSINESS' | 'TECHNICAL'
          status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
          created_at: string
          updated_at: string
          _version: number
          _last_modified_at: string
          _last_modified_by: string | null
        }
        Insert: {
          id?: number
          project_id: number
          phase: string
          tier: string
          track: 'BUSINESS' | 'TECHNICAL'
          status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
          created_at?: string
          updated_at?: string
          _version?: number
          _last_modified_at?: string
          _last_modified_by?: string | null
        }
        Update: {
          id?: number
          project_id?: number
          phase?: string
          tier?: string
          track?: 'BUSINESS' | 'TECHNICAL'
          status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
          created_at?: string
          updated_at?: string
          _version?: number
          _last_modified_at?: string
          _last_modified_by?: string | null
        }
      }
      assessment_responses: {
        Row: {
          id: number
          assessment_id: number
          question_id: string
          question_text: string
          response_text: string | null
          evidence_files: Json | null
          notes: string | null
          stakeholder_id: number | null
          answered_at: string | null
          created_at: string
          updated_at: string
          _version: number
          _last_modified_at: string
          _last_modified_by: string | null
        }
        Insert: {
          id?: number
          assessment_id: number
          question_id: string
          question_text: string
          response_text?: string | null
          evidence_files?: Json | null
          notes?: string | null
          stakeholder_id?: number | null
          answered_at?: string | null
          created_at?: string
          updated_at?: string
          _version?: number
          _last_modified_at?: string
          _last_modified_by?: string | null
        }
        Update: {
          id?: number
          assessment_id?: number
          question_id?: string
          question_text?: string
          response_text?: string | null
          evidence_files?: Json | null
          notes?: string | null
          stakeholder_id?: number | null
          answered_at?: string | null
          created_at?: string
          updated_at?: string
          _version?: number
          _last_modified_at?: string
          _last_modified_by?: string | null
        }
      }
      sow_section_approvals: {
        Row: {
          id: number
          project_id: number
          section_type: string
          content: Json
          status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'
          current_approver_id: number | null
          approved_by: number | null
          approved_at: string | null
          rejected_by: number | null
          rejected_at: string | null
          rejection_reason: string | null
          version: number
          created_at: string
          updated_at: string
          _version: number
          _last_modified_at: string
          _last_modified_by: string | null
        }
        Insert: {
          id?: number
          project_id: number
          section_type: string
          content: Json
          status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'
          current_approver_id?: number | null
          approved_by?: number | null
          approved_at?: string | null
          rejected_by?: number | null
          rejected_at?: string | null
          rejection_reason?: string | null
          version?: number
          created_at?: string
          updated_at?: string
          _version?: number
          _last_modified_at?: string
          _last_modified_by?: string | null
        }
        Update: {
          id?: number
          project_id?: number
          section_type?: string
          content?: Json
          status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'
          current_approver_id?: number | null
          approved_by?: number | null
          approved_at?: string | null
          rejected_by?: number | null
          rejected_at?: string | null
          rejection_reason?: string | null
          version?: number
          created_at?: string
          updated_at?: string
          _version?: number
          _last_modified_at?: string
          _last_modified_by?: string | null
        }
      }
      sow_approval_workflows: {
        Row: {
          id: number
          project_id: number
          section_approval_id: number
          step_order: number
          approver_id: number
          status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED'
          approved_at: string | null
          rejected_at: string | null
          comments: string | null
          created_at: string
          updated_at: string
          _version: number
          _last_modified_at: string
          _last_modified_by: string | null
        }
        Insert: {
          id?: number
          project_id: number
          section_approval_id: number
          step_order: number
          approver_id: number
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED'
          approved_at?: string | null
          rejected_at?: string | null
          comments?: string | null
          created_at?: string
          updated_at?: string
          _version?: number
          _last_modified_at?: string
          _last_modified_by?: string | null
        }
        Update: {
          id?: number
          project_id?: number
          section_approval_id?: number
          step_order?: number
          approver_id?: number
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED'
          approved_at?: string | null
          rejected_at?: string | null
          comments?: string | null
          created_at?: string
          updated_at?: string
          _version?: number
          _last_modified_at?: string
          _last_modified_by?: string | null
        }
      }
      sync_metadata: {
        Row: {
          id: number
          user_id: string
          table_name: string
          last_sync_at: string
          last_sync_version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          table_name: string
          last_sync_at?: string
          last_sync_version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          table_name?: string
          last_sync_at?: string
          last_sync_version?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_project_member: {
        Args: {
          target_project_id: number
          target_user_id: string
          member_role: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
