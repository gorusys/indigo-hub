import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "./env";

let _admin: SupabaseClient | null = null;
let _public: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient {
  if (!_admin) {
    const env = getServerEnv();
    _admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return _admin;
}

export function getSupabasePublicClient(): SupabaseClient {
  if (!_public) {
    const env = getServerEnv();
    _public = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return _public;
}
