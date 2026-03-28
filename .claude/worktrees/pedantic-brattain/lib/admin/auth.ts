import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

export interface AdminVerifyResult {
  error: string | null;
  admin: {
    id: string;
    full_name: string;
    email: string;
    is_super_admin: boolean | null;
  } | null;
  serviceClient: ReturnType<typeof createClient<Database>> | null;
}

export async function verifyAdmin(): Promise<AdminVerifyResult> {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    return { error: 'Server not configured', admin: null, serviceClient: null };
  }

  // Get the current user from the anon client (with cookies)
  const anonClient = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await anonClient.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated', admin: null, serviceClient: null };
  }

  // Use service_role to check admin status (bypasses RLS)
  const serviceClient = createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: profile, error: profileError } = await serviceClient
    .from('profiles')
    .select('id, full_name, email, is_super_admin')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { error: 'Profile not found', admin: null, serviceClient: null };
  }

  if (!profile.is_super_admin) {
    return { error: 'Not authorized', admin: null, serviceClient: null };
  }

  return { error: null, admin: profile, serviceClient };
}
