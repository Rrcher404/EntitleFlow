'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Image,
  File,
  Upload,
  ChevronDown,
  X,
  Loader2,
  Zap,
  Trash2,
  FolderPlus,
  Eye,
  MoreVertical,
} from 'lucide-react';
import type { Document } from '@/lib/types/index';
import { DOCUMENT_TYPE_LABELS } from '@/lib/types/index';
import type { Database } from '@/lib/database.types';
import { DocumentParseStatus } from '@/components/app/document-parse-status';

type Profile = Database['public']['Tables']['profiles']['Row'];

/** Lightweight project reference for dropdowns */
type ProjectRef = { id: string; name: string };

/** Lightweight permit reference for dropdowns */
type PermitRef = { id: string; permit_type: string };

interface DocumentWithProject extends Document {
  project_name?: string;
}

const getDocumentIcon = (fileType: string | null) => {
  if (!fileType) return FileText;
  if (fileType.startsWith('image/')) return Image;
  if (fileType.includes('pdf')) return FileText;
  if (fileType.includes('word')) return FileText;
  return File;
};

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/** Document actions dropdown component */
function DocumentActions({
  doc,
  projects,
  permits,
  onUpdate,
  profile,
}: {
  doc: DocumentWithProject;
  projects: ProjectRef[];
  permits: PermitRef[];
  onUpdate: () => Promise<void>;
  profile: Profile | null;
}) {
  const [open, setOpen] = useState(false);
  const [showAssignProject, setShowAssignProject] = useState(false);
  const [showAssignPermit, setShowAssignPermit] = useState(false);
  const supabase = createClient();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowAssignProject(false);
        setShowAssignPermit(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleDelete = async () => {
    if (!supabase || !confirm('Are you sure you want to delete this document?')) return;
    try {
      const { error } = await supabase.from('documents').delete().eq('id', doc.id);
      if (error) throw error;
      await onUpdate();
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document');
    }
  };

  const handleAssignProject = async (projectId: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('documents')
        .update({ project_id: projectId || null })
        .eq('id', doc.id);
      if (error) throw error;
      setShowAssignProject(false);
      setOpen(false);
      await onUpdate();
    } catch (err) {
      console.error('Error assigning project:', err);
      alert('Failed to assign project');
    }
  };

  const handleAssignPermit = async (permitId: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('documents')
        .update({ permit_id: permitId || null })
        .eq('id', doc.id);
      if (error) throw error;
      setShowAssignPermit(false);
      setOpen(false);
      await onUpdate();
    } catch (err) {
      console.error('Error assigning permit:', err);
      alert('Failed to assign permit');
    }
  };

  const handleView = () => {
    // Open document viewer — for now, open the storage path in a new tab
    if (doc.storage_path) {
      window.open(`/api/documents/${doc.id}/view`, '_blank');
    }
    setOpen(false);
  };

  const role = profile?.role;
  const canDelete = role === 'owner' || role === 'admin';

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="hover:bg-gray-100"
      >
        <MoreVertical className="w-4 h-4" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={handleView}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Document
            </button>

            <button
              onClick={() => { setShowAssignProject(!showAssignProject); setShowAssignPermit(false); }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              {doc.project_id ? 'Change Project' : 'Add to Project'}
            </button>

            {showAssignProject && (
              <div className="px-4 py-2 bg-gray-50 border-t border-b border-gray-100">
                <select
                  className="w-full text-sm px-2 py-1 border border-gray-300 rounded bg-white"
                  defaultValue={doc.project_id || ''}
                  onChange={(e) => handleAssignProject(e.target.value)}
                >
                  <option value="">No project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => { setShowAssignPermit(!showAssignPermit); setShowAssignProject(false); }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              {doc.permit_id ? 'Change Permit' : 'Add to Permit'}
            </button>

            {showAssignPermit && (
              <div className="px-4 py-2 bg-gray-50 border-t border-b border-gray-100">
                <select
                  className="w-full text-sm px-2 py-1 border border-gray-300 rounded bg-white"
                  defaultValue={doc.permit_id || ''}
                  onChange={(e) => handleAssignPermit(e.target.value)}
                >
                  <option value="">No permit</option>
                  {permits.map((p) => (
                    <option key={p.id} value={p.id}>{p.permit_type}</option>
                  ))}
                </select>
              </div>
            )}

            {canDelete && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Document
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [documents, setDocuments] = useState<DocumentWithProject[]>([]);
  const [projects, setProjects] = useState<ProjectRef[]>([]);
  const [permits, setPermits] = useState<PermitRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    file: null as File | null,
    name: '',
    documentType: 'other' as any,
    projectId: '',
    permitId: '',
  });

  const supabase = createClient();

  useEffect(() => {
    loadDocuments();
  }, [supabase]);

  const loadDocuments = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

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

        // Fetch documents
        const { data: docsData, error: docsError } = await supabase
          .from('documents')
          .select('*')
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false });

        if (docsError) throw docsError;

        // Fetch projects to get names
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, name')
          .eq('organization_id', orgId);

        if (projectsError) throw projectsError;
        setProjects(projectsData || []);

        // Fetch permits
        const { data: permitsData, error: permitsError } = await supabase
          .from('permits')
          .select('id, permit_type')
          .eq('organization_id', orgId);

        if (permitsError) throw permitsError;
        setPermits(permitsData || []);

        // Enrich documents with project names
        const enrichedDocs = (docsData || []).map(doc => {
          const project = projectsData?.find(p => p.id === doc.project_id);
          return {
            ...doc,
            project_name: project?.name,
          };
        });

        setDocuments(enrichedDocs);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Auto-populate document name from file name (strip extension)
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setFormData(prev => ({
        ...prev,
        file,
        name: prev.name || nameWithoutExt,
      }));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase || !profile || !formData.file || !formData.name || !formData.documentType) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);

      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('User not found');

      // Insert document record
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          organization_id: profile.organization_id,
          project_id: formData.projectId || null,
          permit_id: formData.permitId || null,
          file_name: formData.name,
          storage_path: `uploads/${profile.organization_id}/${formData.file.name}`,
          file_size: formData.file.size,
          file_type: formData.file.type,
          document_type: formData.documentType,
          uploaded_by: userId,
          description: formData.name,
        });

      if (insertError) throw insertError;

      // Log activity
      await supabase
        .from('activity_log')
        .insert({
          organization_id: profile.organization_id,
          action: 'document_uploaded',
          description: `${formData.name} uploaded`,
          actor_id: userId,
        });

      // Get the inserted document ID for auto-parse trigger
      const { data: latestDoc } = await supabase
        .from('documents')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .eq('file_name', formData.name)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Reset form and reload
      setFormData({
        file: null,
        name: '',
        documentType: 'other',
        projectId: '',
        permitId: '',
      });
      setShowUploadForm(false);
      await loadDocuments();

      // Trigger auto-parse in background (non-blocking)
      if (latestDoc?.id) {
        fetch(`/api/documents/${latestDoc.id}/auto-parse`, { method: 'POST' }).catch(() => {
          // Non-fatal — user can manually parse later
        });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Documents</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage project documents and files.</p>
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Documents</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage and organize project documents.</p>
        </div>
        <Button
          onClick={() => setShowUploadForm(!showUploadForm)}
          style={{ backgroundColor: '#1B3B2D', borderColor: '#D4A937' }}
          className="text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <Card
          className="p-6"
          style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Upload New Document</h2>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  File *
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-muted-foreground
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:text-white
                    hover:file:opacity-80"
                  style={{ '--file-bg': '#1B3B2D' } as any}
                  required
                />
                {formData.file && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {formData.file.name} ({formatFileSize(formData.file.size)})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Document Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Site Plan - Phase 1"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ '--ring-color': '#1B3B2D' } as any}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Document Type *
                </label>
                <select
                  value={formData.documentType}
                  onChange={e => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ '--ring-color': '#1B3B2D' } as any}
                  required
                >
                  <option value="">Select document type</option>
                  <option value="site_plan">Site Plan</option>
                  <option value="architectural_drawing">Architectural Drawing</option>
                  <option value="civil_drawing">Civil Drawing</option>
                  <option value="survey">Survey</option>
                  <option value="environmental_report">Environmental Report</option>
                  <option value="traffic_study">Traffic Study</option>
                  <option value="stormwater_plan">Stormwater Plan</option>
                  <option value="photo">Photo</option>
                  <option value="correspondence">Correspondence</option>
                  <option value="approval_letter">Approval Letter</option>
                  <option value="rejection_letter">Rejection Letter</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Project (Optional)
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={e => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ '--ring-color': '#1B3B2D' } as any}
                  >
                    <option value="">No project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Permit (Optional)
                  </label>
                  <select
                    value={formData.permitId}
                    onChange={e => setFormData(prev => ({ ...prev, permitId: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ '--ring-color': '#1B3B2D' } as any}
                  >
                    <option value="">No permit</option>
                    {permits.map(permit => (
                      <option key={permit.id} value={permit.id}>
                        {permit.permit_type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={uploading}
                  style={{ backgroundColor: '#1B3B2D' }}
                  className="text-white"
                >
                  {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUploadForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Documents List */}
      {documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc) => {
            const Icon = getDocumentIcon(doc.file_type);
            const docTypeLabel = doc.document_type ? DOCUMENT_TYPE_LABELS[doc.document_type] : 'Other';

            return (
              <Card
                key={doc.id}
                className="p-4"
                style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className="p-3 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: '#E8E0D0' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: '#1B3B2D' }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground truncate">
                          {doc.file_name}
                        </h3>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                          style={{
                            backgroundColor: '#E8E0D0',
                            color: '#1B3B2D',
                          }}
                        >
                          {docTypeLabel}
                        </span>
                        <DocumentParseStatus
                          documentId={doc.id}
                          initialStatus={doc.parse_status as any}
                          variant="badge"
                          onParseComplete={() => loadDocuments()}
                        />
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                        {doc.project_name && (
                          <span>Project: {doc.project_name}</span>
                        )}
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>{formatDate(doc.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <DocumentActions
                    doc={doc}
                    projects={projects}
                    permits={permits}
                    onUpdate={loadDocuments}
                    profile={profile}
                  />
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
          <div className="space-y-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto"
              style={{ backgroundColor: '#E8E0D0' }}
            >
              <Upload className="w-6 h-6" style={{ color: '#1B3B2D' }} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">No documents yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start by uploading your first document to get organized.
              </p>
            </div>
            <Button
              onClick={() => setShowUploadForm(true)}
              style={{ backgroundColor: '#1B3B2D' }}
              className="text-white mt-2"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First Document
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
