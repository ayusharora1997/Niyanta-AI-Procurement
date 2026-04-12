import { useEffect, useState } from 'react';
<<<<<<< HEAD
import { hasSupabaseConfig, searchRunsTable, supabase, vendorsTable } from '../lib/supabase';
=======
import { hasSupabaseConfig, supabase } from '../lib/supabase';
>>>>>>> 9af41d47 (Fix Sidebar context issue and standardize imports)

export type DiscoveryStatsSnapshot = {
  totalSearchesRun: number;
  totalVendorsDiscovered: number;
  avgVendorsPerSearch: number;
};

const defaultStats: DiscoveryStatsSnapshot = {
  totalSearchesRun: 0,
  totalVendorsDiscovered: 0,
  avgVendorsPerSearch: 0,
};

export function useDiscoveryStats(fallback: DiscoveryStatsSnapshot = defaultStats) {
  const [stats, setStats] = useState<DiscoveryStatsSnapshot>(fallback);

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      setStats(fallback);
      return;
    }

    let alive = true;

    const fetchStats = async () => {
      try {
<<<<<<< HEAD
        const [{ count: searchRunsCount, error: searchRunsError }, { data: vendorRows, error: vendorsError }] = await Promise.all([
          supabase
            .from(searchRunsTable)
            .select('id', { count: 'exact', head: true }),
          supabase
            .from(vendorsTable)
            .select('vendor_id'),
=======
        const [{ count: searchRunsCount, error: searchRunsError }, { count: vendorsCount, error: vendorsError }] = await Promise.all([
          supabase
            .from('search_runs')
            .select('id', { count: 'exact', head: true }),
          supabase
            .from('vendors')
            .select('id', { count: 'exact', head: true }),
>>>>>>> 9af41d47 (Fix Sidebar context issue and standardize imports)
        ]);

        if (searchRunsError) {
          throw searchRunsError;
        }

        if (vendorsError) {
          throw vendorsError;
        }

        if (!alive) {
          return;
        }

        const totalSearchesRun = searchRunsCount ?? 0;
<<<<<<< HEAD
        const totalVendorsDiscovered = new Set(
          (vendorRows ?? [])
            .map((row) => row.vendor_id)
            .filter((vendorId): vendorId is string => typeof vendorId === 'string' && vendorId.length > 0),
        ).size;
=======
        const totalVendorsDiscovered = vendorsCount ?? 0;
>>>>>>> 9af41d47 (Fix Sidebar context issue and standardize imports)
        const avgVendorsPerSearch = totalSearchesRun === 0
          ? 0
          : totalVendorsDiscovered / totalSearchesRun;

        setStats({
          totalSearchesRun,
          totalVendorsDiscovered,
          avgVendorsPerSearch,
        });
      } catch {
        if (!alive) {
          return;
        }

        setStats(fallback);
      }
    };

    void fetchStats();

    const channel = supabase
      .channel('discovery-summary-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
<<<<<<< HEAD
          table: searchRunsTable,
=======
          table: 'search_runs',
>>>>>>> 9af41d47 (Fix Sidebar context issue and standardize imports)
        },
        () => {
          void fetchStats();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
<<<<<<< HEAD
          table: vendorsTable,
=======
          table: 'vendors',
>>>>>>> 9af41d47 (Fix Sidebar context issue and standardize imports)
        },
        () => {
          void fetchStats();
        },
      )
      .subscribe();

    return () => {
      alive = false;
      void supabase.removeChannel(channel);
    };
  }, [fallback.totalSearchesRun, fallback.totalVendorsDiscovered, fallback.avgVendorsPerSearch]);

  return stats;
}
