import type { SupabaseClient } from '@supabase/supabase-js';

// Seat limits per subscription tier
const SEAT_LIMITS: Record<string, number> = {
  starter: 5,
  growth: 15,
  enterprise: -1, // -1 represents unlimited
};

interface SeatCheckResult {
  allowed: boolean;
  current: number;
  max: number;
  pending: number;
}

/**
 * Check if an organization has available seats for adding a new team member.
 * Counts current active team members and pending invitations.
 * 
 * @param supabase - Supabase client instance
 * @param organizationId - The organization ID to check
 * @returns SeatCheckResult with allowed status and seat counts
 */
export async function checkSeatAvailability(
  supabase: SupabaseClient,
  organizationId: string
): Promise<SeatCheckResult> {
  // Fetch organization max_users and subscription_tier
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('max_users, subscription_tier')
    .eq('id', organizationId)
    .single();

  if (orgError || !org) {
    throw new Error(`Organization not found: ${organizationId}`);
  }

  // Get subscription tier and determine max seats (fallback to max_users if available)
  const tierLimit = SEAT_LIMITS[org.subscription_tier?.toLowerCase() || 'starter'] ?? 5;
  const maxSeats = tierLimit === -1 ? Infinity : tierLimit;

  // Count current active team members
  const { count: memberCount, error: memberError } = await supabase
    .from('team_members')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId);

  if (memberError) {
    throw new Error(`Failed to count team members: ${memberError.message}`);
  }

  const currentMembers = memberCount || 0;

  // Count pending invitations
  const { count: pendingCount, error: pendingError } = await supabase
    .from('team_invitations')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('status', 'pending');

  if (pendingError) {
    throw new Error(`Failed to count pending invitations: ${pendingError.message}`);
  }

  const pendingInvitations = pendingCount || 0;

  // Check if seats are available
  const totalCommitted = currentMembers + pendingInvitations;
  const allowed = maxSeats === Infinity || totalCommitted < maxSeats;

  return {
    allowed,
    current: currentMembers,
    max: maxSeats === Infinity ? -1 : maxSeats,
    pending: pendingInvitations,
  };
}
