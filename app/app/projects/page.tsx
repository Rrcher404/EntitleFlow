'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Project,
  ProjectInsert,
  ProjectStatus,
  ProjectType,
  Jurisdiction,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  PROJECT_TYPE_LABELS,
} from '@/lib/types/index';
import type { Database } from '@/lib/database.types';
import { Plus, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];

interface ProjectWithPermitCount extends Project {
  permit_count: number;
}

interface FormData {
  name: string;
  description: string;
  address: string;
  project_type: ProjectType;
  jurisdiction: string;
}

const initialFormData: FormData = {
  name: '',
  description: '',
  address: '',
  project_type: 'residential',
  jurisdiction: '',
};

export default function ProjectsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<ProjectWithPermitCount[]>([]);
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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

          // Fetch jurisdictions in parallel with projects
          const [projectsRes, jurisdictionsRes] = await Promise.all([
            supabase
              .from('projects')
              .select('*')
              .eq('organization_id', orgId)
              .order('created_at', { ascending: false }),
            supabase
              .from('jurisdictions')
              .select('*')
              .order('name', { ascending: true }),
          ]);

          if (projectsRes.error) throw projectsRes.error;
          if (jurisdictionsRes.error) throw jurisdictionsRes.error;

          setJurisdictions(jurisdictionsRes.data || []);

          // Fetch permit counts for each project
          if (projectsRes.data && projectsRes.data.length > 0) {
            const projectIds = projectsRes.data.map(p => p.id);
            const { data: permitsData, error: permitsError } = await supabase
              .from('permits')
              .select('project_id', { count: 'exact' })
              .in('project_id', projectIds);

            if (permitsError) throw permitsError;

            const permitCounts: Record<string, number> = {};
            permitsData?.forEach(p => {
              permitCounts[p.project_id] = (permitCounts[p.project_id] || 0) + 1;
            });

            const projectsWithCounts: ProjectWithPermitCount[] = projectsRes.data.map(p => ({
              ...p,
              permit_count: permitCounts[p.id] || 0,
            }));

            setProjects(projectsWithCounts);
          } else {
            setProjects([]);
          }
        }
      } catch (err) {
        console.error('Error loading projects:', err);
        setError(err instanceof Error ? err.message : 'Failed to load projects');
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
      if (!formData.name.trim()) {
        setError('Project name is required');
        setSubmitting(false);
        return;
      }

      // Insert project
      const projectInsert: ProjectInsert = {
        organization_id: profile.organization_id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        address: formData.address.trim() || null,
        project_type: formData.project_type as ProjectType,
        jurisdiction: formData.jurisdiction,
        status: 'draft' as ProjectStatus,
      };

      const { data: newProject, error: insertError } = await supabase
        .from('projects')
        .insert(projectInsert)
        .select()
        .single();

      if (insertError) throw insertError;

      // Insert activity log entry
      await supabase
        .from('activity_log')
        .insert({
          organization_id: profile.organization_id,
          action: 'project_created',
          description: `Project "${formData.name}" created`,
          project_id: newProject.id,
          created_at: new Date().toISOString(),
        });

      // Update UI
      setProjects(prev => [
        { ...newProject, permit_count: 0 },
        ...prev,
      ]);

      setFormData(initialFormData);
      setShowForm(false);
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage and track all your active projects.</p>
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage and track all your active projects.</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
          style={{ backgroundColor: '#1B3B2D' }}
        >
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* New Project Form */}
      {showForm && (
        <Card className="p-6" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Create New Project</h2>
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
                Project Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Downtown Plaza Mixed-Use Development"
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
                placeholder="Brief description of the project"
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground placeholder-muted-foreground text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground placeholder-muted-foreground text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Project Type
                </label>
                <select
                  name="project_type"
                  value={formData.project_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground text-sm"
                >
                  {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Jurisdiction
              </label>
              <select
                name="jurisdiction"
                value={formData.jurisdiction}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground text-sm"
                required
              >
                <option value="">Select jurisdiction</option>
                {jurisdictions.map(j => (
                  <option key={j.id} value={j.name}>{j.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                style={{ backgroundColor: '#1B3B2D' }}
              >
                {submitting ? 'Creating...' : 'Create Project'}
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

      {/* Projects List */}
      {projects.length > 0 ? (
        <div className="space-y-3">
          {projects.map(project => {
            const statusKey = (project.status ?? 'draft') as ProjectStatus;
            const statusColor = PROJECT_STATUS_COLORS[statusKey];

            return (
              <Card
                key={project.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}
                onClick={() => router.push(`/app/projects/${project.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {project.project_number}
                      </h3>
                      <span
                        className={cn(
                          statusColor.bg,
                          statusColor.text,
                          'px-2 py-0.5 rounded-full text-xs font-medium'
                        )}
                      >
                        {PROJECT_STATUS_LABELS[statusKey]}
                      </span>
                    </div>

                    <h2 className="text-lg font-semibold text-foreground mb-2">
                      {project.name}
                    </h2>

                    {project.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {project.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {project.address && (
                        <div>
                          <span className="font-medium">Address:</span> {project.address}
                        </div>
                      )}
                      {project.jurisdiction && (
                        <div>
                          <span className="font-medium">Jurisdiction:</span> {project.jurisdiction}
                        </div>
                      )}
                      {project.created_at && (
                        <div>
                          <span className="font-medium">Created:</span> {formatDate(project.created_at)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right ml-4 whitespace-nowrap">
                    <div className="text-2xl font-semibold" style={{ color: '#D4A937' }}>
                      {project.permit_count}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {project.permit_count === 1 ? 'Permit' : 'Permits'}
                    </p>
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
          <p className="text-muted-foreground mb-4">No projects yet.</p>
          <Button
            onClick={() => setShowForm(true)}
            className="gap-2"
            style={{ backgroundColor: '#1B3B2D' }}
          >
            <Plus className="w-4 h-4" />
            Create Your First Project
          </Button>
        </Card>
      )}
    </div>
  );
}
