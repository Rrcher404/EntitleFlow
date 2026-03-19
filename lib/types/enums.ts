/**
 * Enum types and display mappings for PermitPilot
 * 
 * Defines all enumerated types used throughout the application with
 * corresponding label mappings and color schemes for UI rendering.
 */

// ============================================================================
// ENUM TYPE DEFINITIONS
// ============================================================================

export type ProjectStatus = 'draft' | 'active' | 'on_hold' | 'completed' | 'archived';

export type ProjectType = 
  | 'residential' 
  | 'commercial' 
  | 'mixed_use' 
  | 'industrial' 
  | 'institutional' 
  | 'infrastructure';

export type PermitStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'revision_requested' 
  | 'resubmitted' 
  | 'approved' 
  | 'approved_with_conditions' 
  | 'denied' 
  | 'withdrawn' 
  | 'expired';

export type PermitType = 
  | 'site_plan_review' 
  | 'building_permit' 
  | 'zoning_variance' 
  | 'stormwater_review' 
  | 'grading_permit' 
  | 'demolition_permit' 
  | 'sign_permit' 
  | 'special_use_permit' 
  | 'subdivision_review' 
  | 'other';

export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';

export type CommentSource = 'internal' | 'jurisdiction' | 'imported';

export type CommentCategory = 
  | 'parking_access' 
  | 'stormwater' 
  | 'building_code' 
  | 'zoning' 
  | 'fire_safety' 
  | 'landscaping' 
  | 'traffic' 
  | 'environmental' 
  | 'general' 
  | 'other';

export type DocumentType = 
  | 'site_plan' 
  | 'architectural_drawing' 
  | 'civil_drawing' 
  | 'survey' 
  | 'environmental_report' 
  | 'traffic_study' 
  | 'stormwater_plan' 
  | 'photo' 
  | 'correspondence' 
  | 'approval_letter' 
  | 'rejection_letter' 
  | 'other';

export type ActivityAction = 
  | 'project_created' 
  | 'permit_submitted' 
  | 'comment_added' 
  | 'status_changed' 
  | 'document_uploaded' 
  | 'reviewer_assigned' 
  | 'deadline_set' 
  | 'permit_approved' 
  | 'permit_denied' 
  | 'resubmittal_required';

export type DeadlineStatus = 'upcoming' | 'due_soon' | 'overdue' | 'completed' | 'cancelled';

// ============================================================================
// DISPLAY LABEL MAPPINGS
// ============================================================================

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  archived: 'Archived',
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  residential: 'Residential',
  commercial: 'Commercial',
  mixed_use: 'Mixed Use',
  industrial: 'Industrial',
  institutional: 'Institutional',
  infrastructure: 'Infrastructure',
};

export const PERMIT_STATUS_LABELS: Record<PermitStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  revision_requested: 'Revision Requested',
  resubmitted: 'Resubmitted',
  approved: 'Approved',
  approved_with_conditions: 'Approved with Conditions',
  denied: 'Denied',
  withdrawn: 'Withdrawn',
  expired: 'Expired',
};

export const PERMIT_TYPE_LABELS: Record<PermitType, string> = {
  site_plan_review: 'Site Plan Review',
  building_permit: 'Building Permit',
  zoning_variance: 'Zoning Variance',
  stormwater_review: 'Stormwater Review',
  grading_permit: 'Grading Permit',
  demolition_permit: 'Demolition Permit',
  sign_permit: 'Sign Permit',
  special_use_permit: 'Special Use Permit',
  subdivision_review: 'Subdivision Review',
  other: 'Other',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

export const ORG_ROLE_LABELS: Record<OrgRole, string> = {
  owner: 'Owner',
  admin: 'Administrator',
  member: 'Team Member',
  viewer: 'Viewer',
};

export const COMMENT_SOURCE_LABELS: Record<CommentSource, string> = {
  internal: 'Internal',
  jurisdiction: 'Jurisdiction',
  imported: 'Imported',
};

export const COMMENT_CATEGORY_LABELS: Record<CommentCategory, string> = {
  parking_access: 'Parking & Access',
  stormwater: 'Stormwater',
  building_code: 'Building Code',
  zoning: 'Zoning',
  fire_safety: 'Fire Safety',
  landscaping: 'Landscaping',
  traffic: 'Traffic',
  environmental: 'Environmental',
  general: 'General',
  other: 'Other',
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  site_plan: 'Site Plan',
  architectural_drawing: 'Architectural Drawing',
  civil_drawing: 'Civil Drawing',
  survey: 'Survey',
  environmental_report: 'Environmental Report',
  traffic_study: 'Traffic Study',
  stormwater_plan: 'Stormwater Plan',
  photo: 'Photo',
  correspondence: 'Correspondence',
  approval_letter: 'Approval Letter',
  rejection_letter: 'Rejection Letter',
  other: 'Other',
};

export const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  project_created: 'Project Created',
  permit_submitted: 'Permit Submitted',
  comment_added: 'Comment Added',
  status_changed: 'Status Changed',
  document_uploaded: 'Document Uploaded',
  reviewer_assigned: 'Reviewer Assigned',
  deadline_set: 'Deadline Set',
  permit_approved: 'Permit Approved',
  permit_denied: 'Permit Denied',
  resubmittal_required: 'Resubmittal Required',
};

export const DEADLINE_STATUS_LABELS: Record<DeadlineStatus, string> = {
  upcoming: 'Upcoming',
  due_soon: 'Due Soon',
  overdue: 'Overdue',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// ============================================================================
// STATUS COLOR MAPPINGS FOR UI RENDERING
// ============================================================================

export const PERMIT_STATUS_COLORS: Record<PermitStatus, { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-800' },
  submitted: { bg: 'bg-purple-100', text: 'text-purple-800' },
  under_review: { bg: 'bg-blue-100', text: 'text-blue-800' },
  revision_requested: { bg: 'bg-amber-100', text: 'text-amber-800' },
  resubmitted: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  approved: { bg: 'bg-green-100', text: 'text-green-800' },
  approved_with_conditions: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  denied: { bg: 'bg-red-100', text: 'text-red-800' },
  withdrawn: { bg: 'bg-gray-100', text: 'text-gray-600' },
  expired: { bg: 'bg-orange-100', text: 'text-orange-800' },
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, { bg: string; text: string }> = {
  draft: { bg: 'bg-slate-100', text: 'text-slate-800' },
  active: { bg: 'bg-blue-100', text: 'text-blue-800' },
  on_hold: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  completed: { bg: 'bg-green-100', text: 'text-green-800' },
  archived: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

export const PRIORITY_COLORS: Record<Priority, { bg: string; text: string }> = {
  low: { bg: 'bg-green-100', text: 'text-green-800' },
  normal: { bg: 'bg-blue-100', text: 'text-blue-800' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800' },
  urgent: { bg: 'bg-red-100', text: 'text-red-800' },
};

export const DEADLINE_STATUS_COLORS: Record<DeadlineStatus, { bg: string; text: string }> = {
  upcoming: { bg: 'bg-blue-100', text: 'text-blue-800' },
  due_soon: { bg: 'bg-amber-100', text: 'text-amber-800' },
  overdue: { bg: 'bg-red-100', text: 'text-red-800' },
  completed: { bg: 'bg-green-100', text: 'text-green-800' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

export const ORG_ROLE_COLORS: Record<OrgRole, { bg: string; text: string }> = {
  owner: { bg: 'bg-purple-100', text: 'text-purple-800' },
  admin: { bg: 'bg-blue-100', text: 'text-blue-800' },
  member: { bg: 'bg-green-100', text: 'text-green-800' },
  viewer: { bg: 'bg-gray-100', text: 'text-gray-700' },
};
