// test change 123
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Check, Clock3, X } from 'lucide-react';
import { BadgeRisk, BadgeScore, Card, EmptyState, SectionLabel, Title } from '../components/ui/Shared';
import { mockVendors } from '../data/mockVendors';

type Decision = 'select' | 'tbd' | 'reject';

export function VendorReview() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'lowRisk'>('all');
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});

  const reviewQueue = useMemo(() => {
    return mockVendors.filter((vendor) => {
      if (!['new', 'tbd'].includes(vendor.status)) return false;
      if (activeFilter === 'high') return vendor.score >= 8;
      if (activeFilter === 'lowRisk') return vendor.riskLevel === 'low';
      return true;
    });
  }, [activeFilter]);

  const reviewedCount = Object.keys(decisions).length;
  const totalCount = reviewQueue.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Title>Vendor Review</Title>
          <p className="mt-2 text-[14px] text-[#666]">Showing vendors pending review. Approved vendors are expected to move into Vendor Master.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>All</FilterChip>
          <FilterChip active={activeFilter === 'high'} onClick={() => setActiveFilter('high')}>High Score</FilterChip>
          <FilterChip active={activeFilter === 'lowRisk'} onClick={() => setActiveFilter('lowRisk')}>Low Risk</FilterChip>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between text-[14px] font-[600] text-[#0a0a0a]">
          <span>Reviewed {reviewedCount} of {totalCount} vendors</span>
          <span className="text-[#888]">{Math.max(totalCount - reviewedCount, 0)} remaining</span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-[#f3f4f6]">
          <div className="h-1.5 rounded-full bg-[#0a0a0a]" style={{ width: totalCount === 0 ? '0%' : `${(reviewedCount / totalCount) * 100}%` }} />
        </div>
      </Card>

      {reviewQueue.length === 0 ? (
        <EmptyState title="No vendors to review" description="Your review queue is clear. New discovery results will appear here." />
      ) : (
        <div className="grid gap-6 xl:grid-cols-3 md:grid-cols-2">
          {reviewQueue.map((vendor) => {
            const decision = decisions[vendor.id];
            const decoration = decision === 'select'
              ? { border: 'border-l-[4px] border-l-[#059669]', badge: <DecisionBadge className="bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]"><Check className="h-4 w-4" /></DecisionBadge> }
              : decision === 'tbd'
                ? { border: 'border-l-[4px] border-l-[#9ca3af]', badge: <DecisionBadge className="bg-[#f9fafb] text-[#6b7280] border-[#e5e5e5]"><Clock3 className="h-4 w-4" /></DecisionBadge> }
                : decision === 'reject'
                  ? { border: 'border-l-[4px] border-l-[#dc2626]', badge: <DecisionBadge className="bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]"><X className="h-4 w-4" /></DecisionBadge> }
                  : { border: '', badge: null };

            return (
              <Card key={vendor.id} className={`relative rounded-[12px] ${decoration.border}`}>
                {decoration.badge}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[16px] font-[700] text-[#0a0a0a]">{vendor.name}</div>
                    <div className="mt-2 line-clamp-2 text-[14px] leading-6 text-[#666]">{vendor.product}</div>
                  </div>
                  <BadgeScore score={vendor.score} />
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <BadgeRisk level={vendor.riskLevel} />
                  <span className="text-[14px] text-[#888]">{vendor.location}</span>
                </div>

                <div className="mt-6">
                  <SectionLabel className="mb-2">AI Assessment</SectionLabel>
                  <div className="rounded-[6px] bg-[#fafafa] px-[14px] py-3 text-[13px] italic leading-6 text-[#404040]">{vendor.inference}</div>
                </div>

                {decision ? (
                  <div className={`mt-6 flex h-8 items-center justify-center rounded-[8px] text-[13px] font-[600] ${decision === 'select' ? 'bg-[#ecfdf5] text-[#065f46]' : decision === 'reject' ? 'bg-[#fef2f2] text-[#991b1b]' : 'bg-[#f9fafb] text-[#6b7280]'}`}>
                    Decision saved
                  </div>
                ) : (
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <ActionButton label="Select" hint="S" className="border-[#a7f3d0] bg-[#ecfdf5] text-[#065f46]" onClick={() => setDecisions((current) => ({ ...current, [vendor.id]: 'select' }))} />
                    <ActionButton label="TBD" hint="T" className="border-[#e5e5e5] bg-[#f9fafb] text-[#6b7280]" onClick={() => setDecisions((current) => ({ ...current, [vendor.id]: 'tbd' }))} />
                    <ActionButton label="Reject" hint="R" className="border-[#fca5a5] bg-[#fef2f2] text-[#991b1b]" onClick={() => setDecisions((current) => ({ ...current, [vendor.id]: 'reject' }))} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return <button type="button" onClick={onClick} className={`rounded-[8px] px-3 py-2 text-[13px] font-[600] ${active ? 'bg-[#0a0a0a] text-white' : 'border border-[#e5e5e5] bg-white text-[#404040]'}`}>{children}</button>;
}

function ActionButton({ label, hint, className, onClick }: { label: string; hint: string; className: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} title={`Shortcut: ${hint}`} className={`h-8 rounded-[8px] border text-[13px] font-[600] ${className}`}>
      {label}
    </button>
  );
}

function DecisionBadge({ children, className }: { children: ReactNode; className: string }) {
  return <div className={`absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border ${className}`}>{children}</div>;
}
