import { useEffect, useState } from 'react';
<<<<<<< HEAD
import { hasSupabaseConfig, searchRunsTable, supabase, vendorRunIdColumn, vendorSummaryColumn, vendorsTable } from '../lib/supabase';

export type SearchProgressStatus = 'initiated' | 'scraping' | 'scoring' | 'completed' | 'failed';

export interface SearchProgressSnapshot {
  status: SearchProgressStatus;
  enriched: number;
  total: number;
}

const defaultSnapshot: SearchProgressSnapshot = {
  status: 'initiated',
  enriched: 0,
  total: 0,
};

function normalizeStatus(value: unknown): SearchProgressStatus {
  if (value === 'initiated' || value === 'scraping' || value === 'scoring' || value === 'completed' || value === 'failed') {
    return value;
  }

  return 'initiated';
}

function buildFallbackFrames(total: number) {
  return [
    { delay: 700, snapshot: { status: 'scraping' as const, enriched: Math.max(1, Math.round(total * 0.2)), total } },
    { delay: 1450, snapshot: { status: 'scraping' as const, enriched: Math.max(2, Math.round(total * 0.45)), total } },
    { delay: 2450, snapshot: { status: 'scoring' as const, enriched: Math.max(3, Math.round(total * 0.72)), total } },
    { delay: 3600, snapshot: { status: 'scoring' as const, enriched: Math.max(4, Math.round(total * 0.9)), total } },
    { delay: 4700, snapshot: { status: 'completed' as const, enriched: total, total } },
  ];
}

export function useSearchProgress(searchRunId: string | null, totalHint = 0) {
  const [progress, setProgress] = useState<SearchProgressSnapshot>(defaultSnapshot);

  useEffect(() => {
    if (!searchRunId) {
      setProgress(defaultSnapshot);
      return;
    }

    const seededTotal = Math.max(totalHint, 1);

    if (!hasSupabaseConfig || !supabase) {
      setProgress({
        status: 'initiated',
        enriched: 0,
        total: seededTotal,
      });

      const timers = buildFallbackFrames(seededTotal).map(({ delay, snapshot }) =>
        window.setTimeout(() => {
          setProgress(snapshot);
        }, delay),
      );

      return () => timers.forEach((timer) => window.clearTimeout(timer));
    }

    let isMounted = true;

    const fetchSnapshot = async () => {
      let runQuery = supabase
        .from(searchRunsTable)
        .select('id, status, vendor_count_requested, run_id')
        .eq('run_id', searchRunId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let { data: runData, error: runError } = await runQuery;

      if ((!runData || runError) && /^\d+$/.test(searchRunId)) {
        const fallbackRunQuery = await supabase
          .from(searchRunsTable)
          .select('id, status, vendor_count_requested, run_id')
          .eq('id', Number(searchRunId))
          .limit(1)
          .maybeSingle();

        runData = fallbackRunQuery.data;
        runError = fallbackRunQuery.error;
      }

      if (runError) {
        throw runError;
      }

      if (!runData) {
        if (!isMounted) return;
        setProgress({
          status: 'initiated',
          enriched: 0,
          total: seededTotal,
        });
        return;
      }

      const vendorRunValue = typeof runData.run_id === 'string' && runData.run_id.length > 0
        ? runData.run_id
        : searchRunId;

      const totalFromRun = typeof runData.vendor_count_requested === 'number'
        ? runData.vendor_count_requested
        : Number(runData.vendor_count_requested ?? 0);

      const [{ count: vendorCount, error: vendorCountError }, { count: enrichedCount, error: enrichedCountError }] = await Promise.all([
        supabase
          .from(vendorsTable)
          .select('*', { count: 'exact', head: true })
          .eq(vendorRunIdColumn, vendorRunValue),
        supabase
          .from(vendorsTable)
          .select('*', { count: 'exact', head: true })
          .eq(vendorRunIdColumn, vendorRunValue)
          .not(vendorSummaryColumn, 'is', null),
      ]);

      if (vendorCountError) {
        throw vendorCountError;
      }

      if (enrichedCountError) {
        throw enrichedCountError;
      }

      if (!isMounted) return;

      setProgress({
        status: normalizeStatus(runData.status),
        total: totalFromRun > 0 ? totalFromRun : (vendorCount ?? 0),
=======
import { hasSupabaseConfig, supabase } from '../lib/supabase';

export type SearchRunStatus = 'initiated' | 'scraping' | 'scoring' | 'completed' | 'failed';

export type SearchProgressSnapshot = {
  status: SearchRunStatus;
  total: number;
  enriched: number;
};

const defaultSnapshot: SearchProgressSnapshot = {
  status: 'initiated',
  total: 0,
  enriched: 0,
};

function isSearchRunStatus(value: unknown): value is SearchRunStatus {
  return value === 'initiated'
    || value === 'scraping'
    || value === 'scoring'
    || value === 'completed'
    || value === 'failed';
}

export function useSearchProgress(searchRunId: string | null, totalHint = 0) {
  const [progress, setProgress] = useState<SearchProgressSnapshot>({
    ...defaultSnapshot,
    total: totalHint,
  });

  useEffect(() => {
    if (!searchRunId) {
      setProgress({
        ...defaultSnapshot,
        total: totalHint,
      });
      return;
    }

    if (!hasSupabaseConfig || !supabase) {
      setProgress({
        status: 'initiated',
        total: totalHint,
        enriched: 0,
      });
      return;
    }

    let alive = true;

    const fetchProgress = async () => {
      const numericRunId = /^\d+$/.test(searchRunId) ? Number(searchRunId) : null;

      let searchRunQuery = supabase
        .from('search_runs')
        .select('id, status, vendor_count_requested, run_id')
        .eq('run_id', searchRunId)
        .maybeSingle();

      if (numericRunId !== null) {
        searchRunQuery = supabase
          .from('search_runs')
          .select('id, status, vendor_count_requested, run_id')
          .eq('id', numericRunId)
          .maybeSingle();
      }

      const { data: searchRun, error: searchRunError } = await searchRunQuery;

      if (searchRunError) {
        throw searchRunError;
      }

      if (!searchRun) {
        return;
      }

      const [{ count: totalCount, error: totalError }, { count: enrichedCount, error: enrichedError }] = await Promise.all([
        supabase
          .from('vendors')
          .select('id', { count: 'exact', head: true })
          .eq('search_run_id', searchRun.id),
        supabase
          .from('vendors')
          .select('id', { count: 'exact', head: true })
          .eq('search_run_id', searchRun.id)
          .eq('pipeline_status', 'enriched'),
      ]);

      if (totalError) {
        throw totalError;
      }

      if (enrichedError) {
        throw enrichedError;
      }

      if (!alive) {
        return;
      }

      setProgress({
        status: isSearchRunStatus(searchRun.status) ? searchRun.status : 'initiated',
        total: totalCount ?? Number(searchRun.vendor_count_requested ?? totalHint ?? 0),
>>>>>>> 9af41d47 (Fix Sidebar context issue and standardize imports)
        enriched: enrichedCount ?? 0,
      });
    };

<<<<<<< HEAD
    void fetchSnapshot();

    const channel = supabase
      .channel(`search-progress:${searchRunId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: searchRunsTable, filter: `run_id=eq.${searchRunId}` },
        () => {
          void fetchSnapshot();
=======
    void fetchProgress();

    const channel = supabase
      .channel(`search-progress-${searchRunId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'search_runs',
          filter: /^\d+$/.test(searchRunId) ? `id=eq.${searchRunId}` : `run_id=eq.${searchRunId}`,
        },
        () => {
          void fetchProgress();
>>>>>>> 9af41d47 (Fix Sidebar context issue and standardize imports)
        },
      )
      .on(
        'postgres_changes',
<<<<<<< HEAD
        { event: '*', schema: 'public', table: vendorsTable, filter: `${vendorRunIdColumn}=eq.${searchRunId}` },
        () => {
          void fetchSnapshot();
=======
        {
          event: '*',
          schema: 'public',
          table: 'vendors',
          filter: /^\d+$/.test(searchRunId) ? `search_run_id=eq.${searchRunId}` : '',
        },
        () => {
          void fetchProgress();
>>>>>>> 9af41d47 (Fix Sidebar context issue and standardize imports)
        },
      )
      .subscribe();

    return () => {
<<<<<<< HEAD
      isMounted = false;
=======
      alive = false;
>>>>>>> 9af41d47 (Fix Sidebar context issue and standardize imports)
      void supabase.removeChannel(channel);
    };
  }, [searchRunId, totalHint]);

  return progress;
}
