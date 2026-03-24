/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { verifyCompanyAdmin } from '@/lib/admin/company-auth';

export async function GET(request: NextRequest) {
  try {
    const { error, admin, serviceClient } = await verifyCompanyAdmin();

    if (error || !admin || !serviceClient) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Not authenticated' ? 401 : 403 }
      );
    }

    // Get export parameters
    const format = request.nextUrl.searchParams.get('format') || 'csv';
    const date_from = request.nextUrl.searchParams.get('date_from');
    const date_to = request.nextUrl.searchParams.get('date_to');
    const user_id = request.nextUrl.searchParams.get('user_id');
    const action = request.nextUrl.searchParams.get('action');

    // Validate format
    if (!['csv', 'xlsx', 'md'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use csv, xlsx, or md' },
        { status: 400 }
      );
    }

    // Build query
    let query = serviceClient
      .from('admin_audit_log')
      .select('id, admin_id, action, target_type, target_id, details, created_at, profiles(full_name, email)')
      .eq('organization_id', admin.organization_id);

    if (user_id) {
      query = query.eq('admin_id', user_id);
    }
    if (action) {
      query = query.eq('action', action);
    }
    if (date_from) {
      query = query.gte('created_at', date_from);
    }
    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    const { data: logs, error: logsError } = await query.order('created_at', { ascending: false });

    if (logsError) {
      return NextResponse.json(
        { error: logsError.message },
        { status: 400 }
      );
    }

    // Log the export action
    await serviceClient.from('user_activity_tracking').insert({
      profile_id: admin.id,
      organization_id: admin.organization_id,
      action: 'audit_log_exported',
      resource_type: 'audit_log',
      metadata: { format, record_count: logs?.length || 0, date_from, date_to },
    });

    // Format data based on requested format
    if (format === 'csv') {
      const csv = formatAsCSV(logs || []);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv;charset=utf-8',
          'Content-Disposition': 'attachment; filename="audit_log.csv"',
        },
      });
    } else if (format === 'md') {
      const md = formatAsMarkdown(logs || []);
      return new NextResponse(md, {
        headers: {
          'Content-Type': 'text/markdown;charset=utf-8',
          'Content-Disposition': 'attachment; filename="audit_log.md"',
        },
      });
    } else if (format === 'xlsx') {
      // For XLSX, we return as CSV content with xlsx extension for simplicity
      // In production, use a library like xlsx or exceljs
      const csv = formatAsCSV(logs || []);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv;charset=utf-8',
          'Content-Disposition': 'attachment; filename="audit_log.xlsx"',
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid format' },
      { status: 400 }
    );
  } catch (err) {
    console.error('Error exporting audit log:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatAsCSV(logs: any[]): string {
  const headers = ['ID', 'Admin', 'Email', 'Action', 'Target Type', 'Target ID', 'Details', 'Created At'];
  const rows = logs.map((log: any) => [
    log.id,
    log.profiles?.full_name || 'Unknown',
    log.profiles?.email || 'Unknown',
    log.action,
    log.target_type || '',
    log.target_id || '',
    JSON.stringify(log.details || {}),
    log.created_at,
  ]);

  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

function formatAsMarkdown(logs: any[]): string {
  let md = '# Audit Log Export\n\n';
  md += `Generated: ${new Date().toISOString()}\n\n`;
  md += '## Entries\n\n';

  logs.forEach((log: any, index: number) => {
    md += `### ${index + 1}. ${log.action}\n`;
    md += `- **Admin**: ${log.profiles?.full_name || 'Unknown'} (${log.profiles?.email || 'Unknown'})\n`;
    md += `- **Target Type**: ${log.target_type || 'N/A'}\n`;
    md += `- **Target ID**: ${log.target_id || 'N/A'}\n`;
    md += `- **Created At**: ${log.created_at}\n`;
    if (log.details && Object.keys(log.details).length > 0) {
      md += `- **Details**:\n`;
      Object.entries(log.details).forEach(([key, value]: [string, any]) => {
        md += `  - ${key}: ${JSON.stringify(value)}\n`;
      });
    }
    md += '\n';
  });

  return md;
}
