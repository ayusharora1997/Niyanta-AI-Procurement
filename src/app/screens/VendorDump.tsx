import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Check, ChevronLeft, ChevronRight, Download, Filter, Minus, MoreHorizontal, Search } from 'lucide-react';
import { BadgeRisk, BadgeScore, Card, EmptyState, OutlineButton, StatusPill, Title } from '../components/ui/Shared';
import { mockVendors } from '../data/mockVendors';

export function VendorDump() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [risk, setRisk] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [hasEmail, setHasEmail] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const [query, setQuery] = useState('');
  const [perPage, setPerPage] = useState(15);

  const vendors = useMemo(() => {
    return mockVendors.filter((vendor) => {
      if (risk !== 'All' && vendor.riskLevel !== risk.toLowerCase()) return false;
      if (hasEmail && !vendor.email) return false;
      if (hasPhone && !vendor.phone) return false;
      if (query && !`${vendor.name} ${vendor.product} ${vendor.location}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [risk, hasEmail, hasPhone, query]);

  const rows = vendors.slice(0, perPage);
  const allSelected = rows.length > 0 && rows.every((vendor) => selected.includes(vendor.id));

  const toggleSelection = (id: string) => {
    setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Title>Vendor Dump</Title>
            <StatusPill className="bg-[#f5f5f5] text-[#404040]">{vendors.length} vendors</StatusPill>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <OutlineButton className="gap-2" onClick={() => setShowFilters((value) => !value)}><Filter className="h-4 w-4" /> Filters</OutlineButton>
          <OutlineButton className="gap-2"><Download className="h-4 w-4" /> Export</OutlineButton>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search vendors" className="h-10 w-[240px] rounded-[8px] border border-[#e5e5e5] pl-9 pr-3 text-[14px] outline-none focus:border-[#0a0a0a]" />
          </div>
        </div>
      </div>

      {showFilters ? (
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            {(['All', 'Low', 'Medium', 'High'] as const).map((option) => (
              <button key={option} type="button" onClick={() => setRisk(option)} className={`rounded-full px-3 py-2 text-[13px] font-[600] ${risk === option ? 'bg-[#0a0a0a] text-white' : 'bg-[#f5f5f5] text-[#666]'}`}>
                {option}
              </button>
            ))}
            <button type="button" onClick={() => setHasEmail((value) => !value)} className={`rounded-full px-3 py-2 text-[13px] font-[600] ${hasEmail ? 'bg-[#0a0a0a] text-white' : 'bg-[#f5f5f5] text-[#666]'}`}>Has Email</button>
            <button type="button" onClick={() => setHasPhone((value) => !value)} className={`rounded-full px-3 py-2 text-[13px] font-[600] ${hasPhone ? 'bg-[#0a0a0a] text-white' : 'bg-[#f5f5f5] text-[#666]'}`}>Has Phone</button>
            <div className="text-[13px] text-[#666]">Score range: 0 - 10</div>
            <div className="text-[13px] text-[#666]">Date range: Mar 14 - Mar 23</div>
          </div>
          {(risk !== 'All' || hasEmail || hasPhone) ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#f5f5f5] pt-4">
              {risk !== 'All' ? <StatusPill className="bg-[#f5f5f5] text-[#0a0a0a]">Risk: {risk}</StatusPill> : null}
              {hasEmail ? <StatusPill className="bg-[#f5f5f5] text-[#0a0a0a]">Has Email</StatusPill> : null}
              {hasPhone ? <StatusPill className="bg-[#f5f5f5] text-[#0a0a0a]">Has Phone</StatusPill> : null}
            </div>
          ) : null}
        </Card>
      ) : null}

      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] bg-[#0a0a0a] px-4 py-3 text-white">
          <div className="text-[14px] font-[600]">{selected.length} selected</div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-[8px] bg-white/15 px-3 py-2 text-[13px] font-[600]">Move to Review</button>
            <button type="button" className="rounded-[8px] bg-white/15 px-3 py-2 text-[13px] font-[600]">Send Email</button>
            <button type="button" className="rounded-[8px] bg-white/15 px-3 py-2 text-[13px] font-[600]">Export</button>
            <button type="button" className="rounded-[8px] px-3 py-2 text-[13px] font-[600]" onClick={() => setSelected([])}>Deselect</button>
          </div>
        </div>
      ) : null}

      <Card className="overflow-hidden p-0">
        {rows.length === 0 ? (
          <EmptyState title="No vendors found" description="Adjust filters or run another discovery to expand the vendor pool." actionText="Start Discovery" onAction={() => navigate('/discovery')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  <th className="px-4 py-3">
                    <input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? [] : rows.map((vendor) => vendor.id))} />
                  </th>
                  {['Company Name', 'Product', 'Score', 'Risk', 'Location', 'Email', 'Phone', 'Review Status', 'Actions'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-[12px] font-[600] uppercase tracking-[0.06em] text-[#888]">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((vendor) => {
                  const selectedRow = selected.includes(vendor.id);
                  const reviewStatus = vendor.status === 'rejected' ? 'Rejected' : ['shortlisted', 'contacted', 'responded'].includes(vendor.status) ? 'Approved to Master' : 'Pending Review';
                  return (
                    <tr key={vendor.id} className={`h-12 border-b border-[#f5f5f5] hover:bg-[#fafafa] ${selectedRow ? 'bg-[#f5f5f5]' : ''}`}>
                      <td className="px-4"><input type="checkbox" checked={selectedRow} onChange={() => toggleSelection(vendor.id)} /></td>
                      <td className="px-4"><Link to={`/vendor/${vendor.id}`} className="font-[600] text-[#0a0a0a] hover:text-[#404040]">{vendor.name}</Link></td>
                      <td className="px-4 text-[14px] text-[#404040]"><div className="max-w-[260px] truncate" title={vendor.product}>{vendor.product}</div></td>
                      <td className="px-4"><BadgeScore score={vendor.score} /></td>
                      <td className="px-4"><BadgeRisk level={vendor.riskLevel} /></td>
                      <td className="px-4 text-[14px] text-[#404040]">{vendor.location}</td>
                      <td className="px-4">{vendor.email ? <Check className="h-4 w-4 text-[#059669]" /> : <Minus className="h-4 w-4 text-[#c7c7c7]" />}</td>
                      <td className="px-4">{vendor.phone ? <Check className="h-4 w-4 text-[#059669]" /> : <Minus className="h-4 w-4 text-[#c7c7c7]" />}</td>
                      <td className="px-4">
                        <StatusPill className={reviewStatus === 'Approved to Master' ? 'bg-[#ecfdf5] text-[#065f46]' : reviewStatus === 'Rejected' ? 'bg-[#fef2f2] text-[#991b1b]' : 'bg-[#f5f5f5] text-[#0a0a0a]'}>
                          {reviewStatus}
                        </StatusPill>
                      </td>
                      <td className="px-4">
                        <button type="button" className="rounded-[8px] p-2 text-[#888] hover:bg-[#f5f5f5]" onClick={() => navigate(`/vendor/${vendor.id}`)}>
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-3 text-[13px] text-[#666] md:flex-row md:items-center md:justify-between">
        <div>Showing 1-{Math.min(rows.length, perPage)} of {vendors.length} vendors</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span>Per page</span>
            <select value={perPage} onChange={(event) => setPerPage(Number(event.target.value))} className="rounded-[8px] border border-[#e5e5e5] px-2 py-1">
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <OutlineButton className="h-8 px-2"><ChevronLeft className="h-4 w-4" /></OutlineButton>
            <OutlineButton className="h-8 px-2"><ChevronRight className="h-4 w-4" /></OutlineButton>
          </div>
        </div>
      </div>
    </div>
  );
}
