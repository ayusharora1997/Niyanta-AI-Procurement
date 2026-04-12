import { useEffect, useState } from 'react';
import { hasSupabaseConfig, searchRunsTable, supabase, vendorsTable } from '../lib/supabase';

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
        const [{ count: searchRunsCount, error: searchRunsError }, { data: vendorRows, error: vendorsError }] = await Promise.all([
          supabase
            .from(searchRunsTable)
            .select('id', { count: 'exact', head: true }),
          supabase
            .from(vendorsTable)
            .select('vendor_id'),
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
        const totalVendorsDiscovered = new Set(
          (vendorRows ?? [])
            .map((row) => row.vendor_id)
            .filter((vendorId): vendorId is string => typeof vendorId === 'string' && vendorId.length > 0),
        ).size;
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
          table: searchRunsTable,
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
          table: vendorsTable,
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
