import { NextResponse, NextRequest } from 'next/server'
import { verifyAdmin } from '@/lib/admin/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const orgId = id

    // Fetch organization details
    const { data: org, error: orgError } = await serviceClient
      .from('organizations')
      .select('id, name, slug, company_type, created_at, subscription_tier, storage_used_bytes, storage_limit_bytes, max_users, is_active')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Fetch users in organization via team_members
    const { data: users } = await serviceClient
      .from('team_members')
      .select('id, role, profiles(id, email, full_name)')
      .eq('organization_id', orgId)

    // Fetch activity logs from admin_audit_log
    const { data: activity } = await serviceClient
      .from('admin_audit_log')
      .select('id, action, created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(50)

    // Get user count
    const { count: userCount } = await serviceClient
      .from('team_members')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)

    return NextResponse.json({
      id: org.id,
      name: org.name,
      slug: org.slug,
      type: org.company_type,
      created_at: org.created_at,
      subscription_tier: org.subscription_tier,
      storage_used: org.storage_used_bytes || 0,
      storage_limit: org.storage_limit_bytes || 0,
      max_users: org.max_users || 0,
      user_count: userCount || 0,
      is_active: org.is_active,
      users: (users || []).map((u) => ({
        id: u.id,
        email: (u.profiles as unknown as { email: string })?.email || '',
        full_name: (u.profiles as unknown as { full_name: string })?.full_name || '',
        license_type: 'standard',
        role: u.role,
      })),
      licenses: [],
      activity: (activity || []).map((a) => ({
        id: a.id,
        action: a.action,
        timestamp: a.created_at,
      })),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const orgId = id
    const { storage_limit, max_users, subscription_tier, is_active } = await request.json()

    const updateData: Record<string, unknown> = {}
    if (storage_limit !== undefined) updateData.storage_limit_bytes = storage_limit
    if (max_users !== undefined) updateData.max_users = max_users
    if (subscription_tier !== undefined) updateData.subscription_tier = subscription_tier
    if (is_active !== undefined) updateData.is_active = is_active

    const { data, error: updateError } = await serviceClient
      .from('organizations')
      .update(updateData)
      .eq('id', orgId)
      .select()
      .single()

    if (updateError || !data) {
      return NextResponse.json(
        { error: updateError?.message || 'Update failed' },
        { status: 400 }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}