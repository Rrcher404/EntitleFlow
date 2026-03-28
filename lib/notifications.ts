import { getSupabaseAdminClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';

type NotificationType = Database['public']['Enums']['notification_type'];

export interface CreateNotificationParams {
  recipientId: string;
  organizationId: string;
  type: NotificationType;
  title: string;
  body?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a notification for a user
 * Server-side helper for creating notifications in the database
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<void> {
  const adminClient = getSupabaseAdminClient();

  if (!adminClient) {
    console.error('Admin Supabase client not available');
    return;
  }

  try {
    await adminClient.from('notifications').insert({
      recipient_id: params.recipientId,
      organization_id: params.organizationId,
      type: params.type as NotificationType,
      title: params.title,
      body: params.body || null,
      action_url: params.actionUrl || null,
      metadata: params.metadata as Record<string, unknown> | null || null,
      is_read: false,
      created_at: new Date().toISOString(),
    } as Database['public']['Tables']['notifications']['Insert']);
  } catch (error) {
    console.error('Failed to create notification:', error);
    // Don't throw - notification failures should not break the main operation
  }
}

/**
 * Create a notification for multiple users (bulk)
 */
export async function createBulkNotifications(
  params: Omit<CreateNotificationParams, 'recipientId'> & { recipientIds: string[] }
): Promise<void> {
  const adminClient = getSupabaseAdminClient();

  if (!adminClient) {
    console.error('Admin Supabase client not available');
    return;
  }

  try {
    const notifications = params.recipientIds.map((recipientId) => ({
      recipient_id: recipientId,
      organization_id: params.organizationId,
      type: params.type as NotificationType,
      title: params.title,
      body: params.body || null,
      action_url: params.actionUrl || null,
      metadata: params.metadata as Record<string, unknown> | null || null,
      is_read: false,
      created_at: new Date().toISOString(),
    } as Database['public']['Tables']['notifications']['Insert']));

    await adminClient.from('notifications').insert(notifications);
  } catch (error) {
    console.error('Failed to create bulk notifications:', error);
  }
}

/**
 * Create a notification for all team members in an organization
 */
export async function createOrganizationNotification(
  params: Omit<CreateNotificationParams, 'recipientId'> & { excludeUserId?: string }
): Promise<void> {
  const adminClient = getSupabaseAdminClient();

  if (!adminClient) {
    console.error('Admin Supabase client not available');
    return;
  }

  try {
    // Fetch all team members in the organization
    let query = adminClient
      .from('profiles')
      .select('id')
      .eq('organization_id', params.organizationId);

    if (params.excludeUserId) {
      query = query.neq('id', params.excludeUserId);
    }

    const { data: members, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    if (!members || members.length === 0) {
      return;
    }

    const notifications = members.map((member: { id: string }) => ({
      recipient_id: member.id,
      organization_id: params.organizationId,
      type: params.type as NotificationType,
      title: params.title,
      body: params.body || null,
      action_url: params.actionUrl || null,
      metadata: params.metadata as Record<string, unknown> | null || null,
      is_read: false,
      created_at: new Date().toISOString(),
    } as Database['public']['Tables']['notifications']['Insert']));

    await adminClient.from('notifications').insert(notifications);
  } catch (error) {
    console.error('Failed to create organization notification:', error);
  }
}

/**
 * Mark notifications as read
 */
export async function markNotificationsAsRead(
  notificationIds: string[]
): Promise<void> {
  const adminClient = getSupabaseAdminClient();

  if (!adminClient) {
    console.error('Admin Supabase client not available');
    return;
  }

  try {
    await adminClient
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .in('id', notificationIds);
  } catch (error) {
    console.error('Failed to mark notifications as read:', error);
  }
}

/**
 * Mark all notifications for a user as read
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<void> {
  const adminClient = getSupabaseAdminClient();

  if (!adminClient) {
    console.error('Admin Supabase client not available');
    return;
  }

  try {
    await adminClient
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('recipient_id', userId)
      .eq('is_read', false);
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const adminClient = getSupabaseAdminClient();

  if (!adminClient) {
    console.error('Admin Supabase client not available');
    return;
  }

  try {
    await adminClient
      .from('notifications')
      .delete()
      .eq('id', notificationId);
  } catch (error) {
    console.error('Failed to delete notification:', error);
  }
}

/**
 * Delete multiple notifications
 */
export async function deleteNotifications(
  notificationIds: string[]
): Promise<void> {
  const adminClient = getSupabaseAdminClient();

  if (!adminClient) {
    console.error('Admin Supabase client not available');
    return;
  }

  try {
    await adminClient
      .from('notifications')
      .delete()
      .in('id', notificationIds);
  } catch (error) {
    console.error('Failed to delete notifications:', error);
  }
}

/**
 * Delete old notifications (cleanup)
 */
export async function deleteOldNotifications(
  olderThanDays: number = 30
): Promise<void> {
  const adminClient = getSupabaseAdminClient();

  if (!adminClient) {
    console.error('Admin Supabase client not available');
    return;
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    await adminClient
      .from('notifications')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .eq('is_read', true);
  } catch (error) {
    console.error('Failed to delete old notifications:', error);
  }
}

/**
 * Create a comment-related notification
 */
export async function notifyCommentCreated(
  commentId: string,
  permitId: string,
  authorId: string,
  authorName: string,
  organizationId: string
): Promise<void> {
  try {
    const adminClient = getSupabaseAdminClient();

    if (!adminClient) return;

    // Get all organization members except the author
    const { data: members, error } = await adminClient
      .from('profiles')
      .select('id')
      .eq('organization_id', organizationId)
      .neq('id', authorId);

    if (error || !members) return;

    const notifications = members.map((member: { id: string }) => ({
      recipient_id: member.id,
      organization_id: organizationId,
      type: 'comment_assigned' as NotificationType,
      title: 'New comment',
      body: `${authorName} commented on a permit`,
      action_url: `/app/permits/${permitId}#comment-${commentId}`,
      metadata: { comment_id: commentId, permit_id: permitId, author_id: authorId },
      is_read: false,
      created_at: new Date().toISOString(),
    } as Database['public']['Tables']['notifications']['Insert']));

    await adminClient.from('notifications').insert(notifications);
  } catch (error) {
    console.error('Failed to notify comment created:', error);
  }
}

/**
 * Create a permit status change notification
 */
export async function notifyPermitStatusChanged(
  permitId: string,
  permitNumber: string,
  newStatus: string,
  organizationId: string,
  triggerUserId?: string
): Promise<void> {
  try {
    const adminClient = getSupabaseAdminClient();

    if (!adminClient) return;

    // Get all organization members except the trigger user
    let query = adminClient
      .from('profiles')
      .select('id')
      .eq('organization_id', organizationId);

    if (triggerUserId) {
      query = query.neq('id', triggerUserId);
    }

    const { data: members, error } = await query;

    if (error || !members) return;

    const notifications = members.map((member: { id: string }) => ({
      recipient_id: member.id,
      organization_id: organizationId,
      type: 'permit_status_changed' as NotificationType,
      title: 'Permit status updated',
      body: `Permit ${permitNumber} status changed to ${newStatus}`,
      action_url: `/app/permits/${permitId}`,
      metadata: { permit_id: permitId, new_status: newStatus },
      is_read: false,
      created_at: new Date().toISOString(),
    } as Database['public']['Tables']['notifications']['Insert']));

    await adminClient.from('notifications').insert(notifications);
  } catch (error) {
    console.error('Failed to notify permit status changed:', error);
  }
}

/**
 * Create a team member notification
 */
export async function notifyTeamMemberAdded(
  newMemberId: string,
  newMemberEmail: string,
  organizationId: string,
  invitedByName: string
): Promise<void> {
  try {
    await createNotification({
      recipientId: newMemberId,
      organizationId,
      type: 'team_invitation',
      title: 'Welcome to the team',
      body: `You've been invited to the organization by ${invitedByName}`,
      actionUrl: '/app/dashboard',
      metadata: { email: newMemberEmail },
    });
  } catch (error) {
    console.error('Failed to notify team member added:', error);
  }
}
