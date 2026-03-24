/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { createServerSupabaseClient, getSupabaseAdminClient } from '@/lib/supabase/server';
import type { Database } from '../database.types';

export interface CompanyAdminVerifyResult {
  error: string | null;
  admin: {
    id: string;
    full_name: string;
    email: string;
    organization_id: string;
    role: string | null;
    license_type: string | null;
  } | null;
  serviceClient: ReturnType<typeof getSupabaseAdminClient> | null;
}

/**
 * Verifies that the user is a company admin (organization-scoped admin)
 * Checks for: role='admin' OR role='owner' OR license_type='admin'
 */
export async function verifyCompanyAdmin(): Promise<CompanyAdminVerifyResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated', admin: null, serviceClient: null };
    }

    // Get user profile with org info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, organization_id, role, license_type')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return { error: 'Profile not found', admin: null, serviceClient: null };
    }

    // Check if user is an organization admin
    const isAdmin = profile.role === 'admin' || 
                    profile.role === 'owner' || 
                    profile.license_type === 'admin';

    if (!isAdmin) {
      return {
        error: 'Not authorized - company admin required',
        admin: null,
        serviceClient: null
      };
    }

    const serviceClient = getSupabaseAdminClient();
    if (!serviceClient) {
      return {
        error: 'Service client not initialized',
        admin: null,
        serviceClient: null
      };
    }

    return {
      error: null,
      admin: {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        organization_id: profile.organization_id,
        role: profile.role,
        license_type: profile.license_type,
      },
      serviceClient,
    };
  } catch (err) {
    console.error('Error verifying company admin:', err);
    return {
      error: 'Internal server error',
      admin: null,
      serviceClient: null
    };
  }
}
