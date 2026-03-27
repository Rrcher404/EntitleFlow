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

    // Fetch license definitions
    const { data: definitions } = await serviceClient
      .from('license_definitions')
      .select('*')
      .order('price_monthly_cents', { ascending: true })

    // Count users by license_type from profiles
    const { data: profiles } = await serviceClient
      .from('profiles')
      .select('license_type')

    const total_by_type: Record<string, number> = {}
    let total_active_licenses = 0

    if (profiles) {
      for (const profile of profiles) {
        const lt = profile.license_type || 'standard'
        total_by_type[lt] = (total_by_type[lt] || 0) + 1
        total_active_licenses += 1
      }
    }

    // Build features list from license capabilities
    const featuresByType: Record<string, string[]> = {
      admin: ['Full org management', 'User management', 'Audit trails', 'Password controls', 'All permissions'],
      project_manager: ['Create/manage projects', 'Assign tasks', 'Export reports', 'Comment management'],
      contributor: ['Respond to comments', 'Upload documents', 'Track tasks', 'View projects'],
      guest_viewer: ['Read-only access', 'View projects', 'View permits'],
    }

    // Format license definitions
    const license_definitions = (definitions || []).map((lic) => ({
      type: lic.license_type,
      display_name: lic.display_name,
      price: lic.price_monthly_cents / 100,
      description: lic.description || '',
      features: featuresByType[lic.license_type] || [],
      max_projects: lic.max_projects,
      max_permits_per_project: lic.max_permits_per_project,
      is_active: lic.is_active,
    }))

    // Calculate revenue projection from active licenses × monthly price × 12
    let revenue_projection = 0
    for (const lic of license_definitions) {
      const count = total_by_type[lic.type] || 0
      revenue_projection += count * lic.price * 12
    }

    // Generate simple assignment trends (last 30 days from profile created_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { data: recentProfiles } = await serviceClient
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    const trendMap: Record<string, number> = {}
    for (let i = 0; i < 30; i++) {
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      trendMap[d.toISOString().split('T')[0]] = 0
    }
    for (const p of recentProfiles || []) {
      const day = (p.created_at || '').split('T')[0]
      if (day && trendMap[day] !== undefined) {
        trendMap[day] += 1
      }
    }
    const assignment_trends = Object.entries(trendMap).map(([date, count]) => ({ date, count }))

    return NextResponse.json({
      total_by_type,
      total_active_licenses,
      revenue_projection,
      license_definitions,
      assignment_trends,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
