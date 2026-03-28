'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Permit,
  PermitInsert,
  PermitStatus,
  PermitType,
  Priority,
  PERMIT_STATUS_LABELS,
  PERMIT_STATUS_COLORS,
  PERMIT_TYPE_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from '@/lib/types/index';
import type { Database } from '@/lib/database.types';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];

interface PermitWithProject extends Permit {
  project_name?: string;
}

interface FormData {
  title: string;
  description: string;
  permit_type: PermitType;
  priority: Priority;
  project_id: string;
  jurisdiction: string;
}

const initialFormData: FormData = {
  title: '',
  description: '',
  permit_type: 'building_permit',
  priority: 'normal',
  project_id: '',
  jurisdiction: '',
};

const PERMIT_STATUS_TABS: { value: PermitStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'revision_requested', label: 'Revision Requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
];

export default function PermitsClient() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [_organization, setOrganization] = useState<Organization | null>(null);
  const [permits, setPermits] = useState<PermitWithProject[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<PermitStatus | 'all'>('all');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setShowForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadData = async () => {
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

        if (profileData) {
          const orgId = profileData.organization_id;

          // Fetch organization
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', orgId)
            .single();

          if (!orgError) setOrganization(orgData);

          // Fetch permits and projects in parallel
          const [permitsRes, projectsRes] = await Promise.all([
            supabase
              .from('permits')
              .select('*')
              .eq('organization_id', orgId)
              .order('created_at', { ascending: false }),
            supabase
              .from('projects')
              .select('id, name')
              .eq('organization_id', orgId)
              .order('name', { ascending: true }),
          ]);

          if (permitsRes.error) throw permitsRes.error;
          if (projectsRes.error) throw projectsRes.error;

          setProjects(projectsRes.data || []);

          // Enrich permits with project names
          const permitsWithProjects: PermitWithProject[] = (permitsRes.data || []).map(permit => {
            const project = projectsRes.data?.find(p => p.id === permit.project_id);
            return {
              ...permit,
              project_name: project?.name,
            };
          });

          setPermits(permitsWithProjects);
        }
      } catch (err) {
        console.error('Error loading permits:', err);
        setError(err instanceof Error ? err.message : 'Failed to load permits');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !profile) return;

    setSubmitting(true);
    setError(null);

    try {
      if (!formData.title.trim()) {
        setError('Permit title is required');
        setSubmitting(false);
        return;
      }

      if (!formData.project_id) {
        setError('Project is required');
        setSubmitting(false);
        return;
      }

      // Get selected project to populate jurisdiction
      const selectedProject = projects.find(p => p.id === formData.project_id);
      if (!selectedProject) {
        setError('Selected project not found');
        setSubmitting(false);
        return;
      }

      // Fetch the project to get jurisdiction
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('jurisdiction')
        .eq('id', formData.project_id)
        .single();

      if (projectError) throw projectError;

      // Insert permit
      const permitInsert: PermitInsert = {
        organization_id: profile.organization_id,
        project_id: formData.project_id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        permit_type: formData.permit_type as PermitType,
        priority: formData.priority as Priority,
        status: 'draft' as PermitStatus,
        jurisdiction: projectData.jurisdiction,
        metadata: null,
      };

      const { data: newPermit, error: insertError } = await supabase
        .from('permits')
        .insert(permitInsert)
        .select()
        .single();

      if (insertError) throw insertError;

      // Insert activity log entry
      await supabase
        .from('activity_log')
        .insert({
          organization_id: profile.organization_id,
          action: 'permit_submitted',
          description: `${PERMIT_TYPE_LABELS[formData.permit_type]} "${formData.title}" created`,
          permit_id: newPermit.id,
          project_id: formData.project_id,
          created_at: new Date().toISOString(),
        });

      // Update UI
      setPermits(prev => [
        {
          ...newPermit,
          project_name: selectedProject.name,
        },
        ...prev,
      ]);

      setFormData(initialFormData);
      setShowForm(false);
    } catch (err) {
      console.error('Error creating permit:', err);
      setError(err instanceof Error ? err.message : 'Failed to create permit');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredPermits = permits.filter(permit => {
    if (activeTab === 'all') return true;
    return permit.status === activeTab;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Permits</h1>
          <p className="mt-1 text-sm text-muted-foreground">View and manage permit applications and approvals.</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Permits</h1>
          <p className="mt-1 text-sm text-muted-foreground">View and manage permit applications and approvals.</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
          style={{ backgroundColor: '#1B3B2D' }}
        >
          <Plus className="w-4 h-4" />
          New Permit
        </Button>
      </div>

      {/* New Permit Form */}
      {showForm && (
        <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Create New Permit</h2>
            <button
              onClick={() => {
                setShowForm(false);
                setFormData(initialFormData);
                setError(null);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Permit Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Building Permit for Phase 1"
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground placeholder-muted-foreground text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Additional details about this permit"
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground placeholder-muted-foreground text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Permit Type
                </label>
                <select
                  name="permit_type"
                  value={formData.permit_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground text-sm"
                >
                  {Object.entries(PERMIT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground text-sm"
                >
                  {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Project
              </label>
              <select
                name="project_id"
                value={formData.project_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground text-sm"
                required
              >
                <option value="">Select a project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                style={{ backgroundColor: '#1B3B2D' }}
              >
                {submitting ? 'Creating...' : 'Create Permit'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormData(initialFormData);
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Status Filter Tabs */}
      {permits.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-border pb-4">
          {PERMIT_STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                activeTab === tab.value
                  ? 'text-white'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              style={{
                backgroundColor: activeTab === tab.value ? '#1B3B2D' : 'transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Permits List */}
      {filteredPermits.length > 0 ? (
        <div className="space-y-3">
          {filteredPermits.map(permit => {
            const statusColor = PERMIT_STATUS_COLORS[permit.status as PermitStatus];
            const priorityColor = PRIORITY_COLORS[permit.priority as Priority];

            return (
              <Card
                key={permit.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}
                onClick={() => router.push(`/app/permits/${permit.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {permit.permit_number}
                      </h3>
                      <span
                        className={cn(
                          statusColor.bg,
                          statusColor.text,
                          'px-2 py-0.5 rounded-full text-xs font-medium'
                        )}
                      >
                        {PERMIT_STATUS_LABELS[permit.status as PermitStatus]}
                      </span>
                      <span
                        className={cn(
                          priorityColor.bg,
                          priorityColor.text,
                          'px-2 py-0.5 rounded-full text-xs font-medium'
                        )}
                      >
                        {PRIORITY_LABELS[permit.priority as Priority]}
                      </span>
                    </div>

                    <h2 className="text-lg font-semibold text-foreground mb-2">
                      {permit.title}
                    </h2>

                    {permit.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {permit.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {permit.project_name && (
                        <div>
                          <span className="font-medium">Project:</span> {permit.project_name}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Type:</span> {PERMIT_TYPE_LABELS[permit.permit_type as PermitType]}
                      </div>
                      {permit.assigned_reviewer && (
                        <div>
                          <span className="font-medium">Reviewer:</span> {permit.assigned_reviewer}
                        </div>
                      )}
                      {permit.submitted_at && (
                        <div>
                          <span className="font-medium">Submitted:</span> {formatDate(permit.submitted_at)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card
          className="p-12 text-center"
          style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}
        >
          <p className="text-muted-foreground mb-4">
            {permits.length === 0 ? 'No permits yet.' : `No permits with status "${PERMIT_STATUS_LABELS[activeTab as PermitStatus]}".`}
          </p>
          {permits.length === 0 && (
            <Button
              onClick={() => setShowForm(true)}
              className="gap-2"
              style={{ backgroundColor: '#1B3B2D' }}
            >
              <Plus className="w-4 h-4" />
              Create Your First Permit
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
