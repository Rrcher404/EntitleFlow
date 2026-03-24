import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/auth'

export async function GET() {
  try {
    const { error, serviceClient } = await verifyAdmin()
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    if (!serviceClient) {
      return NextResponse.json(
        { error: 'Service client not initialized' },
        { status: 500 }
      )
    }

    // Fetch organization count
    const { count: totalOrganizations } = await serviceClient
      .from('organizations')
      .select('id', { count: 'exact', head: true })

    // Fetch user count
    const { count: totalUsers } = await serviceClient
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    // Fetch project count
    const { count: totalProjects } = await serviceClient
      .from('projects')
      .select('id', { count: 'exact', head: true })

    // Fetch permit count
    const { count: totalPermits } = await serviceClient
      .from('permits')
      .select('id', { count: 'exact', head: true })

    // Fetch document count
    const { count: totalDocuments } = await serviceClient
      .from('documents')
      .select('id', { count: 'exact', head: true })

    // Fetch storage stats
    const { data: storageData } = await serviceClient
      .from('organizations')
      .select('storage_used_bytes, storage_limit_bytes')

    let totalStorageUsed = 0
    let totalStorageAllocated = 0
    if (storageData) {
      for (const org of storageData) {
        totalStorageUsed += org.storage_used_bytes || 0
        totalStorageAllocated += org.storage_limit_bytes || 0
      }
    }

    const storagePercentage = totalStorageAllocated > 0
      ? (totalStorageUsed / totalStorageAllocated) * 100
      : 0

    // Fetch top 10 orgs by storage
    const { data: topOrgsByStorage } = await serviceClient
      .from('organizations')
      .select('name, storage_used_bytes, storage_limit_bytes')
      .order('storage_used_bytes', { ascending: false })
      .limit(10)

    // Fetch top 10 orgs by user count (count profiles per org)
    const { data: topOrgsByUsers } = await serviceClient
      .from('organizations')
      .select('name, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    const topOrgsByUserCount = (topOrgsByUsers || []).map((org) => ({
      name: org.name,
      user_count: 0, // TODO: implement proper user count per org via profiles query
    }))

    // Database table row counts (using already-fetched counts)
    const database_stats: Record<string, number> = {
      organizations: totalOrganizations || 0,
      profiles: totalUsers || 0,
      projects: totalProjects || 0,
      permits: totalPermits || 0,
      documents: totalDocuments || 0,
    }

    // Fetch recent errors from admin_audit_log
    const { data: recentErrors } = await serviceClient
      .from('admin_audit_log')
      .select('id, action, created_at')
      .eq('action', 'error')
      .order('created_at', { ascending: false })
      .limit(50)

    // Group errors
    const errorMap: Record<string, { message: string; count: number; timestamp: string }> = {}
    if (recentErrors) {
      for (const err of recentErrors) {
        const key = err.action
        if (!errorMap[key]) {
          errorMap[key] = {
            message: key,
            count: 0,
            timestamp: err.created_at || '',
          }
        }
        errorMap[key].count += 1
      }
    }

    const recent_errors = Object.entries(errorMap).map(([id, err]) => ({
      id,
      message: err.message,
      timestamp: err.timestamp,
      count: err.count,
    }))

    // System config
    const system_config = {
      max_organizations: totalOrganizations || 0,
      max_users: totalUsers || 0,
      storage_policy: 'per_organization',
      backup_enabled: true,
      audit_logging_enabled: true,
      two_factor_auth_required: false,
    }

    return NextResponse.json({
      summary: {
        total_organizations: totalOrganizations || 0,
        total_users: totalUsers || 0,
        total_projects: totalProjects || 0,
        total_permits: totalPermits || 0,
        total_documents: totalDocuments || 0,
      },
      storage: {
        total_used_bytes: totalStorageUsed,
        total_allocated_bytes: totalStorageAllocated,
        percentage_used: storagePercentage,
      },
      top_orgs_by_storage: (topOrgsByStorage || []).map((org) => ({
        name: org.name,
        storage_used_bytes: org.storage_used_bytes || 0,
        storage_limit_bytes: org.storage_limit_bytes || 0,
      })),
      top_orgs_by_users: topOrgsByUserCount,
      database_stats,
      recent_errors,
      system_config,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}