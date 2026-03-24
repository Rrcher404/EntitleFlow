import { NextResponse } from 'next/server';
import { verifyCompanyAdmin } from '@/lib/admin/company-auth';

export async function GET() {
  try {
    const { error, admin, serviceClient } = await verifyCompanyAdmin();

    if (error || !admin || !serviceClient) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Not authenticated' ? 401 : 403 }
      );
    }

    // Get organization storage info
    const { data: organization } = await serviceClient
      .from('organizations')
      .select('storage_used_bytes, storage_limit_bytes, max_file_size_bytes')
      .eq('id', admin.organization_id)
      .single();

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get storage breakdown by project (simplified - would need document tracking)
    // For now returning empty arrays as the schema doesn't have direct file size tracking
    const breakdownByProject: any[] = [];
    const breakdownByUser: any[] = [];
    const fileTypeDistribution: Record<string, number> = {};

    // Get projects in organization for context
    const { data: projects } = await serviceClient
      .from('projects')
      .select('id, name')
      .eq('organization_id', admin.organization_id);

    // If documents table exists and has file tracking, populate breakdowns
    // This is a placeholder for future file tracking implementation
    projects?.forEach((project: any) => {
      breakdownByProject.push({
        project_id: project.id,
        project_name: project.name,
        bytes: 0, // Would be calculated from documents
      });
    });

    return NextResponse.json({
      storage_used_bytes: organization.storage_used_bytes || 0,
      storage_limit_bytes: organization.storage_limit_bytes || 10737418240,
      max_file_size_bytes: organization.max_file_size_bytes || 157286400,
      storage_percentage: Math.round(
        ((organization.storage_used_bytes || 0) / (organization.storage_limit_bytes || 10737418240)) * 100
      ),
      breakdown_by_project: breakdownByProject,
      breakdown_by_user: breakdownByUser,
      file_type_distribution: fileTypeDistribution,
    });
  } catch (err) {
    console.error('Error fetching storage info:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
