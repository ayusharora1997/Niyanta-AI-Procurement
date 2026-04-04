import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle2, Download, FileText, Loader2, Upload } from 'lucide-react';
import { SearchStatusProgress } from '../components/SearchStatusProgress';
import { useSearchProgress, type SearchProgressStatus } from '../hooks/useSearchProgress';
import { Card, PrimaryButton, SectionLabel, Title } from '../components/ui/Shared';
import { mockSearches } from '../data/mockVendors';

const progressSteps = [
  { label: 'Searching IndiaMART...', progress: 28 },
  { label: 'Found 12 vendors...', progress: 54 },
  { label: 'Scoring with AI...', progress: 82 },
  { label: 'Complete - 23 vendors discovered', progress: 100 },
];

const discoverySources = ['IndiaMart', 'TradeIndia', 'Udaan', 'Moglix'];
const KEYWORD_WEBHOOK_URL = import.meta.env.DEV
  ? '/webhook-test/start-discovery'
  : 'https://n8n-production-a167.up.railway.app/webhook-test/start-discovery';

function resolveRunId(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null;

  const record = payload as Record<string, unknown>;
  const directRunId = typeof record.run_id === 'string' ? record.run_id : null;
  const directId = typeof record.id === 'string' ? record.id : null;

  if (directRunId) return directRunId;
  if (directId) return directId;

  const nested = record.data;
  if (!nested || typeof nested !== 'object') return null;

  const nestedRecord = nested as Record<string, unknown>;
  const nestedRunId = typeof nestedRecord.run_id === 'string' ? nestedRecord.run_id : null;
  const nestedId = typeof nestedRecord.id === 'string' ? nestedRecord.id : null;

  return nestedRunId ?? nestedId ?? null;
}

export function VendorDiscovery() {
  const [keyword, setKeyword] = useState('');
  const [rfqName, setRfqName] = useState('Q2 Packaging RFQ.pdf');
  const [rfqCount, setRfqCount] = useState(5);
  const [keywordCount, setKeywordCount] = useState(5);
  const [rfqStatus, setRfqStatus] = useState<'idle' | 'running' | 'complete'>('idle');
  const [keywordStatus, setKeywordStatus] = useState<'idle' | SearchProgressStatus>('idle');
  const [keywordWebhookError, setKeywordWebhookError] = useState<string | null>(null);
  const [keywordRunId, setKeywordRunId] = useState<string | null>(null);
  const [rfqStepIndex, setRfqStepIndex] = useState(0);
  const [keywordProgressKey, setKeywordProgressKey] = useState<string | null>(null);

  const keywordProgress = useSearchProgress(keywordRunId ?? keywordProgressKey, keywordCount);
  const keywordProgressSnapshot = useMemo(() => {
    if (keywordRunId) {
      return keywordProgress;
    }

    if (keywordStatus === 'failed') {
      return {
        status: 'failed' as const,
        enriched: 0,
        total: keywordCount,
      };
    }

    if (keywordStatus === 'initiated') {
      return {
        status: 'initiated' as const,
        enriched: 0,
        total: keywordCount,
      };
    }

    return null;
  }, [keywordCount, keywordProgress, keywordRunId, keywordStatus]);

  const keywordSearchActive = keywordStatus === 'initiated'
    || (keywordRunId !== null && keywordProgress.status !== 'completed' && keywordProgress.status !== 'failed');

  const downloadRfqTemplate = () => {
    const csv = [
      'Item Name,Category,Quantity,Unit,Preferred Region,Required Certifications,Target Price',
      'Cotton Drawstring Bag,Packaging,10000,Pieces,India,GST|IEC,12.5',
      'Corrugated Carton,Packaging,5000,Pieces,India,GST,18.0',
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rfq-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const startKeywordSearch = async () => {
    const keywordValue = keyword.trim();
    const vendorCount = keywordCount;
    if (!keywordValue) return;

    setKeywordWebhookError(null);
    setKeywordRunId(null);
    setKeywordProgressKey(`search-${Date.now()}`);
    setKeywordStatus('initiated');

    try {
      const payload = {
        keyword: keywordValue,
        vendor_count_requested: vendorCount,
        sources: discoverySources,
        source_type: 'keyword',
      };

      const res = await fetch(KEYWORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Webhook failed: ${res.status} - ${text}`);
      }

      const data = await res.json();
      console.log('Webhook response:', data);
      const runId = resolveRunId(data);

      if (!runId) {
        throw new Error('Invalid response from webhook');
      }

      setKeywordRunId(runId);
      setKeywordStatus('idle');
      console.log('Run ID:', runId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to reach webhook.';
      setKeywordWebhookError(message);
      setKeywordStatus('failed');
    }
  };

  useEffect(() => {
    if (rfqStatus !== 'running') return;
    const timers = [
      window.setTimeout(() => setRfqStepIndex(1), 900),
      window.setTimeout(() => setRfqStepIndex(2), 1800),
      window.setTimeout(() => {
        setRfqStepIndex(3);
        setRfqStatus('complete');
      }, 2800),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [rfqStatus]);

  return (
    <div className="mx-auto max-w-[1240px] space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <Title>Vendor Search</Title>
          <p className="text-[14px] text-[#666]">Use RFQ-led discovery or direct keyword search. Vendor search and vendor dump now sit under the same vendor discovery module.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Searches Run" value="14" />
        <StatCard label="Total Vendors Discovered" value="143" />
        <StatCard label="Avg Vendors / Search" value="10.2" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-[12px] p-8">
          <h2 className="text-[24px] font-[700] text-[#0a0a0a]">Discover Vendors Based On RFQ</h2>
          <p className="mt-2 text-[14px] text-[#666]">Upload an RFQ, parse requirements through AI, and search vendors from the extracted need.</p>

          <div className="mt-8 space-y-6">
            <label className="flex min-h-[152px] cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-[#d4d4d4] bg-[#fafafa] px-6 text-center">
              <Upload className="h-8 w-8 text-[#666]" />
              <div className="mt-4 text-[14px] font-[600] text-[#0a0a0a]">Upload RFQ</div>
              <div className="mt-1 text-[13px] text-[#666]">PDF, DOCX, or XLSX. AI will parse categories, quantity, and sourcing constraints.</div>
              <input type="file" className="hidden" onChange={(event) => setRfqName(event.target.files?.[0]?.name ?? 'Q2 Packaging RFQ.pdf')} />
            </label>
            <div className="flex justify-start">
              <button
                type="button"
                onClick={downloadRfqTemplate}
                className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[#d6d6d6] bg-white px-3 text-[12px] font-[600] text-[#404040] transition hover:bg-[#f6f6f6]"
              >
                <Download className="h-3.5 w-3.5" />
                Download RFQ Template
              </button>
            </div>

            <div className="rounded-[10px] border border-[#e5e5e5] bg-[#fafafa] p-4">
              <div className="flex items-center gap-2 text-[14px] font-[600] text-[#0a0a0a]">
                <FileText className="h-4 w-4" />
                Parsed RFQ Snapshot
              </div>
              <div className="mt-3 text-[13px] text-[#404040]">{rfqName}</div>
              <div className="mt-2 text-[13px] leading-6 text-[#666]">Detected categories: cotton bags, corrugated cartons, low-risk exporters, GST and IEC preferred.</div>
            </div>

            <ScrapeCounter value={rfqCount} setValue={setRfqCount} />

            <PrimaryButton
              className="h-[52px] w-full text-[16px]"
              disabled={rfqStatus === 'running'}
              onClick={() => {
                setRfqStatus('running');
                setRfqStepIndex(0);
              }}
            >
              {rfqStatus === 'running' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Parsing RFQ...</> : 'Start Discovery'}
            </PrimaryButton>

            <ProgressPanel status={rfqStatus} step={progressSteps[rfqStepIndex]} />
          </div>
        </Card>

        <Card className="rounded-[12px] p-8">
          <h2 className="text-[24px] font-[700] text-[#0a0a0a]">Discover Vendors By Keyword</h2>
          <p className="mt-2 text-[14px] text-[#666]">Use direct keyword search when the buyer already knows the target product family.</p>

          <div className="mt-8 space-y-6">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && keyword.trim() && !keywordSearchActive) {
                  void startKeywordSearch();
                }
              }}
              placeholder="e.g. cotton drawstring bags, glass bottles..."
              className="h-[52px] w-full rounded-[8px] border-[1.5px] border-[#e0e0e0] px-4 text-[16px] text-[#0a0a0a] outline-none transition focus:border-[#0a0a0a] focus:ring-4 focus:ring-black/5"
            />

            <ScrapeCounter value={keywordCount} setValue={setKeywordCount} />

            <PrimaryButton
              className="h-[52px] w-full text-[16px]"
              disabled={!keyword.trim() || keywordSearchActive}
              onClick={() => {
                void startKeywordSearch();
              }}
            >
              {keywordSearchActive ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Discovering...</> : 'Start Discovery'}
            </PrimaryButton>
            {keywordWebhookError ? (
              <div className="text-[12px] font-[500] text-[#b91c1c]">
                Webhook error: {keywordWebhookError}
              </div>
            ) : null}
            {keywordRunId ? (
              <div className="text-[12px] font-[500] text-[#166534]">
                Run ID: {keywordRunId}
              </div>
            ) : null}

            {keywordProgressSnapshot ? (
              <SearchStatusProgress
                status={keywordProgressSnapshot.status}
                enriched={keywordProgressSnapshot.enriched}
                total={keywordProgressSnapshot.total}
              />
            ) : null}
            {keywordRunId && keywordProgress.status === 'completed' ? (
              <div className="text-right">
                <Link to="/discovery/dump" className="text-[14px] font-[600] text-[#0a0a0a] hover:text-[#404040]">View in Vendor Dump</Link>
              </div>
            ) : null}
          </div>
        </Card>
      </div>

      <Card className="p-0">
        <div className="border-b border-[#e5e5e5] px-6 py-5">
          <SectionLabel>Previous Searches</SectionLabel>
        </div>
        <div className="divide-y divide-[#f5f5f5]">
          {mockSearches.map((search) => (
            <div key={search.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-[#fafafa]">
              <div>
                <div className="text-[14px] font-[600] text-[#0a0a0a]">{search.keyword}</div>
                <div className="mt-1 text-[13px] text-[#666]">{search.date} - {search.vendorsFound} vendors - Avg {search.avgScore.toFixed(1)}/10</div>
              </div>
              <Link to="/discovery/dump" className="text-[13px] font-[600] text-[#0a0a0a]">View</Link>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="text-[11px] font-[600] uppercase tracking-[0.08em] text-[#888]">{label}</div>
      <div className="mt-2 text-[28px] font-[700] text-[#0a0a0a]">{value}</div>
    </Card>
  );
}

function ScrapeCounter({ value, setValue }: { value: number; setValue: (value: number) => void }) {
  return (
    <div className="flex items-center justify-between rounded-[8px] border border-[#e5e5e5] bg-[#fafafa] px-4 py-3">
      <div>
        <div className="text-[14px] font-[600] text-[#0a0a0a]">Number of vendors to scrape</div>
        <div className="text-[13px] text-[#666]">Minimum 5 vendors per run</div>
      </div>
      <div className="flex items-center overflow-hidden rounded-[8px] border border-[#e5e5e5] bg-white">
        <button type="button" className="h-10 w-10 text-[#666] hover:bg-[#fafafa]" onClick={() => setValue(Math.max(5, value - 1))}>-</button>
        <div className="flex h-10 min-w-12 items-center justify-center border-x border-[#e5e5e5] px-3 text-[14px] font-[600]">{value}</div>
        <button type="button" className="h-10 w-10 text-[#666] hover:bg-[#fafafa]" onClick={() => setValue(value + 1)}>+</button>
      </div>
    </div>
  );
}

function ProgressPanel({
  status,
  step,
}: {
  status: 'idle' | 'running' | 'complete';
  step: { label: string; progress: number };
}) {
  if (status === 'idle') return null;

  return (
    <div className="rounded-[8px] border border-[#e5e5e5] bg-[#fafafa] p-4">
      <div className="mb-3 flex items-center justify-between text-[14px]">
        <div className="flex items-center gap-2 font-[600] text-[#0a0a0a]">
          {status === 'complete' ? <CheckCircle2 className="h-4 w-4 text-[#059669]" /> : <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#3b82f6]" />}
          {step.label}
        </div>
        <span className="text-[#666]">{step.progress}%</span>
      </div>
      <div className="h-2 rounded-full bg-white">
        <div className={`h-2 rounded-full ${status === 'complete' ? 'bg-[#059669]' : 'bg-[#0a0a0a]'}`} style={{ width: `${step.progress}%` }} />
      </div>
      {status === 'complete' ? (
        <div className="mt-3 text-right">
          <Link to="/discovery/dump" className="text-[14px] font-[600] text-[#0a0a0a] hover:text-[#404040]">View in Vendor Dump</Link>
        </div>
      ) : null}
    </div>
  );
}
