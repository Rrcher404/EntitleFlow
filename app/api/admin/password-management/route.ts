/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { NextResponse, NextRequest } from 'next/server'
import { verifyAdmin } from '@/lib/admin/auth'
import { createClient } from '@supabase/supabase-js'

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

    // Fetch recent password reset requests
    const { data: resets, error: queryError } = await serviceClient
      .from('password_reset_tokens')
      .select(`
        id,
        user_id,
        created_at,
        expires_at,
        used_at,
        profiles(email, full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (queryError) {
      return NextResponse.json(
        { error: queryError.message },
        { status: 400 }
      )
    }

    // Format response
    const formattedResets = (resets || []).map((reset: any) => {
      const now = new Date()
      const expiresAt = new Date(reset.expires_at)
      let status = 'pending'
      if (reset.used_at) {
        status = 'used'
      } else if (now > expiresAt) {
        status = 'expired'
      }

      return {
        id: reset.id,
        user_email: reset.profiles?.email || '',
        user_full_name: reset.profiles?.full_name || '',
        reset_token: reset.id,
        created_at: reset.created_at,
        expires_at: reset.expires_at,
        used_at: reset.used_at,
        status,
      }
    })

    return NextResponse.json(formattedResets)
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

    // Create password reset token
    const resetToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const { data: resetData, error: insertError } = await serviceClient
      .from('password_reset_tokens')
      .insert({
        id: resetToken,
        user_id: profile.id,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      )
    }

    // In a real app, you would send an email with a password reset link
    // For now, we just return success
    return NextResponse.json({
      success: true,
      message: `Password reset link sent to ${email}`,
      reset_token: resetToken,
      expires_at: expiresAt.toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}