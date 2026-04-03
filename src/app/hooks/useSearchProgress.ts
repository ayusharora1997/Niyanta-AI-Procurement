import { useEffect, useState } from 'react';

export type SearchProgressStatus = 'initiated' | 'scraping' | 'scoring' | 'completed' | 'failed';

export interface SearchProgressSnapshot {
  status: SearchProgressStatus;
  enriched: number;
  total: number;
}

type SearchProgressFetcher = (searchRunId: string) => Promise<SearchProgressSnapshot | null>;

const defaultSnapshot: SearchProgressSnapshot = {
  status: 'initiated',
  enriched: 0,
  total: 0,
};

export function useSearchProgress(
  searchRunId: string | null,
  totalHint = 0,
  fetcher?: SearchProgressFetcher,
  pollIntervalMs = 2000,
) {
  const [progress, setProgress] = useState<SearchProgressSnapshot>(defaultSnapshot);

  useEffect(() => {
    if (!searchRunId) {
      setProgress(defaultSnapshot);
      return;
    }

    const seededTotal = Math.max(totalHint, 1);

    if (fetcher) {
      let isMounted = true;

      const fetchProgress = async () => {
        try {
          const snapshot = await fetcher(searchRunId);
          if (!snapshot || !isMounted) return;
          setProgress({
            status: snapshot.status,
            enriched: snapshot.enriched,
            total: snapshot.total,
          });
        } catch {
          if (!isMounted) return;
          setProgress((current) => ({
            ...current,
            status: 'failed',
          }));
        }
      };

      void fetchProgress();
      const interval = window.setInterval(fetchProgress, pollIntervalMs);

      return () => {
        isMounted = false;
        window.clearInterval(interval);
      };
    }

    setProgress({
      status: 'initiated',
      enriched: 0,
      total: seededTotal,
    });

    const phaseFrames = [
      { delay: 700, snapshot: { status: 'scraping' as const, enriched: Math.max(1, Math.round(seededTotal * 0.2)), total: seededTotal } },
      { delay: 1450, snapshot: { status: 'scraping' as const, enriched: Math.max(2, Math.round(seededTotal * 0.45)), total: seededTotal } },
      { delay: 2450, snapshot: { status: 'scoring' as const, enriched: Math.max(3, Math.round(seededTotal * 0.72)), total: seededTotal } },
      { delay: 3600, snapshot: { status: 'scoring' as const, enriched: Math.max(4, Math.round(seededTotal * 0.9)), total: seededTotal } },
      { delay: 4700, snapshot: { status: 'completed' as const, enriched: seededTotal, total: seededTotal } },
    ];

    const timers = phaseFrames.map(({ delay, snapshot }) =>
      window.setTimeout(() => {
        setProgress(snapshot);
      }, delay),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [fetcher, pollIntervalMs, searchRunId, totalHint]);

  return progress;
}
