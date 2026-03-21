'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    jobTitle: '',
    newPassword: '',
    confirmPassword: '',
  });

  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      if (!supabase) {
        setMessage({ type: 'error', text: 'Supabase client not initialized' });
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
        if (profileData) {
          setProfile(profileData);
          setFormData(prev => ({
            ...prev,
            fullName: profileData.full_name || '',
            phone: profileData.phone || '',
            jobTitle: profileData.job_title || '',
          }));

          // Fetch organization (non-blocking — don't fail the whole page if org is missing)
          const { data: orgData } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', profileData.organization_id)
            .single();

          if (orgData) setOrganization(orgData);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setMessage({ type: 'error', text: 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !profile) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          job_title: formData.jobTitle,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: 'Failed to update password' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your account and application preferences.</p>
        </div>
        <div className="animate-pulse">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and application preferences.</p>
      </div>

      {message && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            message.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Profile Information</h2>
            <p className="text-sm text-muted-foreground">Update your personal details.</p>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                placeholder="Your job title"
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full"
              style={{ backgroundColor: '#1B3B2D', color: '#FDFBF7' }}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </div>
      </Card>

      {/* Organization Section */}
      <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Organization</h2>
            <p className="text-sm text-muted-foreground">Your organization information.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              value={organization?.name || ''}
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-muted-foreground">Organization name is read-only</p>
          </div>
        </div>
      </Card>

      {/* Change Password Section */}
      <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Change Password</h2>
            <p className="text-sm text-muted-foreground">Update your account password.</p>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full"
              style={{ backgroundColor: '#1B3B2D', color: '#FDFBF7' }}
            >
              {saving ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
