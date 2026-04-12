import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, CircleDashed, Radar, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from './ui/Shared';
import type { SearchProgressStatus } from '../hooks/useSearchProgress';

type SearchStatusProgressProps = {
  status: SearchProgressStatus;
  enriched: number;
  total: number;
};

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
      toast.success('Search Completed 🎉', {
        description: `${total} suppliers analyzed successfully`,
        duration: 4000,
      });
    }
    previousStatus.current = status;
  }, [status, total]);

  return (
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
        </div>
      </div>
    </div>
  );
}
