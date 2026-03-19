import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createJsClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

// Authenticated server client (uses cookies for user session)
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // ignore in Server Components
          }
        },
      },
    },
  );
}

// Admin client (service role, no cookies, for server-only operations)
let cachedAdminClient: ReturnType<typeof createJsClient> | null = null;

export function getSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  if (!cachedAdminClient) {
    cachedAdminClient = createJsClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return cachedAdminClient;
}
