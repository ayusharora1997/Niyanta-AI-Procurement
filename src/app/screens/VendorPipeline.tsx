import { Link } from 'react-router';
import { Check, ChevronLeft, ChevronRight, Clock3, Minus, RefreshCcw, X } from 'lucide-react';
import { BadgeRisk, BadgeScore, Card, EmptyState, OutlineButton, PrimaryButton, StatusPill, Title } from '../components/ui/Shared';
import { mockVendors } from '../data/mockVendors';

export function VendorPipeline() {
  const pipeline = mockVendors.filter((vendor) => vendor.pipelineStage);
  const funnel = [
    { label: 'In Pipeline', count: pipeline.filter((vendor) => vendor.pipelineStage === 'in_pipeline').length || 9, className: 'bg-[#f5f5f5] text-[#404040]' },
    { label: 'Contacted', count: pipeline.filter((vendor) => vendor.pipelineStage === 'contacted').length || 7, className: 'bg-[#f5f5f5] text-[#0a0a0a]' },
    { label: 'Responded', count: pipeline.filter((vendor) => vendor.pipelineStage === 'responded').length || 3, className: 'bg-[#ecfdf5] text-[#065f46]' },
    { label: 'Negotiating', count: pipeline.filter((vendor) => vendor.pipelineStage === 'negotiating').length || 1, className: 'bg-[#fffbeb] text-[#92400e]' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Title>Vendor Pipeline</Title>
          <p className="mt-2 text-[14px] text-[#666]">Shortlisted vendors ready for outreach</p>
        </div>
        <PrimaryButton>Trigger Outreach</PrimaryButton>
      </div>

      <Card className="py-4">
        <div className="flex flex-wrap items-center gap-4 text-[14px] text-[#404040]">
          <div className="font-[600]">{pipeline.length} vendors</div>
          <Divider />
          <div>{pipeline.filter((vendor) => vendor.emailStatus === 'sent').length} emailed</div>
          <Divider />
          <div>{pipeline.filter((vendor) => vendor.whatsappStatus === 'sent').length} WhatsApp sent</div>
          <Divider />
          <div>{pipeline.filter((vendor) => !vendor.email || !vendor.phone).length} manual needed</div>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        {funnel.map((step, index) => (
          <div key={step.label} className="flex items-center gap-2">
            <div className={`rounded-full px-4 py-2 text-[13px] font-[600] ${step.className}`}>{step.label} {step.count}</div>
            {index < funnel.length - 1 ? <span className="text-[#c7c7c7]">{'->'}</span> : null}
          </div>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        {pipeline.length === 0 ? (
          <EmptyState title="Pipeline is empty" description="Move shortlisted vendors into the pipeline from review or the vendor dump." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  {['Company Name', 'Product', 'Score', 'Risk', 'Email', 'WhatsApp', 'SMS', 'Added Date', 'Actions'].map((heading) => (
                    <th key={heading} className="px-6 py-3 text-[12px] font-[600] uppercase tracking-[0.06em] text-[#888]">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pipeline.map((vendor) => {
                  const border = vendor.emailStatus === 'failed' ? 'border-l-[3px] border-l-[#dc2626]' : vendor.emailStatus === 'sent' && vendor.whatsappStatus === 'sent' ? 'border-l-[3px] border-l-[#059669]' : '';
                  return (
                    <tr key={vendor.id} className={`h-12 border-b border-[#f5f5f5] hover:bg-[#fafafa] ${border}`}>
                      <td className="px-6"><Link to={`/vendor/${vendor.id}`} className="font-[600] text-[#0a0a0a] hover:text-[#404040]">{vendor.name}</Link></td>
                      <td className="px-6 text-[14px] text-[#404040]"><div className="max-w-[250px] truncate" title={vendor.product}>{vendor.product}</div></td>
                      <td className="px-6"><BadgeScore score={vendor.score} /></td>
                      <td className="px-6"><BadgeRisk level={vendor.riskLevel} /></td>
                      <td className="px-6">{renderStatusIcon(vendor.emailStatus, '#3b82f6')}</td>
                      <td className="px-6">{renderStatusIcon(vendor.whatsappStatus, '#10b981')}</td>
                      <td className="px-6">{renderStatusIcon(vendor.smsStatus, '#d97706')}</td>
                      <td className="px-6 text-[14px] text-[#404040]">{vendor.addedDate}</td>
                      <td className="px-6">
                        <div className="flex gap-2">
                          <StatusPill className="bg-[#f5f5f5] text-[#404040]">View</StatusPill>
                          <StatusPill className="bg-[#f5f5f5] text-[#0a0a0a]"><RefreshCcw className="mr-1 h-3 w-3" /> Re-send</StatusPill>
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

      <div className="flex flex-col gap-3 text-[13px] text-[#666] md:flex-row md:items-center md:justify-between">
        <div>Showing 1-{pipeline.length} of {pipeline.length} vendors</div>
        <div className="flex items-center gap-2">
          <OutlineButton className="h-8 px-2"><ChevronLeft className="h-4 w-4" /></OutlineButton>
          <OutlineButton className="h-8 px-2"><ChevronRight className="h-4 w-4" /></OutlineButton>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-5 w-px bg-[#e5e5e5]" />;
}

function renderStatusIcon(status: 'sent' | 'pending' | 'failed' | 'na', color: string) {
  if (status === 'sent') return <Check className="h-4 w-4" style={{ color }} />;
  if (status === 'pending') return <Clock3 className="h-4 w-4 text-[#9ca3af]" />;
  if (status === 'failed') return <X className="h-4 w-4 text-[#dc2626]" />;
  return <Minus className="h-4 w-4 text-[#c7c7c7]" />;
}
