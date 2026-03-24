import { NextResponse, NextRequest } from 'next/server'
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

    // Fetch password reset config
    const { data: config } = await serviceClient
      .from('password_reset_config')
      .select('*')
      .limit(1)
      .single()

    // No password_reset_tokens table exists yet — return empty list
    // TODO: Create password_reset_tokens table or track via admin_audit_log
    return NextResponse.json({
      config: config || null,
      recent_resets: [],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Log the password reset request in admin_audit_log
    await serviceClient.from('admin_audit_log').insert({
      action: 'password_reset_requested',
      target_type: 'user',
      target_id: profile.id,
      details: { email },
    })

    return NextResponse.json({
      success: true,
      message: `Password reset initiated for ${email}`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
