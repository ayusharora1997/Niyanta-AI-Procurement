import { Link } from 'react-router';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, MetricCard, SectionLabel, StatusPill, Title } from '../components/ui/Shared';
import { mockSearches, mockVendors } from '../data/mockVendors';

export function Dashboard() {
  const totalSearches = mockSearches.length;
  const totalVendorsFound = mockVendors.length;
  const avgVendorScore = totalVendorsFound === 0
    ? 0
    : (mockVendors.reduce((sum, vendor) => sum + vendor.score, 0) / totalVendorsFound);

  const selectedVendors = mockVendors.filter((vendor) => vendor.status === 'shortlisted').length;
  const reviewedVendors = mockVendors.filter((vendor) => vendor.status !== 'new').length;
  const contactedVendors = mockVendors.filter((vendor) => (
    vendor.status === 'contacted'
    || vendor.status === 'responded'
    || vendor.pipelineStage === 'contacted'
    || vendor.pipelineStage === 'responded'
    || vendor.pipelineStage === 'negotiating'
  )).length;

  const lowRiskCount = mockVendors.filter((vendor) => vendor.riskLevel === 'low').length;
  const lowRiskPercent = totalVendorsFound === 0 ? 0 : Math.round((lowRiskCount / totalVendorsFound) * 100);
  const conversionRate = totalVendorsFound === 0 ? 0 : Math.round((selectedVendors / totalVendorsFound) * 100);

  const riskData = [
    { label: 'Low risk', count: mockVendors.filter((vendor) => vendor.riskLevel === 'low').length, color: '#059669' },
    { label: 'Medium risk', count: mockVendors.filter((vendor) => vendor.riskLevel === 'medium').length, color: '#d97706' },
    { label: 'High risk', count: mockVendors.filter((vendor) => vendor.riskLevel === 'high').length, color: '#dc2626' },
  ];
  const avgVendorsPerSearch = totalSearches === 0
    ? 0
    : (mockSearches.reduce((sum, run) => sum + run.vendorsFound, 0) / totalSearches);

  return (
    <div className="space-y-8">
      <Title>Dashboard</Title>

      <div className="grid gap-6 xl:grid-cols-5 md:grid-cols-2">
        <MetricCard label="Total Searches" value={String(totalSearches)} subtitle="Search runs tracked" borderColor="#0a0a0a" />
        <MetricCard label="Total Vendors Found" value={String(totalVendorsFound)} subtitle="Across discovery" borderColor="#111827" />
        <MetricCard label="Avg Vendor Score" value={`${avgVendorScore.toFixed(1)}/10`} subtitle="Quality average" borderColor="#059669" />
        <MetricCard label="Selected Vendors" value={String(selectedVendors)} subtitle="Shortlisted" borderColor="#5865f2" />
        <MetricCard label="Low Risk Vendors (%)" value={`${lowRiskPercent}%`} subtitle={`${lowRiskCount} of ${totalVendorsFound}`} borderColor="#10b981" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionLabel className="mb-6">Pipeline View</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <KpiRow label="Discovered" value={totalVendorsFound} />
            <KpiRow label="Reviewed" value={reviewedVendors} />
            <KpiRow label="Selected" value={selectedVendors} />
            <KpiRow label="Contacted" value={contactedVendors} />
          </div>
          <div className="mt-5 rounded-[10px] border border-[#e5e5e5] bg-[#fafafa] px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12px] font-[700] uppercase tracking-[0.08em] text-[#888]">Conversion Rate</div>
                <div className="mt-1 text-[13px] text-[#666]">Selected / Total Vendors</div>
              </div>
              <div className="text-[22px] font-[800] text-[#0a0a0a]">{conversionRate}%</div>
            </div>
          </div>
        </Card>

        <Card>
          <SectionLabel className="mb-6">Quality View</SectionLabel>
          <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
            <div className="relative h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie innerRadius={55} outerRadius={82} data={riskData} dataKey="count" stroke="none" paddingAngle={3}>
                    {riskData.map((item) => <Cell key={item.label} fill={item.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[30px] font-[700] text-[#0a0a0a]">{totalVendorsFound}</div>
                <div className="text-[11px] uppercase tracking-[0.08em] text-[#888]">total</div>
              </div>
            </div>
            <div className="space-y-4">
              {riskData.map((item) => {
                const percentage = totalVendorsFound === 0 ? 0 : Math.round((item.count / totalVendorsFound) * 100);
                return (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-[13px]">
                      <span className="font-[600] text-[#0a0a0a]">{item.label}</span>
                      <span className="text-[#666]">{item.count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#f5f5f5]">
                      <div className="h-2 rounded-full" style={{ width: `${percentage}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-5 text-[12px] text-[#888]">Avg score trend can be added later.</div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <SectionLabel className="mb-6">Search Insights</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[12px] border border-[#e5e5e5] bg-white p-4">
              <div className="text-[12px] font-[700] uppercase tracking-[0.08em] text-[#888]">Avg Vendors per Search</div>
              <div className="mt-2 text-[28px] font-[800] text-[#0a0a0a]">{avgVendorsPerSearch.toFixed(1)}</div>
            </div>
            <div className="rounded-[12px] border border-[#e5e5e5] bg-white p-4">
              <div className="text-[12px] font-[700] uppercase tracking-[0.08em] text-[#888]">Recent Searches</div>
              <div className="mt-2 text-[13px] text-[#666]">{Math.min(mockSearches.length, 5)} shown</div>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-[#e5e5e5] px-6 py-5">
            <SectionLabel>Recent Searches</SectionLabel>
            <StatusPill className="bg-[#f5f5f5] text-[#0a0a0a]">{mockSearches.length} tracked</StatusPill>
          </div>
          <div className="divide-y divide-[#f5f5f5]">
            {mockSearches.slice(0, 6).map((search) => (
              <div key={search.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-[#fafafa]">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-[700] text-[#0a0a0a]">{search.keyword}</div>
                  <div className="mt-1 text-[13px] text-[#666]">{search.date} · {search.vendorsFound} vendors · {search.avgScore.toFixed(1)}/10</div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusPill className={search.status === 'complete' ? 'bg-[#ecfdf5] text-[#065f46]' : 'bg-[#f5f5f5] text-[#0a0a0a]'}>{search.status}</StatusPill>
                  <Link to="/discovery/dump" className="whitespace-nowrap text-[13px] font-[700] text-[#0a0a0a] hover:text-[#404040]">View</Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[12px] border border-[#e5e5e5] bg-white p-4">
      <div className="text-[12px] font-[700] uppercase tracking-[0.08em] text-[#888]">{label}</div>
      <div className="mt-2 text-[28px] font-[800] text-[#0a0a0a]">{value}</div>
    </div>
  );
}
