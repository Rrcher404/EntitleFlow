'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserProfileCard } from '@/components/app/user-profile-card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ projects: 0, comments_resolved: 0, documents: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditable, setIsEditable] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!supabase) { setLoading(false); return; }
      try {
        setLoading(true);

        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          router.push('/login');
          return;
        }

        // Fetch profile data from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          const defaultProfile = {
            id: authUser.id,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email,
            avatar_url: authUser.user_metadata?.avatar_url || null,
            company_name: '',
            job_title: '',
            role: 'member' as const,
            bio: '',
            is_active: true,
          };
          setUser(defaultProfile);
        } else {
          const pd = profileData as any;
          setUser({
            id: authUser.id,
            full_name: pd?.full_name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email,
            avatar_url: pd?.avatar_url || null,
            company_name: pd?.company_name || '',
            job_title: pd?.job_title || '',
            role: pd?.role || 'member',
            bio: pd?.bio || '',
            is_active: pd?.is_active !== false,
          });
        }

        // Fetch projects count (graceful — won't crash if table shape differs)
        try {
          const { count: projectsCount } = await supabase
            .from('projects')
            .select('id', { count: 'exact', head: true });
          setStats((prev) => ({ ...prev, projects: projectsCount || 0 }));
        } catch { /* graceful */ }

        // Fetch documents count
        try {
          const { count: documentsCount } = await supabase
            .from('documents')
            .select('id', { count: 'exact', head: true });
          setStats((prev) => ({ ...prev, documents: documentsCount || 0 }));
        } catch { /* graceful */ }

        // Fetch comments resolved count
        try {
          const { data: commentsData } = await supabase
            .from('comments')
            .select('id')
            .eq('is_resolved', true);
          if (commentsData) {
            setStats((prev) => ({ ...prev, comments_resolved: commentsData.length }));
          }
        } catch { /* graceful */ }

        // Fetch recent activity
        try {
          const { data: activityData } = await supabase
            .from('activity_log')
            .select('*')
            .eq('actor_id', authUser.id)
            .order('created_at', { ascending: false })
            .limit(5);

          if (activityData) {
            setRecentActivity(
              activityData.map((activity: any) => ({
                id: activity.id,
                description: activity.description || activity.action,
                timestamp: activity.created_at,
                type: activity.action || 'permit',
              }))
            );
          }
        } catch { /* graceful — activity_log may not have data */ }
      } catch (error) {
        console.error('Error loading profile:', error);
        showToast('error', 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [supabase, router]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAvatarUpload = async (file: File) => {
    if (!supabase) return;
    try {
      setIsSaving(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${authUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const avatarUrl = data?.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl } as any)
        .eq('id', authUser.id);

      if (updateError) throw updateError;

      setUser((prev: any) => ({ ...prev, avatar_url: avatarUrl }));
      showToast('success', 'Profile picture updated');
    } catch (error: any) {
      console.error('Upload error:', error);
      showToast('error', error.message || 'Failed to upload avatar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBioUpdate = async (bio: string) => {
    if (!supabase) return;
    try {
      setIsSaving(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { error } = await supabase
        .from('profiles')
        .update({ bio } as any)
        .eq('id', authUser.id);

      if (error) throw error;

      setUser((prev: any) => ({ ...prev, bio }));
      showToast('success', 'Bio updated successfully');
    } catch (error: any) {
      console.error('Bio update error:', error);
      showToast('error', error.message || 'Failed to update bio');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusToggle = async (isActive: boolean) => {
    if (!supabase) return;
    try {
      setIsSaving(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive } as any)
        .eq('id', authUser.id);

      if (error) throw error;

      setUser((prev: any) => ({ ...prev, is_active: isActive }));
      showToast('success', isActive ? 'Status set to Active' : 'Status set to Away');
    } catch (error: any) {
      console.error('Status update error:', error);
      showToast('error', error.message || 'Failed to update status');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#0f3c35' }} />
          <p className="text-muted-foreground font-sans">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-lg text-sm font-semibold shadow-lg border ${
              toastMessage.type === 'success'
                ? 'border-border text-foreground'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
            style={toastMessage.type === 'success' ? { backgroundColor: '#dff2ef', borderColor: '#25a18e' } : undefined}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" style={{ color: '#25a18e' }} />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            {toastMessage.text}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground font-display">
            Profile Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Card */}
        {user && (
          <div className="mb-8">
            <UserProfileCard
              user={user}
              stats={stats}
              recentActivity={recentActivity}
              isEditable={isEditable}
              onAvatarUpload={handleAvatarUpload}
              onBioUpdate={handleBioUpdate}
              onStatusToggle={handleStatusToggle}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={() => setIsEditable(!isEditable)}
            className="text-white rounded-lg"
            style={{ backgroundColor: '#0f3c35' }}
            disabled={isSaving}
          >
            {isEditable ? 'Done Editing' : 'Edit Profile'}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/app/settings')}
            className="border-border text-foreground rounded-lg"
            disabled={isSaving}
          >
            Back to Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
