import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role, full_name')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.organization_id) {
      return NextResponse.json(
        { error: 'User not part of an organization' },
        { status: 403 }
      );
    }

    const { data: members, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, role, created_at, updated_at')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: members,
      organization_id: profile.organization_id
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
