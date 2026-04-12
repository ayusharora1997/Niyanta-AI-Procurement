import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const searchRunsTable = import.meta.env.VITE_SUPABASE_SEARCH_RUNS_TABLE ?? 'search_runs';
export const vendorsTable = import.meta.env.VITE_SUPABASE_VENDORS_TABLE ?? 'vendors';
export const vendorRunIdColumn = import.meta.env.VITE_SUPABASE_VENDOR_RUN_ID_COLUMN ?? 'run_id';
export const vendorSummaryColumn = import.meta.env.VITE_SUPABASE_VENDOR_SUMMARY_COLUMN ?? 'vendor_summary';

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;
