export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: Database["public"]["Enums"]["activity_action"]
          actor_id: string | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          organization_id: string
          permit_id: string | null
          project_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["activity_action"]
          actor_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          permit_id?: string | null
          project_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["activity_action"]
          actor_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          permit_id?: string | null
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_permit_id_fkey"
            columns: ["permit_id"]
            isOneToOne: false
            referencedRelation: "permits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          active: boolean | null
          body: string
          created_at: string | null
          created_by: string | null
          ends_at: string | null
          id: string
          starts_at: string | null
          title: string
          type: string | null
        }
        Insert: {
          active?: boolean | null
          body: string
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          starts_at?: string | null
          title: string
          type?: string | null
        }
        Update: {
          active?: boolean | null
          body?: string
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          starts_at?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          assigned_to: string
          comment_id: string
          id: string
          unassigned_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          assigned_to: string
          comment_id: string
          id?: string
          unassigned_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          assigned_to?: string
          comment_id?: string
          id?: string
          unassigned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_assignments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_assignments_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          ai_confidence: number | null
          ai_suggested_response: string | null
          assigned_to: string | null
          author_id: string | null
          author_name: string
          author_role: string | null
          body: string
          category: Database["public"]["Enums"]["comment_category"] | null
          created_at: string | null
          id: string
          is_resolved: boolean | null
          metadata: Json | null
          organization_id: string
          parent_comment_id: string | null
          parse_job_id: string | null
          permit_id: string
          resolved_at: string | null
          resolved_by: string | null
          source: Database["public"]["Enums"]["comment_source"] | null
          updated_at: string | null
        }
        Insert: {
          ai_confidence?: number | null
          ai_suggested_response?: string | null
          assigned_to?: string | null
          author_id?: string | null
          author_name: string
          author_role?: string | null
          body: string
          category?: Database["public"]["Enums"]["comment_category"] | null
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          organization_id: string
          parent_comment_id?: string | null
          parse_job_id?: string | null
          permit_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          source?: Database["public"]["Enums"]["comment_source"] | null
          updated_at?: string | null
        }
        Update: {
          ai_confidence?: number | null
          ai_suggested_response?: string | null
          assigned_to?: string | null
          author_id?: string | null
          author_name?: string
          author_role?: string | null
          body?: string
          category?: Database["public"]["Enums"]["comment_category"] | null
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          organization_id?: string
          parent_comment_id?: string | null
          parse_job_id?: string | null
          permit_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          source?: Database["public"]["Enums"]["comment_source"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parse_job_id_fkey"
            columns: ["parse_job_id"]
            isOneToOne: false
            referencedRelation: "parse_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_permit_id_fkey"
            columns: ["permit_id"]
            isOneToOne: false
            referencedRelation: "permits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deadlines: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          organization_id: string
          permit_id: string | null
          project_id: string | null
          reminder_days_before: number[] | null
          status: Database["public"]["Enums"]["deadline_status"] | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          organization_id: string
          permit_id?: string | null
          project_id?: string | null
          reminder_days_before?: number[] | null
          status?: Database["public"]["Enums"]["deadline_status"] | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          organization_id?: string
          permit_id?: string | null
          project_id?: string | null
          reminder_days_before?: number[] | null
          status?: Database["public"]["Enums"]["deadline_status"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "deadlines_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deadlines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deadlines_permit_id_fkey"
            columns: ["permit_id"]
            isOneToOne: false
            referencedRelation: "permits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deadlines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          auto_parse: boolean | null
          comment_id: string | null
          created_at: string | null
          description: string | null
          document_type: Database["public"]["Enums"]["document_type"] | null
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          is_public: boolean | null
          organization_id: string
          parse_status: Database["public"]["Enums"]["parse_job_status"] | null
          parsed_at: string | null
          permit_id: string | null
          project_id: string | null
          storage_path: string
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          auto_parse?: boolean | null
          comment_id?: string | null
          created_at?: string | null
          description?: string | null
          document_type?: Database["public"]["Enums"]["document_type"] | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_public?: boolean | null
          organization_id: string
          parse_status?: Database["public"]["Enums"]["parse_job_status"] | null
          parsed_at?: string | null
          permit_id?: string | null
          project_id?: string | null
          storage_path: string
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          auto_parse?: boolean | null
          comment_id?: string | null
          created_at?: string | null
          description?: string | null
          document_type?: Database["public"]["Enums"]["document_type"] | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_public?: boolean | null
          organization_id?: string
          parse_status?: Database["public"]["Enums"]["parse_job_status"] | null
          parsed_at?: string | null
          permit_id?: string | null
          project_id?: string | null
          storage_path?: string
          uploaded_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_permit_id_fkey"
            columns: ["permit_id"]
            isOneToOne: false
            referencedRelation: "permits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_queue: {
        Row: {
          created_at: string | null
          id: string
          matched_by: string | null
          organization_id: string | null
          permit_id: string | null
          raw_payload: Json
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          matched_by?: string | null
          organization_id?: string | null
          permit_id?: string | null
          raw_payload: Json
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          matched_by?: string | null
          organization_id?: string | null
          permit_id?: string | null
          raw_payload?: Json
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_queue_matched_by_fkey"
            columns: ["matched_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_queue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_queue_permit_id_fkey"
            columns: ["permit_id"]
            isOneToOne: false
            referencedRelation: "permits"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: string
          name: string
          target_orgs: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          target_orgs?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          target_orgs?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      jurisdictions: {
        Row: {
          avg_review_days: number | null
          contact_email: string | null
          contact_phone: string | null
          county: string | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          portal_url: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          avg_review_days?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          county?: string | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          portal_url?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          avg_review_days?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          county?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          portal_url?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      marketing_leads: {
        Row: {
          active_nc_jurisdictions: string[]
          annual_project_volume: string | null
          biggest_workflow_issue: string | null
          company: string
          company_type: string
          created_at: string
          email: string
          full_name: string
          id: string
          intent: string
          issue_category: string | null
          metadata: Json
          note: string | null
          primary_nc_jurisdiction: string | null
          source_path: string
          status: string
        }
        Insert: {
          active_nc_jurisdictions?: string[]
          annual_project_volume?: string | null
          biggest_workflow_issue?: string | null
          company: string
          company_type: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          intent: string
          issue_category?: string | null
          metadata?: Json
          note?: string | null
          primary_nc_jurisdiction?: string | null
          source_path: string
          status?: string
        }
        Update: {
          active_nc_jurisdictions?: string[]
          annual_project_volume?: string | null
          biggest_workflow_issue?: string | null
          company?: string
          company_type?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          intent?: string
          issue_category?: string | null
          metadata?: Json
          note?: string | null
          primary_nc_jurisdiction?: string | null
          source_path?: string
          status?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email: boolean | null
          email_digest: boolean | null
          id: string
          in_app: boolean | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          profile_id: string
        }
        Insert: {
          created_at?: string | null
          email?: boolean | null
          email_digest?: boolean | null
          id?: string
          in_app?: boolean | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          profile_id: string
        }
        Update: {
          created_at?: string | null
          email?: boolean | null
          email_digest?: boolean | null
          id?: string
          in_app?: boolean | null
          notification_type?: Database["public"]["Enums"]["notification_type"]
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          metadata: Json | null
          organization_id: string
          read_at: string | null
          recipient_id: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          organization_id: string
          read_at?: string | null
          recipient_id: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          organization_id?: string
          read_at?: string | null
          recipient_id?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          active_nc_jurisdictions: string[] | null
          company_type: Database["public"]["Enums"]["company_type"] | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          primary_jurisdiction: string | null
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          active_nc_jurisdictions?: string[] | null
          company_type?: Database["public"]["Enums"]["company_type"] | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          primary_jurisdiction?: string | null
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          active_nc_jurisdictions?: string[] | null
          company_type?: Database["public"]["Enums"]["company_type"] | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_jurisdiction?: string | null
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      parse_jobs: {
        Row: {
          comments_created: number | null
          completed_at: string | null
          created_at: string | null
          document_id: string
          error_message: string | null
          id: string
          metadata: Json | null
          organization_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["parse_job_status"]
          updated_at: string | null
        }
        Insert: {
          comments_created?: number | null
          completed_at?: string | null
          created_at?: string | null
          document_id: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["parse_job_status"]
          updated_at?: string | null
        }
        Update: {
          comments_created?: number | null
          completed_at?: string | null
          created_at?: string | null
          document_id?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["parse_job_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parse_jobs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parse_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      permit_status_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          from_status: Database["public"]["Enums"]["permit_status"] | null
          id: string
          note: string | null
          permit_id: string
          to_status: Database["public"]["Enums"]["permit_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          from_status?: Database["public"]["Enums"]["permit_status"] | null
          id?: string
          note?: string | null
          permit_id: string
          to_status: Database["public"]["Enums"]["permit_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          from_status?: Database["public"]["Enums"]["permit_status"] | null
          id?: string
          note?: string | null
          permit_id?: string
          to_status?: Database["public"]["Enums"]["permit_status"]
        }
        Relationships: [
          {
            foreignKeyName: "permit_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permit_status_history_permit_id_fkey"
            columns: ["permit_id"]
            isOneToOne: false
            referencedRelation: "permits"
            referencedColumns: ["id"]
          },
        ]
      }
      permits: {
        Row: {
          assigned_reviewer: string | null
          created_at: string | null
          created_by: string | null
          decision_date: string | null
          description: string | null
          expiration_date: string | null
          fee_amount: number | null
          fee_paid: boolean | null
          id: string
          jurisdiction: string
          jurisdiction_portal_url: string | null
          jurisdiction_reference_number: string | null
          metadata: Json | null
          organization_id: string
          permit_number: string
          permit_type: Database["public"]["Enums"]["permit_type"]
          priority: Database["public"]["Enums"]["priority_level"] | null
          project_id: string
          reviewer_email: string | null
          status: Database["public"]["Enums"]["permit_status"] | null
          submitted_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_reviewer?: string | null
          created_at?: string | null
          created_by?: string | null
          decision_date?: string | null
          description?: string | null
          expiration_date?: string | null
          fee_amount?: number | null
          fee_paid?: boolean | null
          id?: string
          jurisdiction: string
          jurisdiction_portal_url?: string | null
          jurisdiction_reference_number?: string | null
          metadata?: Json | null
          organization_id: string
          permit_number?: string
          permit_type: Database["public"]["Enums"]["permit_type"]
          priority?: Database["public"]["Enums"]["priority_level"] | null
          project_id: string
          reviewer_email?: string | null
          status?: Database["public"]["Enums"]["permit_status"] | null
          submitted_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_reviewer?: string | null
          created_at?: string | null
          created_by?: string | null
          decision_date?: string | null
          description?: string | null
          expiration_date?: string | null
          fee_amount?: number | null
          fee_paid?: boolean | null
          id?: string
          jurisdiction?: string
          jurisdiction_portal_url?: string | null
          jurisdiction_reference_number?: string | null
          metadata?: Json | null
          organization_id?: string
          permit_number?: string
          permit_type?: Database["public"]["Enums"]["permit_type"]
          priority?: Database["public"]["Enums"]["priority_level"] | null
          project_id?: string
          reviewer_email?: string | null
          status?: Database["public"]["Enums"]["permit_status"] | null
          submitted_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permits_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_config: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "platform_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_super_admin: boolean | null
          job_title: string | null
          last_seen_at: string | null
          notification_preferences: Json | null
          onboarding_completed: boolean | null
          organization_id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_super_admin?: boolean | null
          job_title?: string | null
          last_seen_at?: string | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          organization_id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_super_admin?: boolean | null
          job_title?: string | null
          last_seen_at?: string | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          organization_id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          acreage: number | null
          address: string | null
          city: string | null
          county: string | null
          created_at: string | null
          description: string | null
          estimated_value: number | null
          id: string
          jurisdiction: string
          latitude: number | null
          lead_id: string | null
          longitude: number | null
          metadata: Json | null
          name: string
          organization_id: string
          parcel_ids: string[] | null
          project_number: string
          project_type: Database["public"]["Enums"]["project_type"] | null
          status: Database["public"]["Enums"]["project_status"] | null
          target_completion_date: string | null
          updated_at: string | null
          zoning_district: string | null
        }
        Insert: {
          acreage?: number | null
          address?: string | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          description?: string | null
          estimated_value?: number | null
          id?: string
          jurisdiction: string
          latitude?: number | null
          lead_id?: string | null
          longitude?: number | null
          metadata?: Json | null
          name: string
          organization_id: string
          parcel_ids?: string[] | null
          project_number?: string
          project_type?: Database["public"]["Enums"]["project_type"] | null
          status?: Database["public"]["Enums"]["project_status"] | null
          target_completion_date?: string | null
          updated_at?: string | null
          zoning_district?: string | null
        }
        Update: {
          acreage?: number | null
          address?: string | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          description?: string | null
          estimated_value?: number | null
          id?: string
          jurisdiction?: string
          latitude?: number | null
          lead_id?: string | null
          longitude?: number | null
          metadata?: Json | null
          name?: string
          organization_id?: string
          parcel_ids?: string[] | null
          project_number?: string
          project_type?: Database["public"]["Enums"]["project_type"] | null
          status?: Database["public"]["Enums"]["project_status"] | null
          target_completion_date?: string | null
          updated_at?: string | null
          zoning_district?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["invitation_status"] | null
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["invitation_status"] | null
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["invitation_status"] | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string | null
          id: string
          invited_by: string | null
          is_active: boolean | null
          organization_id: string
          profile_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          organization_id: string
          profile_id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          organization_id?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_permit_number: { Args: never; Returns: string }
      generate_project_number: { Args: never; Returns: string }
    }
    Enums: {
      activity_action:
        | "project_created"
        | "permit_submitted"
        | "comment_added"
        | "status_changed"
        | "document_uploaded"
        | "reviewer_assigned"
        | "deadline_set"
        | "permit_approved"
        | "permit_denied"
        | "resubmittal_required"
        | "comment_resolved"
        | "comment_assigned"
        | "team_member_invited"
        | "team_member_joined"
        | "document_parsed"
        | "email_ingested"
      comment_category:
        | "parking_access"
        | "stormwater"
        | "building_code"
        | "zoning"
        | "fire_safety"
        | "landscaping"
        | "traffic"
        | "environmental"
        | "general"
        | "other"
      comment_source: "internal" | "jurisdiction" | "imported"
      company_type:
        | "architecture_firm"
        | "civil_site_firm"
        | "developer_builder"
        | "permit_expeditor"
        | "consultant"
        | "other"
      deadline_status:
        | "upcoming"
        | "due_soon"
        | "overdue"
        | "completed"
        | "cancelled"
      document_type:
        | "site_plan"
        | "architectural_drawing"
        | "civil_drawing"
        | "survey"
        | "environmental_report"
        | "traffic_study"
        | "stormwater_plan"
        | "photo"
        | "correspondence"
        | "approval_letter"
        | "rejection_letter"
        | "other"
      invitation_status: "pending" | "accepted" | "expired" | "revoked"
      notification_type:
        | "comment_assigned"
        | "comment_resolved"
        | "permit_status_changed"
        | "deadline_approaching"
        | "document_uploaded"
        | "team_invitation"
        | "mention"
        | "ai_parse_complete"
        | "email_ingested"
      parse_job_status: "queued" | "processing" | "completed" | "failed"
      permit_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "revision_requested"
        | "resubmitted"
        | "approved"
        | "approved_with_conditions"
        | "denied"
        | "withdrawn"
        | "expired"
      permit_type:
        | "site_plan_review"
        | "building_permit"
        | "zoning_variance"
        | "stormwater_review"
        | "grading_permit"
        | "demolition_permit"
        | "sign_permit"
        | "special_use_permit"
        | "subdivision_review"
        | "other"
      priority_level: "low" | "normal" | "high" | "urgent"
      project_status: "draft" | "active" | "on_hold" | "completed" | "archived"
      project_type:
        | "residential"
        | "commercial"
        | "mixed_use"
        | "industrial"
        | "institutional"
        | "infrastructure"
      user_role: "owner" | "admin" | "member" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_action: [
        "project_created",
        "permit_submitted",
        "comment_added",
        "status_changed",
        "document_uploaded",
        "reviewer_assigned",
        "deadline_set",
        "permit_approved",
        "permit_denied",
        "resubmittal_required",
        "comment_resolved",
        "comment_assigned",
        "team_member_invited",
        "team_member_joined",
        "document_parsed",
        "email_ingested",
      ],
      comment_category: [
        "parking_access",
        "stormwater",
        "building_code",
        "zoning",
        "fire_safety",
        "landscaping",
        "traffic",
        "environmental",
        "general",
        "other",
      ],
      comment_source: ["internal", "jurisdiction", "imported"],
      company_type: [
        "architecture_firm",
        "civil_site_firm",
        "developer_builder",
        "permit_expeditor",
        "consultant",
        "other",
      ],
      deadline_status: [
        "upcoming",
        "due_soon",
        "overdue",
        "completed",
        "cancelled",
      ],
      document_type: [
        "site_plan",
        "architectural_drawing",
        "civil_drawing",
        "survey",
        "environmental_report",
        "traffic_study",
        "stormwater_plan",
        "photo",
        "correspondence",
        "approval_letter",
        "rejection_letter",
        "other",
      ],
      invitation_status: ["pending", "accepted", "expired", "revoked"],
      notification_type: [
        "comment_assigned",
        "comment_resolved",
        "permit_status_changed",
        "deadline_approaching",
        "document_uploaded",
        "team_invitation",
        "mention",
        "ai_parse_complete",
        "email_ingested",
      ],
      parse_job_status: ["queued", "processing", "completed", "failed"],
      permit_status: [
        "draft",
        "submitted",
        "under_review",
        "revision_requested",
        "resubmitted",
        "approved",
        "approved_with_conditions",
        "denied",
        "withdrawn",
        "expired",
      ],
      permit_type: [
        "site_plan_review",
        "building_permit",
        "zoning_variance",
        "stormwater_review",
        "grading_permit",
        "demolition_permit",
        "sign_permit",
        "special_use_permit",
        "subdivision_review",
        "other",
      ],
      priority_level: ["low", "normal", "high", "urgent"],
      project_status: ["draft", "active", "on_hold", "completed", "archived"],
      project_type: [
        "residential",
        "commercial",
        "mixed_use",
        "industrial",
        "institutional",
        "infrastructure",
      ],
      user_role: ["owner", "admin", "member", "viewer"],
    },
  },
} as const

