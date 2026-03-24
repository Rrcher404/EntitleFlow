/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
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

    // Fetch all licenses
    const { data: licenses } = await serviceClient
      .from('licenses')
      .select('id, type, price, description, features')

    // Fetch license assignments
    const { data: assignments } = await serviceClient
      .from('user_licenses')
      .select('license_type, count(*)')
      .order('license_type')

    // Calculate stats
    const total_by_type: Record<string, number> = {}
    let total_active_licenses = 0
    let revenue_projection = 0

    if (assignments) {
      for (const assignment of assignments) {
        const count = (assignment as any).count || 0
        total_by_type[assignment.license_type] = count
        total_active_licenses += count

        const license = licenses?.find((l: any) => l.type === assignment.license_type)
        if (license) {
          revenue_projection += count * license.price * 12 // Annual projection
        }
      }
    }

    // Fetch assignment trends (last 30 days)
    const { data: trends } = await serviceClient
      .from('license_assignment_log')
      .select('assigned_date, count')
      .gte('assigned_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('assigned_date', { ascending: true })

    // Format license definitions
    const license_definitions = (licenses || []).map((lic: any) => ({
      type: lic.type,
      price: lic.price || 0,
      description: lic.description || '',
      features: lic.features || [],
    }))

    // Format trends
    const assignment_trends = (trends || []).map((trend: any) => ({
      date: new Date(trend.assigned_date).toLocaleDateString(),
      count: trend.count || 0,
    }))

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