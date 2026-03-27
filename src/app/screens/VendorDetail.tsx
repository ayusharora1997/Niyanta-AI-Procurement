import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, ExternalLink, Mail, MessageSquare, Phone } from 'lucide-react';
import { BadgeRisk, Card, EmptyState, OutlineButton, PrimaryButton, SectionLabel, StatusPill } from '../components/ui/Shared';
import { mockOutreachLogs, mockVendors } from '../data/mockVendors';

export function VendorDetail() {
  const { vendorId } = useParams();
  const [tab, setTab] = useState<'overview' | 'compliance' | 'outreach'>('overview');
  const vendor = mockVendors.find((item) => item.id === vendorId) ?? mockVendors[0];
  const logs = mockOutreachLogs.filter((item) => item.vendorId === vendor.id);

  return (
    <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
      <Card className="sticky top-8 h-fit rounded-[12px]">
        <Link to="/discovery/dump" className="inline-flex items-center gap-2 text-[13px] font-[600] text-[#888] hover:text-[#0a0a0a]">
          <ArrowLeft className="h-4 w-4" /> Back to Dump
        </Link>
        <div className="mt-6 text-[22px] font-[700] text-[#0a0a0a]">{vendor.name}</div>
        <div className="mt-1 text-[15px] text-[#666]">{vendor.product}</div>

        <div className="mt-8 flex items-center gap-4">
          <div className="text-[48px] font-[700] leading-none text-[#0a0a0a]">{vendor.score.toFixed(1)}</div>
          <BadgeRisk level={vendor.riskLevel} />
        </div>

        <div className="mt-8 border-l-[3px] border-l-[#0a0a0a] bg-[#fafafa] p-4 text-[13px] italic leading-6 text-[#404040]">{vendor.inference}</div>

        <div className="mt-8 space-y-4 text-[14px]">
          <ContactRow icon={Mail} value={vendor.email ?? 'Not found'} muted={!vendor.email} />
          <ContactRow icon={Phone} value={vendor.phone ?? 'Not found'} muted={!vendor.phone} />
          <a href={vendor.indiamartUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[#0a0a0a]">
            <ExternalLink className="h-4 w-4 text-[#888]" />
            View on IndiaMART
          </a>
        </div>

        <div className="mt-8 space-y-3">
          <PrimaryButton className="w-full">Send Email</PrimaryButton>
          <button type="button" className="inline-flex h-11 w-full items-center justify-center rounded-[8px] bg-[#16a34a] px-4 text-[14px] font-[600] text-white">Send WhatsApp</button>
          <OutlineButton className="w-full">Move to Pipeline</OutlineButton>
          <button type="button" className="h-10 w-full rounded-[8px] text-[14px] font-[600] text-[#dc2626]">Reject</button>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-[12px] p-0">
        <div className="flex border-b border-[#e5e5e5] px-6">
          {[
            ['overview', 'Overview'],
            ['compliance', 'Compliance'],
            ['outreach', 'Outreach History'],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => setTab(id as typeof tab)} className={`border-b-2 px-4 py-4 text-[14px] font-[600] ${tab === id ? 'border-[#0a0a0a] text-[#0a0a0a]' : 'border-transparent text-[#888]'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {tab === 'overview' ? (
            <div className="grid gap-0">
              {[
                ['Nature of Business', vendor.businessType],
                ['Legal Status', vendor.legalStatus],
                ['Annual Turnover', vendor.revenue ?? 'Not disclosed'],
                ['Established Year', vendor.establishedYear],
                ['Num Employees', vendor.employees ?? 'Not disclosed'],
                ['Primary Products', vendor.product],
                ['Location', vendor.location],
                ['Address', vendor.address],
              ].map(([label, value]) => (
                <div key={label} className="grid border-b border-[#f5f5f5] py-4 md:grid-cols-[220px_1fr]">
                  <div className="text-[14px] text-[#888]">{label}</div>
                  <div className="text-[14px] text-[#0a0a0a]">{value}</div>
                </div>
              ))}
            </div>
          ) : null}

          {tab === 'compliance' ? (
            <div className="grid gap-0">
              {[
                ['GSTIN', vendor.gstin ?? 'Missing', vendor.gstin ? 'Valid' : 'Missing'],
                ['IEC', vendor.iec ?? 'Missing', vendor.iec ? 'Valid' : 'Missing'],
                ['GST Registration Date', vendor.gstRegistrationDate ?? 'Missing', ''],
                ['TrustSEAL', vendor.trustSeal ? 'Yes' : 'No', vendor.trustSeal ? 'Yes' : 'No'],
                ['Verified Exporter', vendor.verifiedExporter ? 'Yes' : 'No', vendor.verifiedExporter ? 'Yes' : 'No'],
              ].map(([label, value, status]) => (
                <div key={label} className="grid items-center border-b border-[#f5f5f5] py-4 md:grid-cols-[220px_1fr_auto] md:gap-4">
                  <div className="text-[14px] text-[#888]">{label}</div>
                  <div className="text-[14px] text-[#0a0a0a]">{value}</div>
                  {status ? <StatusPill className={status === 'Missing' || status === 'No' ? 'bg-[#fef2f2] text-[#991b1b]' : 'bg-[#ecfdf5] text-[#065f46]'}>{status}</StatusPill> : null}
                </div>
              ))}
            </div>
          ) : null}

          {tab === 'outreach' ? (
            logs.length === 0 ? (
              <EmptyState title="No outreach history" description="No communication has been logged for this vendor yet." />
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="rounded-[8px] border border-[#e5e5e5] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${log.channel === 'email' ? 'bg-[#eff6ff] text-[#1e40af]' : log.channel === 'whatsapp' ? 'bg-[#ecfdf5] text-[#166534]' : 'bg-[#fffbeb] text-[#92400e]'}`}>
                          {log.channel === 'email' ? <Mail className="h-4 w-4" /> : log.channel === 'whatsapp' ? <MessageSquare className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                        </span>
                        <div>
                          <div className="text-[14px] font-[600] text-[#0a0a0a]">{log.subject}</div>
                          <div className="text-[13px] text-[#666]">{log.timestamp}</div>
                        </div>
                      </div>
                      <StatusPill className={log.status === 'failed' ? 'bg-[#fef2f2] text-[#991b1b]' : 'bg-[#ecfdf5] text-[#065f46]'}>{log.status}</StatusPill>
                    </div>
                    <div className="mt-4 text-[14px] leading-6 text-[#404040]">{log.body}</div>
                    {log.response ? (
                      <div className="mt-4 rounded-[8px] bg-[#fafafa] p-4">
                        <SectionLabel className="mb-2">Vendor Reply</SectionLabel>
                        <div className="text-[14px] leading-6 text-[#404040]">{log.response}</div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )
          ) : null}
        </div>
      </Card>
    </div>
  );
}

function ContactRow({ icon: Icon, value, muted }: { icon: typeof Mail; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-[#888]" />
      <span className={muted ? 'text-[#888]' : 'text-[#0a0a0a]'}>{value}</span>
    </div>
  );
}
