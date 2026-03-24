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
      .select('id, name, slug, company_type, created_at, subscription_tier, storage_used, storage_limit, max_users, is_active')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Fetch users in organization
    const { data: users, error: usersError } = await serviceClient
      .from('organization_members')
      .select(
        `
        id,
        role,
        profiles(id, email, full_name),
        organizations(id, name)
      `
      )
      .eq('organization_id', orgId)

    // Fetch licenses for this org
    const { data: licenses, error: licensesError } = await serviceClient
      .from('organization_licenses')
      .select('license_type, count')
      .eq('organization_id', orgId)

    // Fetch activity logs
    const { data: activity, error: activityError } = await serviceClient
      .from('audit_logs')
      .select('id, action, timestamp, profiles(email)')
      .eq('organization_id', orgId)
      .order('timestamp', { ascending: false })
      .limit(50)

    // Get user count
    const { count: userCount } = await serviceClient
      .from('organization_members')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)

    return NextResponse.json({
      id: org.id,
      name: org.name,
      slug: org.slug,
      type: org.company_type,
      created_at: org.created_at,
      subscription_tier: org.subscription_tier,
      storage_used: org.storage_used || 0,
      storage_limit: org.storage_limit || 0,
      max_users: org.max_users || 0,
      user_count: userCount || 0,
      is_active: org.is_active,
      users: (users || []).map((u: any) => ({
        id: u.id,
        email: u.profiles?.email || '',
        full_name: u.profiles?.full_name || '',
        license_type: 'standard',
        role: u.role,
      })),
      licenses: licenses || [],
      activity: (activity || []).map((a: any) => ({
        id: a.id,
        action: a.action,
        timestamp: a.timestamp,
        user_email: a.profiles?.email || 'Unknown',
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

    const updateData: Record<string, any> = {}
    if (storage_limit !== undefined) updateData.storage_limit = storage_limit
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