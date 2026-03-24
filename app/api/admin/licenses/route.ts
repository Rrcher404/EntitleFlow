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

    // Format license definitions
    const license_definitions = (definitions || []).map((lic) => ({
      type: lic.license_type,
      display_name: lic.display_name,
      price: lic.price_monthly_cents / 100,
      description: lic.description || '',
      max_projects: lic.max_projects,
      max_permits_per_project: lic.max_permits_per_project,
      is_active: lic.is_active,
    }))

    return NextResponse.json({
      total_by_type,
      total_active_licenses,
      revenue_projection: 0,
      license_definitions,
      assignment_trends: [],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
