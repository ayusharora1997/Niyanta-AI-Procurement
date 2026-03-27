import type { ReactNode } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import type { RiskLevel } from '../../data/mockVendors';

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function Title({ children }: { children: ReactNode }) {
  return <h1 className="text-[24px] font-[700] text-[#0a0a0a]">{children}</h1>;
}

export function SectionLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('text-[11px] font-[600] uppercase tracking-[0.08em] text-[#888]', className)}>{children}</div>;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-[8px] border border-[#e5e5e5] bg-white p-6', className)}>{children}</div>;
}

export function BadgeScore({ score }: { score: number }) {
  const value = score >= 7
    ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]'
    : score >= 4
      ? 'bg-[#fffbeb] text-[#92400e] border-[#fcd34d]'
      : 'bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]';

  return (
    <span
      title={`Score: ${score}/10 - Based on compliance, rating, and trust indicators`}
      className={cn('inline-flex min-w-12 items-center justify-center rounded-full border px-2.5 py-1 text-[12px] font-[600]', value)}
    >
      {score.toFixed(1)}
    </span>
  );
}

export function BadgeRisk({ level }: { level: RiskLevel }) {
  const styles = {
    low: 'bg-[#ecfdf5] text-[#065f46]',
    medium: 'bg-[#fffbeb] text-[#92400e]',
    high: 'bg-[#fef2f2] text-[#991b1b]',
  } as const;

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-[600] capitalize', styles[level])}>
      {level} risk
    </span>
  );
}

export function PrimaryButton({
  children,
  className = '',
  onClick,
  type = 'button',
  disabled = false,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-11 items-center justify-center rounded-[8px] bg-[#0a0a0a] px-4 text-[14px] font-[600] text-white transition hover:bg-[#262626] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function OutlineButton({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('inline-flex h-10 items-center justify-center rounded-[8px] border border-[#e5e5e5] bg-white px-4 text-[14px] font-[500] text-[#0a0a0a] transition hover:bg-[#fafafa]', className)}
    >
      {children}
    </button>
  );
}

export function MetricCard({
  label,
  value,
  subtitle,
  borderColor,
  trend,
}: {
  label: string;
  value: string;
  subtitle: string;
  borderColor: string;
  trend: { direction: 'up' | 'down'; value: string };
}) {
  const trendColor = trend.direction === 'up' ? 'text-[#059669]' : 'text-[#dc2626]';

  return (
    <Card className="relative overflow-hidden p-0">
      <div className="h-full border-l-4 p-6" style={{ borderColor }}>
        <div className="mb-6 flex items-start justify-between">
          <div className="text-[12px] font-[600] uppercase tracking-[0.06em] text-[#888]">{label}</div>
          <div className={cn('flex items-center gap-1 text-[12px] font-[600]', trendColor)}>
            <ArrowUpRight className={cn('h-3.5 w-3.5', trend.direction === 'down' && 'rotate-90')} />
            {trend.value}
          </div>
        </div>
        <div className="text-[32px] font-[700] leading-none text-[#0a0a0a]">{value}</div>
        <div className="mt-2 text-[13px] text-[#888]">{subtitle}</div>
      </div>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
}: {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 rounded-full bg-[#f5f5f5] p-4">
        <Search className="h-8 w-8 text-[#c7c7c7]" />
      </div>
      <div className="text-[18px] font-[600] text-[#0a0a0a]">{title}</div>
      <div className="mt-2 max-w-[360px] text-[14px] leading-6 text-[#666]">{description}</div>
      {actionText && onAction ? <PrimaryButton className="mt-6" onClick={onAction}>{actionText}</PrimaryButton> : null}
    </div>
  );
}

export function StatusPill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-[600]', className)}>{children}</span>;
}
