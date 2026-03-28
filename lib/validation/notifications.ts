import { z } from 'zod';

/**
 * Notification type enum - system-wide notification categories
 */
const NOTIFICATION_TYPES = [
  'comment_created',
  'comment_resolved',
  'comment_assigned',
  'permit_status_changed',
  'deadline_approaching',
  'deadline_overdue',
  'document_uploaded',
  'team_member_added',
  'team_member_removed',
  'project_created',
  'project_updated',
  'team_invitation',
  'system_alert',
  'feature_update',
] as const;

/**
 * Digest frequency enum
 */
const DIGEST_FREQUENCIES = ['immediate', 'daily', 'weekly', 'never'] as const;

/**
 * Schema for updating notification preferences for a single notification type
 */
export const updateNotificationPreferencesSchema = z.object({
  notification_type: z.enum(NOTIFICATION_TYPES),
  in_app: z.boolean().optional(),
  email: z.boolean().optional(),
  email_digest: z.enum(DIGEST_FREQUENCIES).optional(),
});

export type UpdateNotificationPreferencesInput = z.infer<typeof updateNotificationPreferencesSchema>;

/**
 * Schema for updating all notification preferences at once
 */
export const updateAllNotificationPreferencesSchema = z.object({
  preferences: z.array(
    z.object({
      notification_type: z.enum(NOTIFICATION_TYPES),
      in_app: z.boolean(),
      email: z.boolean(),
      email_digest: z.enum(DIGEST_FREQUENCIES),
    })
  ),
  do_not_disturb: z.object({
    enabled: z.boolean(),
    start_time: z.string().time().optional(),
    end_time: z.string().time().optional(),
    timezone: z.string().optional(),
  }).optional(),
});

export type UpdateAllNotificationPreferencesInput = z.infer<typeof updateAllNotificationPreferencesSchema>;

/**
 * Schema for marking notification as read
 */
export const markNotificationAsReadSchema = z.object({
  notification_id: z.string().uuid('Invalid notification ID'),
});

export type MarkNotificationAsReadInput = z.infer<typeof markNotificationAsReadSchema>;

/**
 * Schema for marking multiple notifications as read
 */
export const markMultipleNotificationsAsReadSchema = z.object({
  notification_ids: z.array(z.string().uuid('Invalid notification ID'))
    .min(1, 'At least one notification ID is required')
    .max(1000, 'Maximum 1000 notifications per request'),
});

export type MarkMultipleNotificationsAsReadInput = z.infer<typeof markMultipleNotificationsAsReadSchema>;

/**
 * Schema for deleting a notification
 */
export const deleteNotificationSchema = z.object({
  notification_id: z.string().uuid('Invalid notification ID'),
});

export type DeleteNotificationInput = z.infer<typeof deleteNotificationSchema>;

/**
 * Schema for deleting multiple notifications
 */
export const deleteMultipleNotificationsSchema = z.object({
  notification_ids: z.array(z.string().uuid('Invalid notification ID'))
    .min(1, 'At least one notification ID is required')
    .max(1000, 'Maximum 1000 notifications per request'),
});

export type DeleteMultipleNotificationsInput = z.infer<typeof deleteMultipleNotificationsSchema>;

/**
 * Schema for notification filtering and pagination
 */
export const notificationFilterSchema = z.object({
  types: z.array(z.enum(NOTIFICATION_TYPES)).optional(),
  is_read: z.boolean().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  search: z.string().max(500).optional(),
  sort_by: z.enum(['created_at', 'updated_at']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  limit: z.number().min(1).max(500).optional(),
  offset: z.number().min(0).optional(),
});

export type NotificationFilterInput = z.infer<typeof notificationFilterSchema>;

/**
 * Schema for dismissing all notifications of a type
 */
export const dismissNotificationTypeSchema = z.object({
  notification_type: z.enum(NOTIFICATION_TYPES),
  before: z.string().datetime().optional(),
});

export type DismissNotificationTypeInput = z.infer<typeof dismissNotificationTypeSchema>;

/**
 * Schema for setting do-not-disturb mode
 */
export const setDoNotDisturbSchema = z.object({
  enabled: z.boolean(),
  start_time: z.string().time().optional(),
  end_time: z.string().time().optional(),
  timezone: z.string().optional(),
});

export type SetDoNotDisturbInput = z.infer<typeof setDoNotDisturbSchema>;

/**
 * Schema for bulk update notification preferences by multiple users
 * (admin/organization level)
 */
export const bulkUpdateNotificationPreferencesSchema = z.object({
  user_ids: z.array(z.string().uuid('Invalid user ID'))
    .min(1, 'At least one user is required')
    .max(100, 'Maximum 100 users per request'),
  preferences: z.object({
    notification_type: z.enum(NOTIFICATION_TYPES),
    in_app: z.boolean().optional(),
    email: z.boolean().optional(),
    email_digest: z.enum(DIGEST_FREQUENCIES).optional(),
  }),
});

export type BulkUpdateNotificationPreferencesInput = z.infer<typeof bulkUpdateNotificationPreferencesSchema>;

/**
 * Response schema for notification preferences
 */
export const notificationPreferencesResponseSchema = z.object({
  notification_type: z.enum(NOTIFICATION_TYPES),
  in_app: z.boolean(),
  email: z.boolean(),
  email_digest: z.enum(DIGEST_FREQUENCIES),
});

export type NotificationPreferencesResponse = z.infer<typeof notificationPreferencesResponseSchema>;

/**
 * Response schema for notification list
 */
export const notificationResponseSchema = z.object({
  id: z.string().uuid(),
  recipient_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  type: z.enum(NOTIFICATION_TYPES),
  title: z.string(),
  body: z.string().optional(),
  action_url: z.string().url().optional(),
  is_read: z.boolean(),
  created_at: z.string().datetime(),
  read_at: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type NotificationResponse = z.infer<typeof notificationResponseSchema>;
