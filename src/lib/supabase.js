import { createClient } from '@supabase/supabase-js';

// Guaranteed direct production configuration with static import.meta.env resolution for Vite
const DEFAULT_SUPABASE_URL = 'https://riceqkznjftwadulwbcm.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_YfklaQ7X4Ph9SKTCuldItw_jDnMJnlp';

// Note: Vite replaces import.meta.env.VITE_... as a static string at build time
const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  DEFAULT_SUPABASE_URL;

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
