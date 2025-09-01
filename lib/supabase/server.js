// Supabase server-side clients
// - Service role client: use only on server (API routes, scripts). Never expose to client.
// - Anon client: use for server-side reads when RLS policies allow.

import { createClient } from '@supabase/supabase-js';

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
}

export function getServiceRoleClient() {
  const url = requiredEnv('SUPABASE_URL');
  const key = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getAnonClient() {
  const url = requiredEnv('SUPABASE_URL');
  const key = requiredEnv('SUPABASE_ANON_KEY');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
