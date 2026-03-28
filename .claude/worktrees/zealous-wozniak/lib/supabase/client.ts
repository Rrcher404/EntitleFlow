import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../database.types';

/**
 * Creates a Supabase client for browser/client-side use.
 * Returns null if env vars are not configured (e.g., during build/prerender).
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createBrowserClient<Database>(url, key);
}
