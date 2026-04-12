import { useEffect, useMemo, useRef, useState } from 'react';
<<<<<<< HEAD
import { AlertTriangle, CheckCircle2, CircleDashed, Radar, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from './ui/Shared';
import type { SearchProgressStatus } from '../hooks/useSearchProgress';

type SearchStatusProgressProps = {
  status: SearchProgressStatus;
=======
import { AlertTriangle, BrainCircuit, CircleCheckBig, LoaderCircle, SearchCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { SearchRunStatus } from '../hooks/useSearchProgress';

type SearchStatusProgressProps = {
  status: SearchRunStatus;
>>>>>>> 9af41d47 (Fix Sidebar context issue and standardize imports)
  enriched: number;
  total: number;
};

<<<<<<< HEAD
const statusCopy: Record<SearchProgressStatus, string> = {
  initiated: 'Initializing search...',
  scraping: 'Searching and extracting suppliers...',
  scoring: 'Analyzing and scoring suppliers...',
  completed: 'Analysis complete',
  failed: 'Something went wrong',
};

const stageStyles: Record<SearchProgressStatus, string> = {
  initiated: 'border-[#dbe7ff] bg-[#f5f9ff] text-[#2853b8]',
  scraping: 'border-[#d6e5ff] bg-[#f4f8ff] text-[#2d5bcb]',
  scoring: 'border-[#ece0ff] bg-[#faf5ff] text-[#7345d6]',
  completed: 'border-[#cdebd7] bg-[#f0fdf4] text-[#157347]',
  failed: 'border-[#f3d0d0] bg-[#fff5f5] text-[#b42318]',
};

const stageIcons = {
  initiated: CircleDashed,
  scraping: Radar,
  scoring: Sparkles,
  completed: CheckCircle2,
  failed: AlertTriangle,
} satisfies Record<SearchProgressStatus, typeof CircleDashed>;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function resolveProgress(status: SearchProgressStatus, enriched: number, total: number) {
  const computed = total > 0 ? (enriched / total) * 100 : 0;

  if (status === 'completed') return 100;
  if (status === 'failed') return clamp(computed || 12, 8, 95);
  if (status === 'initiated') return Math.max(5, computed);
  if (status === 'scraping') return clamp(Math.max(20, computed), 20, 40);
  return clamp(Math.max(40, computed), 40, 95);
}

function LoadingDots({ active }: { active: boolean }) {
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (!active) return;
    const interval = window.setInterval(() => {
      setCount((current) => (current % 3) + 1);
    }, 420);

    return () => window.clearInterval(interval);
  }, [active]);

  if (!active) return null;
  return <span className="inline-block w-4 text-left text-[#6b7280]">{'.'.repeat(count)}</span>;
}

function AnimatedCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const start = displayValue;
    const delta = value - start;
    if (delta === 0) return;

    const duration = 500;
    const startedAt = performance.now();
    let frame = 0;

    const step = (time: number) => {
      const progress = Math.min((time - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + delta * eased));
      if (progress < 1) {
        frame = window.requestAnimationFrame(step);
      }
    };

    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [displayValue, value]);

  useEffect(() => {
    setDisplayValue(value);
  }, []);

  return <>{displayValue}</>;
}

export function SearchStatusProgress({ status, enriched, total }: SearchStatusProgressProps) {
  const progress = useMemo(() => resolveProgress(status, enriched, total), [status, enriched, total]);
  const isActive = status === 'initiated' || status === 'scraping' || status === 'scoring';
  const Icon = stageIcons[status];
  const previousStatus = useRef<SearchProgressStatus | null>(null);

  useEffect(() => {
    if (status === 'completed' && previousStatus.current !== 'completed') {
=======
const statusConfig = {
  initiated: {
    label: 'Initializing search...',
    accent: 'from-sky-500 via-blue-500 to-indigo-500',
    icon: LoaderCircle,
    badge: 'STARTED',
  },
  scraping: {
    label: 'Searching and extracting suppliers...',
    accent: 'from-sky-500 via-blue-500 to-violet-500',
    icon: SearchCheck,
    badge: 'SCRAPING',
  },
  scoring: {
    label: 'Analyzing and scoring suppliers...',
    accent: 'from-blue-500 via-indigo-500 to-violet-500',
    icon: BrainCircuit,
    badge: 'SCORING',
  },
  completed: {
    label: 'Analysis complete',
    accent: 'from-emerald-500 via-teal-500 to-cyan-500',
    icon: CircleCheckBig,
    badge: 'COMPLETED',
  },
  failed: {
    label: 'Something went wrong',
    accent: 'from-rose-500 via-orange-500 to-amber-500',
    icon: AlertTriangle,
    badge: 'FAILED',
  },
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getProgressValue(status: SearchRunStatus, enriched: number, total: number) {
  const computed = total > 0 ? Math.round((enriched / total) * 100) : null;

  switch (status) {
    case 'initiated':
      return computed === null ? 5 : Math.max(5, computed);
    case 'scraping':
      return computed === null ? 30 : clamp(Math.max(20, computed), 20, 40);
    case 'scoring':
      return computed === null ? 72 : clamp(Math.max(40, computed), 40, 95);
    case 'completed':
      return 100;
    case 'failed':
      return computed === null ? 12 : Math.max(12, computed);
  }
}

function useAnimatedNumber(target: number) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    const start = value;
    const delta = target - start;

    if (delta === 0) {
      return;
    }

    const startedAt = performance.now();
    let frame = 0;

    const tick = (timestamp: number) => {
      const elapsed = timestamp - startedAt;
      const progress = Math.min(elapsed / 450, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(Math.round(start + delta * eased));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [target]);

  return value;
}

export function SearchStatusProgress({ status, enriched, total }: SearchStatusProgressProps) {
  const previousStatus = useRef<SearchRunStatus | null>(null);
  const shownCompletedToast = useRef(false);
  const displayedEnriched = useAnimatedNumber(enriched);
  const displayedTotal = useAnimatedNumber(total);
  const progress = useMemo(() => getProgressValue(status, enriched, total), [status, enriched, total]);
  const config = statusConfig[status];
  const Icon = config.icon;
  const showLoadingDots = status === 'scraping' || status === 'scoring';

  useEffect(() => {
    if (status === 'completed' && !shownCompletedToast.current) {
>>>>>>> 9af41d47 (Fix Sidebar context issue and standardize imports)
      toast.success('Search Completed 🎉', {
        description: `${total} suppliers analyzed successfully`,
        duration: 4000,
      });
<<<<<<< HEAD
    }
=======
      shownCompletedToast.current = true;
    }

    if (status !== 'completed' && previousStatus.current !== status) {
      shownCompletedToast.current = false;
    }

>>>>>>> 9af41d47 (Fix Sidebar context issue and standardize imports)
    previousStatus.current = status;
  }, [status, total]);

  return (
<<<<<<< HEAD
    <div className="relative overflow-hidden rounded-[24px] border border-[#e9ebf3] bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.12),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.1),_transparent_28%)]" />
      <div className="relative space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="text-[11px] font-[700] uppercase tracking-[0.18em] text-[#8b92a6]">Live Pipeline Status</div>
            <div className="flex items-center gap-3">
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl border shadow-[0_10px_30px_rgba(99,102,241,0.12)]', stageStyles[status])}>
                <Icon className={cn('h-5 w-5', isActive && 'animate-pulse')} />
              </div>
              <div>
                <div className="flex items-center text-[18px] font-[700] tracking-[-0.02em] text-[#111827]">
                  {statusCopy[status]}
                  <LoadingDots active={status === 'scraping' || status === 'scoring'} />
                </div>
                <div className="mt-1 text-[13px] text-[#6b7280]">
                  <AnimatedCounter value={enriched} /> / {total} suppliers processed
                </div>
              </div>
            </div>
          </div>
          <div className="inline-flex h-fit items-center rounded-full border border-[#e6e8ef] bg-white/85 px-3.5 py-2 text-[12px] font-[700] uppercase tracking-[0.12em] text-[#6b7280] shadow-[0_10px_24px_rgba(15,23,42,0.05)] backdrop-blur-sm">
            {status}
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[12px] font-[600] text-[#8b92a6]">
            <span>Discovery Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-[#edf1f7] shadow-[inset_0_1px_3px_rgba(15,23,42,0.08)]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] shadow-[0_8px_20px_rgba(99,102,241,0.35)] transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
            {isActive ? (
              <div
                className="absolute inset-y-0 w-24 rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)] opacity-80"
                style={{
                  left: `calc(${Math.max(progress - 18, 0)}% - 3rem)`,
                  transition: 'left 500ms ease-out',
                }}
              />
            ) : null}
          </div>
=======
    <div className="relative overflow-hidden rounded-[28px] border border-[#dfe7ff] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,247,255,0.95))] p-6 shadow-[0_18px_50px_rgba(69,96,176,0.14)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,143,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(87,179,255,0.12),transparent_28%)]" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-4">
          <div className="text-[11px] font-[700] uppercase tracking-[0.3em] text-[#7b8bb5]">
            Live Pipeline Status
          </div>
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/80 bg-white/80 shadow-[0_10px_24px_rgba(47,84,192,0.10)] backdrop-blur">
              <Icon className={`h-5 w-5 ${status === 'failed' ? 'text-[#f97316]' : status === 'completed' ? 'text-[#059669]' : 'text-[#4567ff]'} ${status === 'initiated' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-1 text-[31px] font-[700] leading-none tracking-[-0.03em] text-[#0a0f1f]">
                {config.label}
                {showLoadingDots ? (
                  <span className="inline-flex overflow-hidden text-[#6f7fc7]">
                    <span className="animate-pulse [animation-delay:0ms]">.</span>
                    <span className="animate-pulse [animation-delay:160ms]">.</span>
                    <span className="animate-pulse [animation-delay:320ms]">.</span>
                  </span>
                ) : null}
              </div>
              <div className="mt-3 text-[18px] text-[#55627f]">
                <span className="font-[700] text-[#22304d]">{displayedEnriched}</span>
                <span> / </span>
                <span className="font-[700] text-[#22304d]">{displayedTotal}</span>
                <span> suppliers processed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-full border border-white/70 bg-white/85 px-4 py-2 text-[14px] font-[700] tracking-[0.08em] text-[#7f88a6] shadow-[0_8px_24px_rgba(26,39,86,0.08)]">
          {config.badge}
        </div>
      </div>

      <div className="relative mt-8">
        <div className="mb-3 flex items-center justify-between text-[13px] font-[600] text-[#6d7a98]">
          <span>Discovery Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-[#e6ebf6] shadow-inner">
          <div className="absolute inset-0 animate-pulse bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)]" />
          <div
            className={`relative h-full rounded-full bg-gradient-to-r ${config.accent} transition-all duration-500 ease-out`}
            style={{ width: `${progress}%` }}
          />
>>>>>>> 9af41d47 (Fix Sidebar context issue and standardize imports)
        </div>
      </div>
    </div>
  );
}
