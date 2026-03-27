import { useState } from 'react';
import { Link } from 'react-router';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { BadgeRisk, BadgeScore, Card, EmptyState, PrimaryButton, StatusPill, Title } from '../components/ui/Shared';
import { mockVendors } from '../data/mockVendors';

export function ManualOutreachQueue() {
  const [vendors, setVendors] = useState(mockVendors.filter((vendor) => !vendor.email || !vendor.phone));

  return (
    <div className="space-y-6">
      <Title>Manual Queue</Title>

      <Card className="flex items-center gap-3 border-[#fcd34d] bg-[#fffbeb]">
        <AlertTriangle className="h-5 w-5 text-[#d97706]" />
        <div className="text-[14px] font-[600] text-[#92400e]">These vendors have no email or phone. Manual research required.</div>
      </Card>

      <Card className="overflow-hidden p-0">
        {vendors.length === 0 ? (
          <EmptyState title="All caught up!" description="No vendors pending manual outreach." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  {['Company Name', 'Product', 'Score', 'Risk', 'IndiaMART Profile', 'Missing', 'Added Date', 'Actions'].map((heading) => (
                    <th key={heading} className="px-6 py-3 text-[12px] font-[600] uppercase tracking-[0.06em] text-[#888]">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => {
                  const missing = !vendor.email && !vendor.phone ? 'Both' : !vendor.email ? 'Email' : 'Phone';
                  return (
                    <tr key={vendor.id} className="h-12 border-b border-[#f5f5f5] hover:bg-[#fafafa]">
                      <td className="px-6"><Link to={`/vendor/${vendor.id}`} className="font-[600] text-[#0a0a0a] hover:text-[#404040]">{vendor.name}</Link></td>
                      <td className="px-6 text-[14px] text-[#404040]"><div className="max-w-[250px] truncate" title={vendor.product}>{vendor.product}</div></td>
                      <td className="px-6"><BadgeScore score={vendor.score} /></td>
                      <td className="px-6"><BadgeRisk level={vendor.riskLevel} /></td>
                      <td className="px-6">
                        <a href={vendor.indiamartUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] font-[600] text-[#0a0a0a]">
                          View Profile <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </td>
                      <td className="px-6">
                        <StatusPill className="bg-[#fef2f2] text-[#991b1b]">{missing}</StatusPill>
                      </td>
                      <td className="px-6 text-[14px] text-[#404040]">{vendor.addedDate}</td>
                      <td className="px-6">
                        <div className="flex items-center gap-3">
                          <PrimaryButton className="h-9 px-3 text-[13px]" onClick={() => setVendors((current) => current.filter((item) => item.id !== vendor.id))}>Mark as Contacted</PrimaryButton>
                          <button type="button" className="text-[13px] font-[600] text-[#888]" onClick={() => setVendors((current) => current.filter((item) => item.id !== vendor.id))}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
