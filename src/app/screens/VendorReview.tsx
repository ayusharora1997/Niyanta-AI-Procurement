import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search, Trophy, Calendar, ChevronDown, ExternalLink, MapPin, Globe } from 'lucide-react';
import { Card, EmptyState, SectionLabel, Title, cn } from '../components/ui/Shared';
import { supabase } from '../lib/supabase';
import { useSidebar } from '@/app/components/ui/sidebar';
import { format } from 'date-fns';

type Decision = 'selected' | 'rejected' | 'considerable';

interface VendorDB {
  id: number;
  company_name: string;
  product_search: string;
  fetch_datetime: string;
  address: string;
  website: string;
  website_other_products: string;
  google_maps_link: string;
  phone: string;
  score: number;
  risk: string;
  Sentiment: string;
  risk_summary: string;
  "Sentiment Summary": string;
  inference: string;
  pipeline_status?: string;
}

interface GroupedData {
  keyword: string;
  fetchTime: string;
  vendors: VendorDB[];
  avgScore: number;
  counts: {
    total: number;
    scored: number;
    reviewed: number;
    unreviewed: number;
  };
}

export function VendorReview() {
  const [vendors, setVendors] = useState<VendorDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<number, Decision>>({});

  useEffect(() => {
    async function fetchData() {
      if (!supabase) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('fetch_datetime', { ascending: false });

      if (data) setVendors(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const groups = useMemo(() => {
    const g: Record<string, VendorDB[]> = {};
    vendors.forEach(v => {
      const key = v.product_search || 'Unknown Search';
      if (!g[key]) g[key] = [];
      g[key].push(v);
    });

    return Object.entries(g).map(([keyword, list]): GroupedData => {
      const reviewedIds = Object.keys(decisions).map(Number);
      const reviewedCount = list.filter(v => reviewedIds.includes(v.id)).length;
      const scoredVendors = list.filter(v => (v.score || 0) > 0);
      const avgScore = scoredVendors.length > 0
        ? scoredVendors.reduce((sum, v) => sum + v.score, 0) / scoredVendors.length
        : 0;

      return {
        keyword,
        fetchTime: list[0]?.fetch_datetime,
        vendors: list,
        avgScore,
        counts: {
          total: list.length,
          scored: scoredVendors.length,
          reviewed: reviewedCount,
          unreviewed: list.length - reviewedCount
        }
      };
    });
  }, [vendors, decisions]);

  if (loading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
        <p className="mt-4 text-[13px] font-medium text-slate-500">Retrieving intelligence batches...</p>
      </div>
    );
  }

  if (selectedGroup) {
    const groupData = groups.find(g => g.keyword === selectedGroup);
    return (
      <DetailView
        group={groupData!}
        onBack={() => setSelectedGroup(null)}
        decisions={decisions}
        onDecision={(id, d) => setDecisions(prev => ({ ...prev, [id]: d }))}
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-10 py-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-slate-200 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            Procurement / <span className="text-slate-900">Review Queue</span>
          </div>
          <Title>Vendor Review Summary</Title>
          <p className="max-w-[600px] text-[14px] text-slate-500 font-normal">
            Analyze sourced clusters from AI discovery. Expand a search to see recommendations or view details to complete the audit.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-md border border-slate-200 text-[12px] font-bold text-slate-600">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            Vendors {vendors.length}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-md border border-slate-200 text-[12px] font-bold text-slate-600">
            <div className="h-2 w-2 rounded-full bg-slate-400" />
            Searches {groups.length}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-12 px-6 py-3 text-[11px] font-bold text-slate-400 tracking-wider">
          <div className="col-span-4">Search Keyword</div>
          <div className="col-span-3">Discovery Date</div>
          <div className="col-span-4 text-center">Batch Status</div>
          <div className="col-span-1" />
        </div>

        <div className="flex flex-col gap-2">
          {groups.map((group) => (
            <GroupSummaryRow
              key={group.keyword}
              group={group}
              decisions={decisions}
              onDecision={(id, d) => setDecisions(prev => ({ ...prev, [id]: d }))}
              onViewDetail={() => setSelectedGroup(group.keyword)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function GroupSummaryRow({ group, decisions, onDecision, onViewDetail }: {
  group: GroupedData;
  decisions: Record<number, Decision>;
  onDecision: (id: number, d: Decision) => void;
  onViewDetail: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const top3 = [...group.vendors]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 3);

  return (
    <div className="group border border-slate-200 bg-white rounded-lg transition-all hover:border-slate-300 overflow-hidden">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="grid grid-cols-12 items-center px-6 py-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
      >
        <div className="col-span-4 flex items-center gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-600">
            <Search className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-slate-900 truncate max-w-[240px]">{group.keyword}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded flex">
                Best Score: {top3[0]?.score?.toFixed(1)}
              </span>
              <span className="text-[10px] items-center gap-1 font-bold text-blue-600 bg-blue-50 px-1.5 rounded flex">
                Avg Score: {group.avgScore.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="col-span-3">
          <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {group.fetchTime ? format(new Date(group.fetchTime), 'MMM d, yyyy') : 'N/A'}
          </div>
        </div>

        <div className="col-span-4 flex items-center justify-center gap-12">
          <StatusMetric label="Vendors Identified" value={group.counts.scored} />
          <StatusMetric label="Vendors Reviewed" value={`${group.counts.reviewed}/${group.counts.total}`} isAlert={group.counts.unreviewed > 0} />
        </div>

        <div className="col-span-1 flex justify-end">
          <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", isExpanded && "rotate-180")} />
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-50 bg-slate-50/30 animate-in slide-in-from-top-2 duration-200">
          <div className="mb-4">
            <div className="text-[10px] font-bold text-slate-400 tracking-widest mb-3 flex items-center gap-2">
              <Trophy className="h-3 w-3 text-slate-400" />
              Top 3 Intelligence Results
            </div>
            <div className="grid gap-2">
              {top3.map((v, i) => {
                const decision = decisions[v.id];
                return (
                  <div key={v.id} className="flex items-center justify-between py-2.5 px-4 bg-white border border-slate-200 rounded-md shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-bold text-slate-300 w-4">{i + 1}</span>
                      <span className="text-[13px] font-semibold text-slate-700">{v.company_name}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-[11px] text-slate-500 font-bold tracking-tight">{v.risk} risk</div>
                      <div className="h-7 w-12 flex items-center justify-center bg-slate-100 rounded text-[13px] font-black text-slate-900 border border-slate-200">
                        {v.score?.toFixed(1)}
                      </div>

                      {decision ? (
                        <div className={cn(
                          "min-w-[80px] text-center text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border",
                          decision === 'selected' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            decision === 'rejected' ? "bg-red-50 text-red-600 border-red-100" : "bg-amber-50 text-amber-600 border-amber-100"
                        )}>
                          {decision}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <MiniActionButton label="Select" color="emerald" onClick={() => onDecision(v.id, 'selected')} />
                          <MiniActionButton label="Hold" color="amber" onClick={() => onDecision(v.id, 'considerable')} />
                          <MiniActionButton label="Reject" color="red" onClick={() => onDecision(v.id, 'rejected')} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetail(); }}
            className="w-full flex items-center justify-center gap-2 py-2 text-[12px] font-bold text-slate-600 border border-slate-200 bg-white rounded-md hover:bg-slate-50 transition-colors group"
          >
            Show More
            <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}

function MiniActionButton({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200",
    red: "bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
  };
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn("px-2 py-1 rounded text-[10px] font-bold border transition-colors", (styles as any)[color])}
    >
      {label}
    </button>
  );
}

function StatusMetric({ label, value, isAlert = false }: { label: string; value: string | number; isAlert?: boolean }) {
  return (
    <div className="flex flex-col items-center min-w-[100px]">
      <div className={cn("text-[14px] font-bold", isAlert ? "text-slate-900" : "text-slate-500")}>{value}</div>
      <div className="text-[9px] font-bold text-slate-400 tracking-widest mt-0.5 text-center">{label}</div>
    </div>
  );
}

function DetailView({ group, onBack, decisions, onDecision }: {
  group: GroupedData,
  onBack: () => void,
  decisions: Record<number, Decision>,
  onDecision: (id: number, d: Decision) => void
}) {
  const { state } = useSidebar();
  const unreviewedVendors = group.vendors.filter(v => !decisions[v.id]);
  const reviewedVendorsCount = group.counts.reviewed;
  const totalVendors = group.counts.total;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to list
        </button>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Vetting Status</span>
            <span className="text-[11px] font-bold text-slate-900 tracking-tight leading-none">{reviewedVendorsCount}/{totalVendors}</span>
          </div>
          <div className="h-6 w-6 flex items-center justify-center rounded-full bg-slate-900 text-white text-[9px] font-bold shadow-sm">
            {totalVendors > 0 ? Math.round((reviewedVendorsCount / totalVendors) * 100) : 0}%
          </div>
        </div>
      </div>

      <div className="space-y-0.5">
        <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">{group.keyword}</h2>
        <p className="text-[12px] text-slate-500 font-medium tracking-tight">Vetting {unreviewedVendors.length} active leads</p>
      </div>

      {unreviewedVendors.length === 0 ? (
        <EmptyState
          title="Audit Complete"
          description="You've reviewed every vendor for this keyword. All selected vendors have been queued for Master List."
        />
      ) : (
        <div className={cn(
          "grid gap-3 transition-all duration-300",
          state === 'expanded' ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-4"
        )}>
          {unreviewedVendors.map((vendor) => (
            <VendorDetailCard
              key={vendor.id}
              vendor={vendor}
              onDecision={(d) => onDecision(vendor.id, d)}
            />
          ))}
        </div>
      )}
    </div>
  );
}


function VendorDetailCard({ vendor, onDecision }: { vendor: VendorDB, onDecision: (d: Decision) => void }) {
  const risk = (vendor.risk || 'Medium').toLowerCase();
  const riskColor = risk === 'low' ? 'emerald' : risk === 'high' ? 'red' : 'amber';

  const scoreColors = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200"
  };

  const formatPhone = (p: string) => {
    if (!p) return 'N/A';
    // Simple logic to add space after country code if it starts with +XX
    if (p.startsWith('+')) {
      const match = p.match(/^(\+\d{2})(.*)$/);
      if (match) return `${match[1]} ${match[2]}`;
    }
    return p;
  };

  return (
    <Card className="flex flex-col border border-slate-200 rounded-md p-5 bg-white shadow-sm hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1 flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">{vendor.company_name}</h3>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border",
              scoreColors[riskColor]
            )}>
              {vendor.risk || 'Medium'}
            </span>
          </div>
          <div className="text-[12px] text-slate-600 leading-normal">
            {vendor.address || 'Location unknown'}
          </div>
          <div className="text-[12px] font-bold text-slate-900">{formatPhone(vendor.phone)}</div>
        </div>
        <div className={cn(
          "h-10 w-10 shrink-0 flex items-center justify-center rounded-md border text-[14px] font-black tabular-nums shadow-sm",
          scoreColors[riskColor]
        )}>
          {vendor.score?.toFixed(1) || '0.0'}
        </div>
      </div>

      <div className="space-y-4 flex-1 flex flex-col">
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-red-50/20 rounded-md p-3 border border-red-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 tracking-widest">Risk Summary</span>
            </div>
            <p className="text-[12px] leading-relaxed text-slate-600 font-medium">
              {vendor.risk_summary || 'No risk signals found in intelligence audit.'}
            </p>
          </div>

          <div className="bg-blue-50/20 rounded-md p-3 border border-blue-100/50 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 tracking-widest">Market Sentiment</span>
              <span className={cn(
                "text-[9px] font-black uppercase px-2 py-0.5 rounded border",
                vendor.Sentiment?.toLowerCase().includes('positive') ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  vendor.Sentiment?.toLowerCase().includes('negative') ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-50 text-slate-600 border-slate-200"
              )}>
                {vendor.Sentiment || 'Neutral'}
              </span>
            </div>
            <p className="text-[12px] leading-relaxed text-slate-600 font-medium">
              {vendor["Sentiment Summary"] || 'Sentiment trends for this vector are exceptionally stable.'}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <a
              href={vendor.google_maps_link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <MapPin className="h-3 w-3 text-slate-400" />
              Show on maps
            </a>
            {vendor.website && (
              <a
                href={vendor.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Globe className="h-3 w-3 text-slate-400" />
                Website
              </a>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <DetailActionButton
              label="Select"
              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
              onClick={() => onDecision('selected')}
            />
            <DetailActionButton
              label="Hold"
              className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
              onClick={() => onDecision('considerable')}
            />
            <DetailActionButton
              label="Reject"
              className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
              onClick={() => onDecision('rejected')}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}


function DetailActionButton({ label, className, onClick }: { label: string; className: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex grow items-center justify-center h-10 rounded-md text-[11px] font-bold transition-all active:scale-[0.98]",
        className
      )}
    >
      {label}
    </button>
  );
}
