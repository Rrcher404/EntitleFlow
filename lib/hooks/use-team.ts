'use client';

import { useState, useCallback, useEffect } from 'react';

interface TeamMember {
  id: string;
  email: string;
  full_name?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'inactive';
  joined_at?: string;
  avatar_url?: string;
}

interface TeamInvitation {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'pending' | 'accepted' | 'expired';
  created_at?: string;
  expires_at?: string;
}

interface UseTeamOptions {
  onSuccess?: (action: string) => void;
  onError?: (error: Error) => void;
}

interface TeamState {
  members: TeamMember[];
  invitations: TeamInvitation[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook for managing team members and invitations
 */
export function useTeam(
  organizationId: string,
  options: UseTeamOptions = {}
) {
  const { onSuccess, onError } = options;

  const [state, setState] = useState<TeamState>({
    members: [],
    invitations: [],
    loading: false,
    error: null,
  });

  /**
   * Fetch team members and invitations
   */
  const fetchTeamData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const [membersRes, invitationsRes] = await Promise.all([
        fetch(`/api/organizations/${organizationId}/members`),
        fetch(`/api/organizations/${organizationId}/invitations`),
      ]);

      if (!membersRes.ok) {
        throw new Error(
          `Failed to fetch team members: ${membersRes.statusText}`
        );
      }

      if (!invitationsRes.ok) {
        throw new Error(
          `Failed to fetch invitations: ${invitationsRes.statusText}`
        );
      }

      const { data: members } = await membersRes.json();
      const { data: invitations } = await invitationsRes.json();

      setState((prev) => ({
        ...prev,
        members: members || [],
        invitations: invitations || [],
        loading: false,
        error: null,
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message,
      }));

      onError?.(err);
    }
  }, [organizationId, onError]);

  /**
   * Fetch team data on mount
   */
  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  /**
   * Invite a team member
   */
  const inviteMember = useCallback(
    async (email: string, role: 'owner' | 'admin' | 'member' | 'viewer') => {
      try {
        const response = await fetch(
          `/api/organizations/${organizationId}/invite`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, role }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to invite member: ${response.statusText}`);
        }

        const { data } = await response.json();

        setState((prev) => ({
          ...prev,
          invitations: [...prev.invitations, data],
        }));

        onSuccess?.('invite');
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
        throw err;
      }
    },
    [organizationId, onSuccess, onError]
  );

  /**
   * Remove a team member
   */
  const removeMember = useCallback(
    async (userId: string) => {
      try {
        const response = await fetch(
          `/api/organizations/${organizationId}/members/${userId}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to remove member: ${response.statusText}`);
        }

        setState((prev) => ({
          ...prev,
          members: prev.members.filter((m) => m.id !== userId),
        }));

        onSuccess?.('remove');
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
        throw err;
      }
    },
    [organizationId, onSuccess, onError]
  );

  /**
   * Update team member role
   */
  const updateRole = useCallback(
    async (userId: string, role: 'owner' | 'admin' | 'member' | 'viewer') => {
      try {
        const response = await fetch(
          `/api/organizations/${organizationId}/members/${userId}/role`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to update role: ${response.statusText}`);
        }

        const { data } = await response.json();

        setState((prev) => ({
          ...prev,
          members: prev.members.map((m) => (m.id === userId ? data : m)),
        }));

        onSuccess?.('updateRole');
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
        throw err;
      }
    },
    [organizationId, onSuccess, onError]
  );

  /**
   * Revoke a team invitation
   */
  const revokeInvitation = useCallback(
    async (invitationId: string) => {
      try {
        const response = await fetch(
          `/api/organizations/${organizationId}/invitations/${invitationId}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to revoke invitation: ${response.statusText}`
          );
        }

        setState((prev) => ({
          ...prev,
          invitations: prev.invitations.filter((i) => i.id !== invitationId),
        }));

        onSuccess?.('revokeInvitation');
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
        throw err;
      }
    },
    [organizationId, onSuccess, onError]
  );

  /**
   * Resend an invitation
   */
  const resendInvitation = useCallback(
    async (email: string) => {
      try {
        const response = await fetch(
          `/api/organizations/${organizationId}/resend-invitation`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to resend invitation: ${response.statusText}`
          );
        }

        const { data } = await response.json();

        setState((prev) => ({
          ...prev,
          invitations: prev.invitations.map((i) =>
            i.email === email ? data : i
          ),
        }));

        onSuccess?.('resendInvitation');
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
        throw err;
      }
    },
    [organizationId, onSuccess, onError]
  );

  /**
   * Update team member profile
   */
  const updateMemberProfile = useCallback(
    async (
      userId: string,
      updates: {
        full_name?: string;
        avatar_url?: string | null;
        bio?: string | null;
      }
    ) => {
      try {
        const response = await fetch(
          `/api/organizations/${organizationId}/members/${userId}/profile`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to update profile: ${response.statusText}`);
        }

        const { data } = await response.json();

        setState((prev) => ({
          ...prev,
          members: prev.members.map((m) => (m.id === userId ? data : m)),
        }));

        onSuccess?.('updateProfile');
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
        throw err;
      }
    },
    [organizationId, onSuccess, onError]
  );

  /**
   * Manually refresh team data
   */
  const refresh = useCallback(() => {
    return fetchTeamData();
  }, [fetchTeamData]);

  /**
   * Search/filter team members
   */
  const searchMembers = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return state.members.filter(
        (m) =>
          m.email.toLowerCase().includes(lowerQuery) ||
          m.full_name?.toLowerCase().includes(lowerQuery)
      );
    },
    [state.members]
  );

  /**
   * Get members by role
   */
  const getMembersByRole = useCallback(
    (role: string) => {
      return state.members.filter((m) => m.role === role);
    },
    [state.members]
  );

  /**
   * Check if current user can perform action on another member
   */
  const canManageMember = useCallback(
    (currentUserRole: string, targetMemberRole: string) => {
      const roleHierarchy: Record<string, number> = {
        owner: 3,
        admin: 2,
        member: 1,
        viewer: 0,
      };

      const currentLevel = roleHierarchy[currentUserRole] || 0;
      const targetLevel = roleHierarchy[targetMemberRole] || 0;

      return currentLevel > targetLevel;
    },
    []
  );

  return {
    members: state.members,
    invitations: state.invitations,
    loading: state.loading,
    error: state.error,
    inviteMember,
    removeMember,
    updateRole,
    revokeInvitation,
    resendInvitation,
    updateMemberProfile,
    refresh,
    searchMembers,
    getMembersByRole,
    canManageMember,
  };
}
