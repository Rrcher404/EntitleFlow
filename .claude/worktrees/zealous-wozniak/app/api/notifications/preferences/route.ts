import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';

const DEFAULT_PREFERENCES = {
  in_app: true,
  email: true,
  email_digest: true
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('profile_id', user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!preferences || preferences.length === 0) {
      return NextResponse.json({
        data: {
          profile_id: user.id,
          preferences: DEFAULT_PREFERENCES
        }
      });
    }

    const preferencesMap = preferences.reduce((acc: Record<string, any>, pref: any) => {
      acc[pref.notification_type] = {
        in_app: pref.in_app !== false,
        email: pref.email !== false,
        email_digest: pref.email_digest !== false
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      data: {
        profile_id: user.id,
        preferences: preferencesMap
      }
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notification_type, in_app, email, email_digest } = body;

    if (!notification_type) {
      return NextResponse.json(
        { error: 'notification_type is required' },
        { status: 400 }
      );
    }

    const adminClient = getSupabaseAdminClient();

    const updateData: any = {
      profile_id: user.id,
      notification_type,
      updated_at: new Date().toISOString()
    };

    if (in_app !== undefined) {
      updateData.in_app = in_app;
    }
    if (email !== undefined) {
      updateData.email = email;
    }
    if (email_digest !== undefined) {
      updateData.email_digest = email_digest;
    }

    const { data: existingPrefs } = await supabase
      .from('notification_preferences')
      .select('id')
      .eq('profile_id', user.id)
      .eq('notification_type', notification_type)
      .single();

    let result;
    if (existingPrefs) {
      result = await (adminClient as any)
        .from('notification_preferences')
        .update(updateData)
        .eq('id', existingPrefs.id)
        .select();
    } else {
      result = await (adminClient as any)
        .from('notification_preferences')
        .insert({
          ...updateData,
          created_at: new Date().toISOString()
        })
        .select();
    }

    const { data, error } = result;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data?.[0] || updateData
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
