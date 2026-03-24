/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
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
    const userId = id

    // Fetch user profile
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select(
        `
        id,
        email,
        full_name,
        is_super_admin,
        is_active,
        created_at
      `
      )
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch user's organizations
    const { data: orgMemberships } = await serviceClient
      .from('organization_members')
      .select('organization_id, role, organizations(id, name)')
      .eq('user_id', userId)
      .limit(1)

    const organization = orgMemberships?.[0]?.organizations || { id: '', name: 'Not assigned' }

    // Fetch activity logs
    const { data: activity } = await serviceClient
      .from('audit_logs')
      .select('id, action, resource_type, timestamp')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(100)

    // Get last login from activity
    const lastLoginLog = activity?.find(
      (log: any) => log.action === 'login' || log.action === 'sign_in'
    )
    const lastLogin = lastLoginLog?.timestamp || null

    return NextResponse.json({
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      organization,
      role: orgMemberships?.[0]?.role || 'member',
      license_type: 'standard',
      is_super_admin: profile.is_super_admin,
      is_active: profile.is_active,
      created_at: profile.created_at,
      last_login: lastLogin,
      permissions: profile.is_super_admin
        ? [
          'manage_users',
          'manage_organizations',
          'manage_licenses',
          'view_diagnostics',
          'reset_passwords',
          'manage_settings',
        ]
        : ['manage_organization', 'manage_projects'],
      activity: (activity || []).map((a: any) => ({
        id: a.id,
        action: a.action,
        resource_type: a.resource_type,
        timestamp: a.timestamp,
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
    const userId = id
    const { is_super_admin, license_type, is_active } = await request.json()

    const updateData: Record<string, any> = {}
    if (is_super_admin !== undefined) updateData.is_super_admin = is_super_admin
    if (is_active !== undefined) updateData.is_active = is_active

    const { data, error: updateError } = await serviceClient
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
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