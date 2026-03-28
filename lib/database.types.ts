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
          ip_address: string | null
          organization_id: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
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
          {
            foreignKeyName: "admin_audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      company_group_members: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          profile_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          profile_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "company_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_group_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          parent_group_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          parent_group_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          parent_group_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_groups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_groups_parent_group_id_fkey"
            columns: ["parent_group_id"]
            isOneToOne: false
            referencedRelation: "company_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_change_usage: {
        Row: {
          change_request_ids: string[] | null
          changes_used: number
          contract_id: string
          created_at: string
          id: string
          organization_id: string
          quarter: string
          updated_at: string
        }
        Insert: {
          change_request_ids?: string[] | null
          changes_used?: number
          contract_id: string
          created_at?: string
          id?: string
          organization_id: string
          quarter: string
          updated_at?: string
        }
        Update: {
          change_request_ids?: string[] | null
          changes_used?: number
          contract_id?: string
          created_at?: string
          id?: string
          organization_id?: string
          quarter?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_change_usage_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "organization_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_change_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      flowe_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flowe_knowledge: {
        Row: {
          category: string
          confidence: number | null
          content: string
          created_at: string | null
          created_by: string | null
          embedding: string | null
          example_question: string | null
          example_response: string | null
          id: string
          is_active: boolean | null
          keywords: string[]
          organization_id: string | null
          source: string | null
          source_url: string | null
          tags: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          confidence?: number | null
          content: string
          created_at?: string | null
          created_by?: string | null
          embedding?: string | null
          example_question?: string | null
          example_response?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[]
          organization_id?: string | null
          source?: string | null
          source_url?: string | null
          tags?: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          confidence?: number | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          embedding?: string | null
          example_question?: string | null
          example_response?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[]
          organization_id?: string | null
          source?: string | null
          source_url?: string | null
          tags?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flowe_knowledge_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flowe_knowledge_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      flowe_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flowe_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "flowe_conversations"
            referencedColumns: ["id"]
          },
        ]
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
      license_change_requests: {
        Row: {
          applied_at: string | null
          billing_term: Database["public"]["Enums"]["billing_term"]
          created_at: string
          current_license_type: Database["public"]["Enums"]["license_type"]
          id: string
          invoice_reference: string | null
          organization_id: string
          payment_received: boolean | null
          request_notes: string | null
          requested_by: string
          requested_license_type: Database["public"]["Enums"]["license_type"]
          requires_prepayment: boolean | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["license_change_status"]
          target_user_id: string
          updated_at: string
        }
        Insert: {
          applied_at?: string | null
          billing_term?: Database["public"]["Enums"]["billing_term"]
          created_at?: string
          current_license_type: Database["public"]["Enums"]["license_type"]
          id?: string
          invoice_reference?: string | null
          organization_id: string
          payment_received?: boolean | null
          request_notes?: string | null
          requested_by: string
          requested_license_type: Database["public"]["Enums"]["license_type"]
          requires_prepayment?: boolean | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["license_change_status"]
          target_user_id: string
          updated_at?: string
        }
        Update: {
          applied_at?: string | null
          billing_term?: Database["public"]["Enums"]["billing_term"]
          created_at?: string
          current_license_type?: Database["public"]["Enums"]["license_type"]
          id?: string
          invoice_reference?: string | null
          organization_id?: string
          payment_received?: boolean | null
          request_notes?: string | null
          requested_by?: string
          requested_license_type?: Database["public"]["Enums"]["license_type"]
          requires_prepayment?: boolean | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["license_change_status"]
          target_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "license_change_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_change_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_change_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_change_requests_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      license_definitions: {
        Row: {
          can_access_admin_panel: boolean | null
          can_create_projects: boolean | null
          can_create_subprojects: boolean | null
          can_delete_files: boolean | null
          can_download: boolean | null
          can_export_data: boolean | null
          can_manage_team: boolean | null
          can_reset_passwords: boolean | null
          can_upload: boolean | null
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          license_type: Database["public"]["Enums"]["license_type"]
          max_permits_per_project: number | null
          max_projects: number | null
          price_annual_cents: number
          price_monthly_cents: number
          updated_at: string | null
        }
        Insert: {
          can_access_admin_panel?: boolean | null
          can_create_projects?: boolean | null
          can_create_subprojects?: boolean | null
          can_delete_files?: boolean | null
          can_download?: boolean | null
          can_export_data?: boolean | null
          can_manage_team?: boolean | null
          can_reset_passwords?: boolean | null
          can_upload?: boolean | null
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          license_type: Database["public"]["Enums"]["license_type"]
          max_permits_per_project?: number | null
          max_projects?: number | null
          price_annual_cents?: number
          price_monthly_cents?: number
          updated_at?: string | null
        }
        Update: {
          can_access_admin_panel?: boolean | null
          can_create_projects?: boolean | null
          can_create_subprojects?: boolean | null
          can_delete_files?: boolean | null
          can_download?: boolean | null
          can_export_data?: boolean | null
          can_manage_team?: boolean | null
          can_reset_passwords?: boolean | null
          can_upload?: boolean | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          license_type?: Database["public"]["Enums"]["license_type"]
          max_permits_per_project?: number | null
          max_projects?: number | null
          price_annual_cents?: number
          price_monthly_cents?: number
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
      organization_contracts: {
        Row: {
          billing_term: Database["public"]["Enums"]["billing_term"]
          contract_end: string | null
          contract_name: string
          contract_start: string | null
          created_at: string
          id: string
          is_active: boolean | null
          notes: string | null
          organization_id: string
          quarterly_change_allowance: number | null
          requires_prepayment_for_changes: boolean | null
          updated_at: string
        }
        Insert: {
          billing_term?: Database["public"]["Enums"]["billing_term"]
          contract_end?: string | null
          contract_name?: string
          contract_start?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          organization_id: string
          quarterly_change_allowance?: number | null
          requires_prepayment_for_changes?: boolean | null
          updated_at?: string
        }
        Update: {
          billing_term?: Database["public"]["Enums"]["billing_term"]
          contract_end?: string | null
          contract_name?: string
          contract_start?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          organization_id?: string
          quarterly_change_allowance?: number | null
          requires_prepayment_for_changes?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_contracts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          active_nc_jurisdictions: string[] | null
          billing_email: string | null
          company_type: Database["public"]["Enums"]["company_type"] | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          max_file_size_bytes: number | null
          max_users: number | null
          name: string
          primary_jurisdiction: string | null
          settings: Json | null
          slug: string
          storage_limit_bytes: number | null
          storage_used_bytes: number | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          active_nc_jurisdictions?: string[] | null
          billing_email?: string | null
          company_type?: Database["public"]["Enums"]["company_type"] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_file_size_bytes?: number | null
          max_users?: number | null
          name: string
          primary_jurisdiction?: string | null
          settings?: Json | null
          slug: string
          storage_limit_bytes?: number | null
          storage_used_bytes?: number | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          active_nc_jurisdictions?: string[] | null
          billing_email?: string | null
          company_type?: Database["public"]["Enums"]["company_type"] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_file_size_bytes?: number | null
          max_users?: number | null
          name?: string
          primary_jurisdiction?: string | null
          settings?: Json | null
          slug?: string
          storage_limit_bytes?: number | null
          storage_used_bytes?: number | null
          subscription_tier?: string | null
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
      password_reset_config: {
        Row: {
          created_at: string | null
          force_reset_schedule_days: number | null
          id: string
          last_force_reset_at: string | null
          min_password_length: number | null
          organization_id: string
          require_number: boolean | null
          require_special_char: boolean | null
          require_uppercase: boolean | null
          reset_link_duration_hours: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          force_reset_schedule_days?: number | null
          id?: string
          last_force_reset_at?: string | null
          min_password_length?: number | null
          organization_id: string
          require_number?: boolean | null
          require_special_char?: boolean | null
          require_uppercase?: boolean | null
          reset_link_duration_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          force_reset_schedule_days?: number | null
          id?: string
          last_force_reset_at?: string | null
          min_password_length?: number | null
          organization_id?: string
          require_number?: boolean | null
          require_special_char?: boolean | null
          require_uppercase?: boolean | null
          reset_link_duration_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "password_reset_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
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
          bio: string | null
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          is_super_admin: boolean | null
          job_title: string | null
          last_seen_at: string | null
          license_expires_at: string | null
          license_type: Database["public"]["Enums"]["license_type"] | null
          licensed_at: string | null
          notification_preferences: Json | null
          onboarding_completed: boolean | null
          organization_id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          is_super_admin?: boolean | null
          job_title?: string | null
          last_seen_at?: string | null
          license_expires_at?: string | null
          license_type?: Database["public"]["Enums"]["license_type"] | null
          licensed_at?: string | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          organization_id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_super_admin?: boolean | null
          job_title?: string | null
          last_seen_at?: string | null
          license_expires_at?: string | null
          license_type?: Database["public"]["Enums"]["license_type"] | null
          licensed_at?: string | null
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
      role_permissions: {
        Row: {
          id: string
          license_type: Database["public"]["Enums"]["license_type"]
          permission: Database["public"]["Enums"]["permission_action"]
        }
        Insert: {
          id?: string
          license_type: Database["public"]["Enums"]["license_type"]
          permission: Database["public"]["Enums"]["permission_action"]
        }
        Update: {
          id?: string
          license_type?: Database["public"]["Enums"]["license_type"]
          permission?: Database["public"]["Enums"]["permission_action"]
        }
        Relationships: []
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
      user_activity_tracking: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          organization_id: string
          profile_id: string
          resource_id: string | null
          resource_name: string | null
          resource_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          organization_id: string
          profile_id: string
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          organization_id?: string
          profile_id?: string
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_tracking_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permission_overrides: {
        Row: {
          created_at: string | null
          granted: boolean
          granted_by: string | null
          id: string
          organization_id: string
          permission: Database["public"]["Enums"]["permission_action"]
          profile_id: string
        }
        Insert: {
          created_at?: string | null
          granted: boolean
          granted_by?: string | null
          id?: string
          organization_id: string
          permission: Database["public"]["Enums"]["permission_action"]
          profile_id: string
        }
        Update: {
          created_at?: string | null
          granted?: boolean
          granted_by?: string | null
          id?: string
          organization_id?: string
          permission?: Database["public"]["Enums"]["permission_action"]
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permission_overrides_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permission_overrides_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permission_overrides_profile_id_fkey"
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
      check_user_permission: {
        Args: {
          p_permission: Database["public"]["Enums"]["permission_action"]
          p_user_id: string
        }
        Returns: boolean
      }
      generate_permit_number: { Args: never; Returns: string }
      generate_project_number: { Args: never; Returns: string }
      is_org_admin: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: boolean
      }
      match_flowe_knowledge: {
        Args: {
          filter_category?: string
          filter_org_id?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          category: string
          confidence: number
          content: string
          example_question: string
          example_response: string
          id: string
          keywords: string[]
          similarity: number
          source: string
          tags: string[]
          title: string
        }[]
      }
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
        | "user_login"
        | "user_logout"
        | "password_reset"
        | "password_changed"
        | "license_assigned"
        | "license_changed"
        | "permission_changed"
        | "file_downloaded"
        | "data_exported"
        | "admin_panel_accessed"
        | "settings_changed"
        | "group_created"
        | "group_updated"
        | "team_member_removed"
        | "team_member_role_changed"
        | "team_invitation_sent"
        | "team_invitation_accepted"
      billing_term: "monthly" | "prepaid" | "contract_allowance"
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
      license_change_status:
        | "pending"
        | "approved"
        | "applied"
        | "rejected"
        | "cancelled"
      license_type: "admin" | "project_manager" | "contributor" | "guest_viewer"
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
      permission_action:
        | "project.create"
        | "project.read"
        | "project.update"
        | "project.delete"
        | "subproject.create"
        | "subproject.read"
        | "subproject.update"
        | "subproject.delete"
        | "permit.create"
        | "permit.read"
        | "permit.update"
        | "permit.delete"
        | "document.upload"
        | "document.download"
        | "document.delete"
        | "document.read"
        | "comment.create"
        | "comment.read"
        | "comment.update"
        | "comment.delete"
        | "comment.resolve"
        | "team.invite"
        | "team.remove"
        | "team.update_role"
        | "admin.access"
        | "admin.manage_users"
        | "admin.manage_settings"
        | "admin.view_audit"
        | "analytics.view"
        | "analytics.export"
        | "password.reset_others"
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
        "user_login",
        "user_logout",
        "password_reset",
        "password_changed",
        "license_assigned",
        "license_changed",
        "permission_changed",
        "file_downloaded",
        "data_exported",
        "admin_panel_accessed",
        "settings_changed",
        "group_created",
        "group_updated",
        "team_member_removed",
        "team_member_role_changed",
        "team_invitation_sent",
        "team_invitation_accepted",
      ],
      billing_term: ["monthly", "prepaid", "contract_allowance"],
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
      license_change_status: [
        "pending",
        "approved",
        "applied",
        "rejected",
        "cancelled",
      ],
      license_type: ["admin", "project_manager", "contributor", "guest_viewer"],
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
      permission_action: [
        "project.create",
        "project.read",
        "project.update",
        "project.delete",
        "subproject.create",
        "subproject.read",
        "subproject.update",
        "subproject.delete",
        "permit.create",
        "permit.read",
        "permit.update",
        "permit.delete",
        "document.upload",
        "document.download",
        "document.delete",
        "document.read",
        "comment.create",
        "comment.read",
        "comment.update",
        "comment.delete",
        "comment.resolve",
        "team.invite",
        "team.remove",
        "team.update_role",
        "admin.access",
        "admin.manage_users",
        "admin.manage_settings",
        "admin.view_audit",
        "analytics.view",
        "analytics.export",
        "password.reset_others",
      ],
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

