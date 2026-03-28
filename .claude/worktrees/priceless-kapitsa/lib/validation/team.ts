import { z } from 'zod';

/**
 * Team member role enum - matches database user_role enum
 */
const TEAM_ROLES = ['owner', 'admin', 'member', 'viewer'] as const;

/**
 * Schema for inviting a new team member
 */
export const inviteTeamMemberSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase(),
  role: z.enum(TEAM_ROLES),
});

export type InviteTeamMemberInput = z.infer<typeof inviteTeamMemberSchema>;

/**
 * Schema for updating a team member's role
 */
export const updateTeamMemberSchema = z.object({
  role: z.enum(TEAM_ROLES),
});

export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;

/**
 * Schema for removing a team member
 */
export const removeTeamMemberSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
});

export type RemoveTeamMemberInput = z.infer<typeof removeTeamMemberSchema>;

/**
 * Schema for revoking a team invitation
 */
export const revokeInvitationSchema = z.object({
  invitation_id: z.string().uuid('Invalid invitation ID'),
});

export type RevokeInvitationInput = z.infer<typeof revokeInvitationSchema>;

/**
 * Schema for accepting a team invitation
 */
export const acceptInvitationSchema = z.object({
  invitation_token: z.string().min(1, 'Invalid invitation token'),
});

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;

/**
 * Schema for bulk team role updates
 */
export const bulkUpdateTeamRolesSchema = z.object({
  updates: z.array(
    z.object({
      user_id: z.string().uuid('Invalid user ID'),
      role: z.enum(TEAM_ROLES),
    })
  )
    .min(1, 'At least one update is required')
    .max(100, 'Maximum 100 updates per request'),
});

export type BulkUpdateTeamRolesInput = z.infer<typeof bulkUpdateTeamRolesSchema>;

/**
 * Schema for bulk team member removal
 */
export const bulkRemoveTeamMembersSchema = z.object({
  user_ids: z.array(z.string().uuid('Invalid user ID'))
    .min(1, 'At least one user is required')
    .max(100, 'Maximum 100 users per request'),
});

export type BulkRemoveTeamMembersInput = z.infer<typeof bulkRemoveTeamMembersSchema>;

/**
 * Schema for team member search/filter
 */
export const teamMemberFilterSchema = z.object({
  search: z.string().max(500).optional(),
  role: z.array(z.enum(TEAM_ROLES)).optional(),
  status: z.enum(['active', 'invited', 'inactive']).optional(),
  sort_by: z.enum(['name', 'email', 'role', 'joined_at']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  limit: z.number().min(1).max(500).optional(),
  offset: z.number().min(0).optional(),
});

export type TeamMemberFilterInput = z.infer<typeof teamMemberFilterSchema>;

/**
 * Schema for resending team invitation
 */
export const resendInvitationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ResendInvitationInput = z.infer<typeof resendInvitationSchema>;

/**
 * Schema for team transfer of ownership
 */
export const transferOwnershipSchema = z.object({
  new_owner_id: z.string().uuid('Invalid user ID'),
  reason: z.string().max(1000).optional(),
});

export type TransferOwnershipInput = z.infer<typeof transferOwnershipSchema>;

/**
 * Schema for updating team member profile information
 */
export const updateTeamMemberProfileSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  avatar_url: z.string().url().optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
});

export type UpdateTeamMemberProfileInput = z.infer<typeof updateTeamMemberProfileSchema>;
