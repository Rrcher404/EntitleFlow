'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Project,
  ProjectStatus,
  ProjectType,
  Permit,
  PermitStatus,
  Document,
  ActivityLogEntry,
  ActivityAction,
  Deadline,
  Jurisdiction,
  DeadlineStatus,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  PROJECT_TYPE_LABELS,
  PERMIT_STATUS_LABELS,
  PERMIT_STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  DEADLINE_STATUS_LABELS,
  DEADLINE_STATUS_COLORS,
  ACTIVITY_ACTION_LABELS,
} from '@/lib/types/index';
import type { Database } from '@/lib/database.types';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Edit2, 
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  MapPin,
  Briefcase,
  DollarSign,
  Home,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];

interface EditFormData {
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  county: string | null;
  project_type: ProjectType;
  jurisdiction: string | null;
  status: ProjectStatus;
  acreage: number | null;
  zoning_district: string | null;
  estimated_value: number | null;
  target_completion_date: string | null;
}

interface PermitWithCommentCount extends Permit {
  comment_count: number;
}

const VALID_STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  draft: ['active', 'archived'],
  active: ['on_hold', 'completed', 'archived'],
  on_hold: ['active', 'archived'],
  completed: ['archived'],
  archived: [],
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [permits, setPermits] = useState<PermitWithCommentCount[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'permits' | 'documents' | 'activity'>('overview');

  const supabase = createClient();

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

          // Fetch project
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .eq('organization_id', orgId)
            .single();

          if (projectError) throw projectError;
          setProject(projectData);

          // Fetch all related data in parallel
          const [permitsRes, documentsRes, activityRes, deadlinesRes, jurisdictionsRes] = await Promise.all([
            supabase
              .from('permits')
              .select('*')
              .eq('project_id', projectId)
              .eq('organization_id', orgId)
              .order('created_at', { ascending: false }),
            supabase
              .from('documents')
              .select('*')
              .eq('project_id', projectId)
              .eq('organization_id', orgId)
              .order('created_at', { ascending: false }),
            supabase
              .from('activity_log')
              .select('*')
              .eq('project_id', projectId)
              .eq('organization_id', orgId)
              .order('created_at', { ascending: false })
              .limit(50),
            supabase
              .from('deadlines')
              .select('*')
              .eq('project_id', projectId)
              .eq('organization_id', orgId)
              .order('due_date', { ascending: true }),
            supabase
              .from('jurisdictions')
              .select('*')
              .eq('organization_id', orgId)
              .order('name', { ascending: true }),
          ]);

          if (permitsRes.error) throw permitsRes.error;
          if (documentsRes.error) throw documentsRes.error;
          if (activityRes.error) throw activityRes.error;
          if (deadlinesRes.error) throw deadlinesRes.error;
          if (jurisdictionsRes.error) throw jurisdictionsRes.error;

          setJurisdictions(jurisdictionsRes.data || []);
          setDocuments(documentsRes.data || []);
          setActivityLog(activityRes.data || []);
          setDeadlines(deadlinesRes.data || []);

          // For each permit, count comments
          const permitsData = (permitsRes.data || []) as PermitWithCommentCount[];
          for (const permit of permitsData) {
            const { count } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('permit_id', permit.id)
              .eq('organization_id', orgId);

            permit.comment_count = count || 0;
          }

          setPermits(permitsData);

          // Initialize edit form with project data
          setEditFormData({
            name: projectData.name,
            description: projectData.description,
            address: projectData.address,
            city: projectData.city,
            county: projectData.county,
            project_type: (projectData.project_type ?? 'residential') as ProjectType,
            jurisdiction: projectData.jurisdiction,
            status: (projectData.status ?? 'draft') as ProjectStatus,
            acreage: projectData.acreage,
            zoning_district: projectData.zoning_district,
            estimated_value: projectData.estimated_value,
            target_completion_date: projectData.target_completion_date,
          });
        }
      } catch (err) {
        console.error('Error loading project:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase, projectId]);

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!editFormData) return;

    const { name, value, type } = e.target;
    let parsedValue: any = value;

    if (type === 'number') {
      parsedValue = value ? parseFloat(value) : null;
    } else if (type === 'text' && value === '') {
      parsedValue = null;
    }

    setEditFormData({
      ...editFormData,
      [name]: parsedValue,
    });
  };

  const canTransitionStatus = (from: ProjectStatus, to: ProjectStatus): boolean => {
    return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project || !canTransitionStatus(project.status ?? 'draft', newStatus)) {
      setEditError(`Cannot transition from ${project?.status} to ${newStatus}`);
      return;
    }

    if (!editFormData) return;

    setSubmitting(true);
    setEditError(null);

    try {
      if (!supabase) {
        setEditError('Supabase client not available');
        setSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId)
        .eq('organization_id', profile?.organization_id ?? '');

      if (error) throw error;

      // Update local state
      setProject({ ...project, status: newStatus });
      if (editFormData) {
        setEditFormData({ ...editFormData, status: newStatus });
      }
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !editFormData) {
      setEditError('Project data not loaded. Please refresh the page.');
      return;
    }
    if (!profile) {
      setEditError('User profile not loaded. Please refresh the page.');
      return;
    }

    setSubmitting(true);
    setEditError(null);

    try {
      if (!supabase) {
        setEditError('Supabase client not available');
        setSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('projects')
        .update({
          name: editFormData.name,
          description: editFormData.description,
          address: editFormData.address,
          city: editFormData.city,
          county: editFormData.county,
          project_type: editFormData.project_type,
          jurisdiction: editFormData.jurisdiction ?? undefined,
          status: editFormData.status,
          acreage: editFormData.acreage,
          zoning_district: editFormData.zoning_district,
          estimated_value: editFormData.estimated_value,
          target_completion_date: editFormData.target_completion_date,
        } as any)
        .eq('id', projectId)
        .eq('organization_id', profile.organization_id ?? '');

      if (error) throw error;

      // Update project state
      setProject({
        ...project,
        name: editFormData.name,
        description: editFormData.description,
        address: editFormData.address,
        city: editFormData.city,
        county: editFormData.county,
        project_type: editFormData.project_type,
        jurisdiction: editFormData.jurisdiction ?? '',
        status: editFormData.status,
        acreage: editFormData.acreage,
        zoning_district: editFormData.zoning_district,
        estimated_value: editFormData.estimated_value,
        target_completion_date: editFormData.target_completion_date,
      });

      setShowEditModal(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-64 mb-6" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Card
          className="p-12 text-center"
          style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}
        >
          <p className="text-muted-foreground">Project not found.</p>
        </Card>
      </div>
    );
  }

  const statusKey = (project.status ?? 'draft') as ProjectStatus;
  const statusColor = PROJECT_STATUS_COLORS[statusKey];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Button>

      {/* Project Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">
                {project.project_number}
              </h1>
              <span
                className={cn(
                  statusColor.bg,
                  statusColor.text,
                  'px-3 py-1 rounded-full text-sm font-semibold'
                )}
              >
                {PROJECT_STATUS_LABELS[statusKey]}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              {project.name}
            </h2>
            {project.description && (
              <p className="text-base text-muted-foreground mb-3">
                {project.description}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {project.project_type && (
                <span
                  className="px-3 py-1 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: '#1B3B2D' }}
                >
                  {PROJECT_TYPE_LABELS[project.project_type]}
                </span>
              )}
              {project.jurisdiction && (
                <span
                  className="px-3 py-1 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: '#E8E0D0', color: '#1B3B2D' }}
                >
                  {project.jurisdiction}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(true)}
              className="gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
            <div className="relative group">
              <Button
                variant="outline"
                className="gap-2"
              >
                {PROJECT_STATUS_LABELS[statusKey]} ▾
              </Button>
              <div className="absolute right-0 mt-1 w-48 bg-white border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                {Object.entries(PROJECT_STATUS_LABELS).map(([statusVal, statusLabel]) => {
                  const status = statusVal as ProjectStatus;
                  const isValid = canTransitionStatus(statusKey, status);
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={!isValid || submitting}
                      className={cn(
                        'w-full text-left px-4 py-2 text-sm transition-colors',
                        isValid
                          ? 'hover:bg-gray-100 cursor-pointer'
                          : 'text-gray-400 cursor-not-allowed'
                      )}
                    >
                      {statusLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        className="border-b mb-6"
        style={{ borderColor: '#E8E0D0' }}
      >
        <div className="flex gap-6">
          {(['overview', 'permits', 'documents', 'activity'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'pb-3 px-1 font-medium text-sm transition-colors',
                activeTab === tab
                  ? 'text-foreground border-b-2'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              style={
                activeTab === tab
                  ? { borderBottomColor: '#1B3B2D', color: '#1B3B2D' }
                  : {}
              }
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'permits' && `Permits (${permits.length})`}
              {tab === 'documents' && `Documents (${documents.length})`}
              {tab === 'activity' && 'Activity'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Project Details */}
          <Card
            className="p-6"
            style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Project Details
            </h3>
            <div className="grid grid-cols-2 gap-6">
              {project.address && (
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="text-foreground">{project.address}</p>
                    {(project.city || project.county) && (
                      <p className="text-sm text-muted-foreground">
                        {[project.city, project.county].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {project.acreage && (
                <div className="flex gap-3">
                  <Home className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Acreage</p>
                    <p className="text-foreground">{project.acreage} acres</p>
                  </div>
                </div>
              )}

              {project.zoning_district && (
                <div className="flex gap-3">
                  <Briefcase className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Zoning District</p>
                    <p className="text-foreground">{project.zoning_district}</p>
                  </div>
                </div>
              )}

              {project.estimated_value && (
                <div className="flex gap-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estimated Value</p>
                    <p className="text-foreground">
                      ${(project.estimated_value / 1_000_000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              )}

              {project.target_completion_date && (
                <div className="flex gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Target Completion</p>
                    <p className="text-foreground">
                      {formatDate(project.target_completion_date)}
                    </p>
                  </div>
                </div>
              )}

              {project.created_at && (
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <p className="text-foreground">{formatDate(project.created_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Upcoming Deadlines */}
          {deadlines.length > 0 && (
            <Card
              className="p-6"
              style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Upcoming Deadlines
              </h3>
              <div className="space-y-3">
                {deadlines.map(deadline => {
                  const statusKey = (deadline.status ?? 'upcoming') as DeadlineStatus;
                  const statusColor = DEADLINE_STATUS_COLORS[statusKey] || { bg: '', text: '' };
                  return (
                    <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg" style={{ borderColor: '#E8E0D0' }}>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{deadline.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(deadline.due_date)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          statusColor.bg,
                          statusColor.text,
                          'px-3 py-1 rounded-full text-xs font-medium'
                        )}
                      >
                        {DEADLINE_STATUS_LABELS[statusKey] || 'Upcoming'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Permits Tab */}
      {activeTab === 'permits' && (
        <div className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button
              className="gap-2"
              style={{ backgroundColor: '#1B3B2D' }}
              onClick={() => router.push(`/app/permits?project_id=${projectId}`)}
            >
              <Plus className="w-4 h-4" />
              Add Permit
            </Button>
          </div>

          {permits.length > 0 ? (
            <div className="space-y-3">
              {permits.map(permit => {
                const statusKey = (permit.status ?? 'draft') as PermitStatus;
                const statusColor = PERMIT_STATUS_COLORS[statusKey] || { bg: '', text: '' };
                const priorityColor = PRIORITY_COLORS[(permit.priority ?? 'medium') as keyof typeof PRIORITY_COLORS];

                return (
                  <Card
                    key={permit.id}
                    className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                    style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}
                    onClick={() => router.push(`/app/permits/${permit.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground">
                            {permit.permit_number}
                          </h4>
                          <span
                            className={cn(
                              statusColor.bg,
                              statusColor.text,
                              'px-2 py-0.5 rounded text-xs font-medium'
                            )}
                          >
                            {PERMIT_STATUS_LABELS[statusKey]}
                          </span>
                          <span
                            className={cn(
                              priorityColor.bg,
                              priorityColor.text,
                              'px-2 py-0.5 rounded text-xs font-medium'
                            )}
                          >
                            {PRIORITY_LABELS[(permit.priority ?? 'medium') as keyof typeof PRIORITY_LABELS]}
                          </span>
                        </div>
                        <p className="text-foreground font-medium">{permit.title}</p>
                        {permit.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {permit.description}
                          </p>
                        )}
                        {permit.submitted_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Submitted: {formatDate(permit.submitted_at)}
                          </p>
                        )}
                      </div>

                      <div className="text-right ml-4 whitespace-nowrap flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <FileText className="w-4 h-4" />
                          {permit.comment_count}
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
              <p className="text-muted-foreground mb-4">No permits yet.</p>
              <Button
                className="gap-2"
                style={{ backgroundColor: '#1B3B2D' }}
                onClick={() => router.push(`/app/permits?project_id=${projectId}`)}
              >
                <Plus className="w-4 h-4" />
                Create Your First Permit
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button
              className="gap-2"
              style={{ backgroundColor: '#1B3B2D' }}
              onClick={() => router.push(`/app/documents?project_id=${projectId}`)}
            >
              <Plus className="w-4 h-4" />
              Upload Document
            </Button>
          </div>

          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map(doc => (
                <Card
                  key={doc.id}
                  className="p-4"
                  style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{doc.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.file_type} • {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'Unknown size'} •{' '}
                          {formatDate(doc.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card
              className="p-12 text-center"
              style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}
            >
              <p className="text-muted-foreground mb-4">No documents yet.</p>
              <Button
                className="gap-2"
                style={{ backgroundColor: '#1B3B2D' }}
                onClick={() => router.push(`/app/documents?project_id=${projectId}`)}
              >
                <Plus className="w-4 h-4" />
                Upload Your First Document
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div>
          {activityLog.length > 0 ? (
            <div className="space-y-4">
              {activityLog.map((entry, index) => (
                <div key={entry.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: '#D4A937' }}
                    />
                    {index < activityLog.length - 1 && (
                      <div
                        className="w-0.5 h-12"
                        style={{ backgroundColor: '#E8E0D0' }}
                      />
                    )}
                  </div>

                  <Card
                    className="p-4 flex-1"
                    style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-foreground">
                        {entry.action && ACTIVITY_ACTION_LABELS[entry.action as ActivityAction] || 'Activity'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(entry.created_at)}
                      </p>
                    </div>
                    {entry.description && (
                      <p className="text-sm text-muted-foreground">{entry.description}</p>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <Card
              className="p-12 text-center"
              style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}
            >
              <p className="text-muted-foreground">No activity yet.</p>
            </Card>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card
            className="w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: '#FDFBF7' }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Edit Project</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditError(null);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {editError}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description || ''}
                    onChange={handleEditInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={editFormData.address || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={editFormData.city || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      County
                    </label>
                    <input
                      type="text"
                      name="county"
                      value={editFormData.county || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Project Type
                    </label>
                    <select
                      name="project_type"
                      value={editFormData.project_type}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground text-sm"
                    >
                      {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Jurisdiction
                    </label>
                    <select
                      name="jurisdiction"
                      value={editFormData.jurisdiction || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground text-sm"
                    >
                      <option value="">Select jurisdiction</option>
                      {jurisdictions.map(j => (
                        <option key={j.id} value={j.name}>{j.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Acreage
                    </label>
                    <input
                      type="number"
                      name="acreage"
                      value={editFormData.acreage || ''}
                      onChange={handleEditInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Zoning District
                    </label>
                    <input
                      type="text"
                      name="zoning_district"
                      value={editFormData.zoning_district || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Estimated Value
                    </label>
                    <input
                      type="number"
                      name="estimated_value"
                      value={editFormData.estimated_value || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Target Completion Date
                    </label>
                    <input
                      type="date"
                      name="target_completion_date"
                      value={editFormData.target_completion_date || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    style={{ backgroundColor: '#1B3B2D' }}
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditError(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
