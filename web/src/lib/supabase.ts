import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { authStore } from './authStore';

export const DEFAULT_SUPABASE_URL = 'https://dykjepfsrndzamkkzcxf.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_K8HRl4YEkhw1hcztFjJ7kA_bWfWg-rT';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isFrontendSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
    supabaseAnonKey !== 'your-supabase-anon-key'
  );
};

/**
 * Singleton Supabase browser client configured with backend credentials
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Helper to fetch active JWT session access token from Supabase directly
 */
export async function getSupabaseToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      authStore.setToken(session.access_token);
      return session.access_token;
    }
  } catch (err) {
    console.warn('Failed to retrieve Supabase session token:', err);
  }
  return authStore.getToken();
}

// Automatically sync token to authStore when Supabase auth state changes
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    if (session?.access_token) {
      authStore.setToken(session.access_token);
    } else if (event === 'SIGNED_OUT') {
      authStore.clear();
    }
  });
}
