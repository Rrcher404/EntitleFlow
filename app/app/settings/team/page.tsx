'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ORG_ROLE_LABELS, ORG_ROLE_COLORS } from '@/lib/types/enums';
import type { Database } from '@/lib/database.types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, ChevronDown, X } from 'lucide-react';

type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';
type Profile = Database['public']['Tables']['profiles']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];

interface TeamMember extends Profile {
  role: OrgRole;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: OrgRole;
  invited_at: string;
  organization_id: string;
}

interface InviteFormData {
  email: string;
  role: OrgRole;
}

const getInitials = (fullName: string | null) => {
  if (!fullName) return '?';
  return fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getRoleInitial = (role: OrgRole) => {
  const initials: Record<OrgRole, string> = {
    owner: 'O',
    admin: 'A',
    member: 'M',
    viewer: 'V',
  };
  return initials[role];
};

export default function TeamSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteFormData>({ email: '', role: 'member' });
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabase = createClient();

  const loadTeamData = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Could not fetch user');

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      if (!profileData?.organization_id) {
        setLoading(false);
        return;
      }

      // Fetch organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profileData.organization_id)
        .single();

      if (!orgError && orgData) {
        setOrganization(orgData);
      }

      // Fetch team members
      const { data: membersData, error: membersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', profileData.organization_id);

      if (membersError) throw membersError;
      setTeamMembers(
        (membersData || []).map(member => ({
          ...member,
          role: ((member as any).role || 'member') as OrgRole,
        }))
      );

      // Fetch pending invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('organization_id', profileData.organization_id)
        .is('accepted_at', null);

      if (!invitationsError && invitationsData) {
        setPendingInvitations(
          invitationsData.map((inv: any) => ({
            ...inv,
            role: inv.role as OrgRole,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading team data:', error);
      setMessage({ type: 'error', text: 'Failed to load team data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [supabase]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !organization || !inviteForm.email.trim()) return;

    setInviteLoading(true);
    setInviteError(null);

    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteForm.email,
          role: inviteForm.role,
          organization_id: organization.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send invite');
      }

      setMessage({ type: 'success', text: 'Invitation sent successfully' });
      setInviteForm({ email: '', role: 'member' });
      setShowInviteForm(false);
      await loadTeamData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send invite';
      setInviteError(message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!supabase) return;

    try {
      const response = await fetch(`/api/team/invitations/${invitationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to revoke invitation');
      }

      setMessage({ type: 'success', text: 'Invitation revoked' });
      await loadTeamData();
    } catch (error) {
      console.error('Error revoking invitation:', error);
      setMessage({ type: 'error', text: 'Failed to revoke invitation' });
    }
  };

  const handleChangeRole = async (memberId: string, newRole: OrgRole) => {
    if (!supabase || !organization) return;

    try {
      const response = await fetch(`/api/team/members/${memberId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to change role');
      }

      setMessage({ type: 'success', text: 'Role updated successfully' });
      await loadTeamData();
    } catch (error) {
      console.error('Error changing role:', error);
      setMessage({ type: 'error', text: 'Failed to change role' });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!supabase) return;

    const ownerCount = teamMembers.filter(m => m.role === 'owner').length;
    const memberToRemove = teamMembers.find(m => m.id === memberId);
    
    if (ownerCount === 1 && memberToRemove?.role === 'owner') {
      setMessage({
        type: 'error',
        text: 'Cannot remove the last owner. Assign another owner first.',
      });
      return;
    }

    try {
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove member');
      }

      setMessage({ type: 'success', text: 'Member removed successfully' });
      await loadTeamData();
    } catch (error) {
      console.error('Error removing member:', error);
      setMessage({ type: 'error', text: 'Failed to remove member' });
    }
  };

  const canManageTeam =
    profile &&
    (((profile as any).role === 'owner' || (profile as any).role === 'admin'));

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card className="p-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="py-4 border-b last:border-b-0">
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-sm text-gray-600">
            Manage your team members and invitations.
          </p>
        </div>
        {canManageTeam && (
          <div className="relative">
            <button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                'bg-[#1B3B2D] text-white hover:bg-[#153229]'
              )}
            >
              Invite <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      {message && (
        <div
          className={cn(
            'rounded-lg p-4 text-sm',
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          )}
        >
          {message.text}
        </div>
      )}

      {/* Invite Form */}
      {showInviteForm && canManageTeam && (
        <Card className="border-[#E8E0D0] bg-[#FDFBF7] p-6">
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={inviteForm.email}
                onChange={e =>
                  setInviteForm(prev => ({ ...prev, email: e.target.value }))
                }
                placeholder="person@example.com"
                className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3B2D]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Role
              </label>
              <select
                value={inviteForm.role}
                onChange={e =>
                  setInviteForm(prev => ({
                    ...prev,
                    role: e.target.value as OrgRole,
                  }))
                }
                className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3B2D]"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            {inviteError && (
              <div className="text-sm text-red-600">{inviteError}</div>
            )}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={inviteLoading}
                className="bg-[#1B3B2D] text-white hover:bg-[#153229]"
              >
                {inviteLoading ? 'Sending...' : 'Send Invite'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowInviteForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Team Members Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Team Members ({teamMembers.length})
        </h2>
        <Card className="border-[#E8E0D0] bg-[#FDFBF7] overflow-hidden">
          <div className="divide-y divide-[#E8E0D0]">
            {teamMembers.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                No team members yet.
              </div>
            ) : (
              teamMembers.map(member => {
                const roleColor = ORG_ROLE_COLORS[member.role];
                return (
                  <div
                    key={member.id}
                    className="p-4 flex items-center justify-between hover:bg-white/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* Avatar */}
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium text-white',
                          'bg-gradient-to-br from-[#1B3B2D] to-[#0F1E1A]'
                        )}
                      >
                        {getInitials(member.full_name)}
                      </div>
                      {/* Member Info */}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {member.full_name || 'Unnamed'}
                        </p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                      {/* Role Badge */}
                      <span
                        className={cn(
                          'text-xs font-medium px-3 py-1 rounded-full',
                          roleColor.bg,
                          roleColor.text
                        )}
                      >
                        {ORG_ROLE_LABELS[member.role]}
                      </span>
                    </div>

                    {/* Actions */}
                    {canManageTeam && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-white rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {/* Change Role Submenu */}
                          <div className="px-2 py-1.5">
                            <p className="text-xs font-medium text-gray-500 mb-2">
                              Change Role
                            </p>
                            {(['owner', 'admin', 'member', 'viewer'] as OrgRole[]).map(
                              role => (
                                <DropdownMenuItem
                                  key={role}
                                  onClick={() => handleChangeRole(member.id, role)}
                                  className="text-sm cursor-pointer"
                                >
                                  {ORG_ROLE_LABELS[role]}
                                  {member.role === role && (
                                    <span className="ml-auto text-[#1B3B2D]">✓</span>
                                  )}
                                </DropdownMenuItem>
                              )
                            )}
                          </div>

                          {/* Divider */}
                          <div className="my-1 border-t border-[#E8E0D0]" />

                          {/* Remove Option */}
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-sm text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700"
                          >
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Pending Invitations Section */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Pending Invitations ({pendingInvitations.length})
          </h2>
          <Card className="border-[#E8E0D0] bg-[#FDFBF7] overflow-hidden">
            <div className="divide-y divide-[#E8E0D0]">
              {pendingInvitations.map(invitation => {
                const roleColor = ORG_ROLE_COLORS[invitation.role];
                const invitedDate = new Date(invitation.invited_at).toLocaleDateString(
                  'en-US',
                  { month: 'short', day: 'numeric' }
                );

                return (
                  <div
                    key={invitation.id}
                    className="p-4 flex items-center justify-between hover:bg-white/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* Email */}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {invitation.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          Invited {invitedDate}
                        </p>
                      </div>
                      {/* Role Badge */}
                      <span
                        className={cn(
                          'text-xs font-medium px-3 py-1 rounded-full',
                          roleColor.bg,
                          roleColor.text
                        )}
                      >
                        {ORG_ROLE_LABELS[invitation.role]}
                      </span>
                    </div>

                    {/* Revoke Button */}
                    {canManageTeam && (
                      <button
                        onClick={() => handleRevokeInvitation(invitation.id)}
                        className="ml-4 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
