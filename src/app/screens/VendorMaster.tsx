import { Link } from 'react-router';
import { BadgeRisk, BadgeScore, Card, StatusPill, Title } from '../components/ui/Shared';
import { mockVendors } from '../data/mockVendors';

export function VendorMaster() {
  const approvedVendors = mockVendors.filter((vendor) => ['shortlisted', 'contacted', 'responded'].includes(vendor.status));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Title>Vendor Master</Title>
          <p className="mt-2 text-[14px] text-[#666]">Approved vendors from review move here and become the curated supplier base for the module.</p>
        </div>
        <StatusPill className="bg-[#f5f5f5] text-[#0a0a0a]">{approvedVendors.length} approved vendors</StatusPill>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-b border-[#e5e5e5]">
                {['Company Name', 'Product', 'Score', 'Risk', 'Source', 'Added Date', 'Lifecycle'].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-[12px] font-[600] uppercase tracking-[0.06em] text-[#888]">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {approvedVendors.map((vendor) => (
                <tr key={vendor.id} className="h-12 border-b border-[#f5f5f5] hover:bg-[#fafafa]">
                  <td className="px-6"><Link to={`/vendor/${vendor.id}`} className="font-[600] text-[#0a0a0a] hover:text-[#404040]">{vendor.name}</Link></td>
                  <td className="px-6 text-[14px] text-[#404040]"><div className="max-w-[280px] truncate" title={vendor.product}>{vendor.product}</div></td>
                  <td className="px-6"><BadgeScore score={vendor.score} /></td>
                  <td className="px-6"><BadgeRisk level={vendor.riskLevel} /></td>
                  <td className="px-6 text-[14px] text-[#404040]">Vendor Review Approval</td>
                  <td className="px-6 text-[14px] text-[#404040]">{vendor.addedDate}</td>
                  <td className="px-6"><StatusPill className="bg-[#ecfdf5] text-[#065f46]">{vendor.pipelineStage ? 'Active in pipeline' : 'Mastered'}</StatusPill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
