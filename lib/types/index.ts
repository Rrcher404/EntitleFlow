/**
 * Main types index for PermitPilot
 * 
 * Re-exports all enum types and convenience aliases from database schema.
 * Provides both simple type aliases and enriched composite types for UI use.
 */

// ============================================================================
// RE-EXPORT ALL ENUMS AND MAPPINGS
// ============================================================================

export * from './enums';

// ============================================================================
// IMPORT DATABASE TYPES AND ENUMS FOR LOCAL USE
// ============================================================================

import type { Database } from '../database.types';
import type {
  OrgRole,
  ProjectStatus,
  PermitStatus,
  PermitType,
  Priority,
  CommentCategory,
} from './enums';

// ============================================================================
// TABLE ROW TYPE ALIASES
// ============================================================================

/** Organization account type */
export type Organization = Database['public']['Tables']['organizations']['Row'];

/** User profile/account type */
export type Profile = Database['public']['Tables']['profiles']['Row'];

/** Development project type */
export type Project = Database['public']['Tables']['projects']['Row'];

/** Permit application/status type */
export type Permit = Database['public']['Tables']['permits']['Row'];

/** Permit status history record */
export type PermitStatusHistory = Database['public']['Tables']['permit_status_history']['Row'];

/** Comment/feedback from any source */
export type Comment = Database['public']['Tables']['comments']['Row'];

/** Uploaded file or document */
export type Document = Database['public']['Tables']['documents']['Row'];

/** System activity log entry */
export type ActivityLogEntry = Database['public']['Tables']['activity_log']['Row'];

/** Deadline/milestone tracking */
export type Deadline = Database['public']['Tables']['deadlines']['Row'];

/** Permitting jurisdiction configuration */
export type Jurisdiction = Database['public']['Tables']['jurisdictions']['Row'];

/** Marketing lead capture */
export type MarketingLead = Database['public']['Tables']['marketing_leads']['Row'];

/** Team member (organization membership) */
export type TeamMember = Database['public']['Tables']['team_members']['Row'];

/** Team invitation */
export type TeamInvitation = Database['public']['Tables']['team_invitations']['Row'];

/** Comment assignment */
export type CommentAssignment = Database['public']['Tables']['comment_assignments']['Row'];

/** User notification */
export type Notification = Database['public']['Tables']['notifications']['Row'];

/** User notification preferences */
export type NotificationPreference = Database['public']['Tables']['notification_preferences']['Row'];

/** Document parse job */
export type ParseJob = Database['public']['Tables']['parse_jobs']['Row'];

/** Ingested email queue entry */
export type EmailQueueEntry = Database['public']['Tables']['email_queue']['Row'];

// ============================================================================
// TABLE INSERT TYPE ALIASES
// ============================================================================

/** Insert payload for organizations */
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert'];

/** Insert payload for profiles */
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

/** Insert payload for projects */
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

/** Insert payload for permits */
export type PermitInsert = Database['public']['Tables']['permits']['Insert'];

/** Insert payload for permit status history */
export type PermitStatusHistoryInsert = Database['public']['Tables']['permit_status_history']['Insert'];

/** Insert payload for comments */
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];

/** Insert payload for documents */
export type DocumentInsert = Database['public']['Tables']['documents']['Insert'];

/** Insert payload for activity log */
export type ActivityLogEntryInsert = Database['public']['Tables']['activity_log']['Insert'];

/** Insert payload for deadlines */
export type DeadlineInsert = Database['public']['Tables']['deadlines']['Insert'];

/** Insert payload for jurisdictions */
export type JurisdictionInsert = Database['public']['Tables']['jurisdictions']['Insert'];

/** Insert payload for marketing leads */
export type MarketingLeadInsert = Database['public']['Tables']['marketing_leads']['Insert'];

/** Insert payload for team members */
export type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert'];

/** Insert payload for team invitations */
export type TeamInvitationInsert = Database['public']['Tables']['team_invitations']['Insert'];

/** Insert payload for comment assignments */
export type CommentAssignmentInsert = Database['public']['Tables']['comment_assignments']['Insert'];

/** Insert payload for notifications */
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

/** Insert payload for parse jobs */
export type ParseJobInsert = Database['public']['Tables']['parse_jobs']['Insert'];

// ============================================================================
// TABLE UPDATE TYPE ALIASES
// ============================================================================

/** Update payload for organizations */
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update'];

/** Update payload for profiles */
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/** Update payload for projects */
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

/** Update payload for permits */
export type PermitUpdate = Database['public']['Tables']['permits']['Update'];

/** Update payload for permit status history */
export type PermitStatusHistoryUpdate = Database['public']['Tables']['permit_status_history']['Update'];

/** Update payload for comments */
export type CommentUpdate = Database['public']['Tables']['comments']['Update'];

/** Update payload for documents */
export type DocumentUpdate = Database['public']['Tables']['documents']['Update'];

/** Update payload for activity log */
export type ActivityLogEntryUpdate = Database['public']['Tables']['activity_log']['Update'];

/** Update payload for deadlines */
export type DeadlineUpdate = Database['public']['Tables']['deadlines']['Update'];

/** Update payload for jurisdictions */
export type JurisdictionUpdate = Database['public']['Tables']['jurisdictions']['Update'];

/** Update payload for marketing leads */
export type MarketingLeadUpdate = Database['public']['Tables']['marketing_leads']['Update'];


// ============================================================================
// ENRICHED/COMPOSITE TYPES FOR UI
// ============================================================================

/**
 * Project with associated permits and counts
 * Used for project detail views and dashboards
 */
export type ProjectWithPermits = Project & {
  permits: Permit[];
  permit_count: number;
  comment_count: number;
};

/**
 * Permit with associated comments and project context
 * Used for permit detail views
 */
export type PermitWithComments = Permit & {
  comments: Comment[];
  project_name?: string;
  comment_count: number;
};

/**
 * Enriched permit with full related data
 * Used for comprehensive permit views
 */
export type PermitEnriched = Permit & {
  comments: Comment[];
  documents: Document[];
  status_history: PermitStatusHistory[];
  project?: Project;
  deadlines?: Deadline[];
};

/**
 * Enriched project with all nested data
 * Used for full project detail/export views
 */
export type ProjectEnriched = Project & {
  permits: Permit[];
  comments: Comment[];
  documents: Document[];
  deadlines: Deadline[];
  activity: ActivityLogEntry[];
};

/**
 * Dashboard statistics snapshot
 * Used for organization dashboard and overview pages
 */
export type DashboardStats = {
  active_projects: number;
  pending_permits: number;
  open_comments: number;
  avg_review_days: number;
  overdue_deadlines: number;
  last_updated: string;
};

/**
 * User session context
 * Used for auth and profile management
 */
export type UserContext = {
  user_id: string;
  organization_id: string;
  role: OrgRole;
  profile: Profile;
  organization: Organization;
};

/**
 * Permit workflow state for UI tracking
 * Used for multi-step permit submission flows
 */
export type PermitDraftState = Partial<Permit> & {
  draft_id: string;
  current_step: number;
  completed_steps: number[];
  validation_errors: Record<string, string[]>;
};

/**
 * Comment thread with nested replies
 * Used for comment views and discussions
 */
export type CommentThread = Comment & {
  replies: Comment[];
  author: Profile;
  resolved_by_user?: Profile;
};

/**
 * Activity feed entry with related context
 * Used for activity timeline and notifications
 */
export type ActivityFeedEntry = ActivityLogEntry & {
  actor?: Profile;
  project?: Project;
  permit?: Permit;
};

/**
 * Pagination metadata
 * Used for paginated data fetching
 */
export type PaginationMeta = {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
};

/**
 * Paginated response wrapper
 * Used for API responses with pagination
 */
export type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationMeta;
};

/**
 * API response wrapper
 * Used for standardized API responses
 */
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

/**
 * Filter/search options for queries
 * Used for advanced filtering and search
 */
export type FilterOptions = {
  project_status?: ProjectStatus[];
  permit_status?: PermitStatus[];
  permit_type?: PermitType[];
  priority?: Priority[];
  jurisdiction?: string[];
  comment_category?: CommentCategory[];
  date_from?: string;
  date_to?: string;
  search_text?: string;
  assigned_to?: string[];
};

/**
 * Sort options for data ordering
 * Used for data sorting and ordering
 */
export type SortOptions = {
  field: string;
  direction: 'asc' | 'desc';
};
