import { useState } from 'react';
import { CheckCheck, ChevronDown, ChevronUp, Mail, MessageSquare, Phone } from 'lucide-react';
import { Card, EmptyState, Title } from '../components/ui/Shared';
import { mockOutreachLogs } from '../data/mockVendors';

export function OutreachLog() {
  const [filter, setFilter] = useState<'all' | 'email' | 'whatsapp' | 'sms'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const rows = filter === 'all' ? mockOutreachLogs : mockOutreachLogs.filter((log) => log.channel === filter);

  return (
    <div className="mx-auto max-w-[980px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <Title>Outreach Log</Title>
        <div className="flex rounded-[8px] border border-[#e5e5e5] bg-[#fafafa] p-1">
          {(['all', 'email', 'whatsapp', 'sms'] as const).map((value) => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-[6px] px-3 py-2 text-[13px] font-[600] capitalize ${filter === value ? 'border border-[#e5e5e5] bg-white text-[#0a0a0a]' : 'text-[#888]'}`}>
              {value}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <Card><EmptyState title="No outreach entries" description="Messages sent through procurement outreach will appear here." /></Card>
      ) : (
        <div className="space-y-4">
          {rows.map((log) => {
            const isExpanded = expanded === log.id;
            const icon = log.channel === 'email' ? Mail : log.channel === 'whatsapp' ? MessageSquare : Phone;
            const colors = log.channel === 'email'
              ? 'bg-[#eff6ff] text-[#1e40af]'
              : log.channel === 'whatsapp'
                ? 'bg-[#ecfdf5] text-[#166534]'
                : 'bg-[#fffbeb] text-[#92400e]';
            const Icon = icon;

            return (
              <Card key={log.id} className="overflow-hidden p-0">
                <button type="button" onClick={() => setExpanded(isExpanded ? null : log.id)} className="flex w-full items-start gap-4 px-5 py-4 text-left">
                  <span className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${colors}`}><Icon className="h-4 w-4" /></span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-[14px] font-[700] text-[#0a0a0a]">{log.vendorName}</div>
                      {log.response ? <span className="rounded-full bg-[#ecfdf5] px-2 py-1 text-[11px] font-[700] text-[#065f46]">REPLIED</span> : null}
                    </div>
                    <div className="mt-1 text-[13px] text-[#666]">{log.vendorProduct}</div>
                    <div className="mt-2 line-clamp-2 text-[13px] leading-6 text-[#666]">{log.preview}</div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-[#888]">
                      <span>{log.timestamp}</span>
                      <span className={log.status === 'failed' ? 'text-[#991b1b]' : 'text-[#059669]'}>{log.status === 'failed' ? 'Failed' : 'Delivered'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#888]">
                    <CheckCheck className="h-4 w-4" />
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>
                {isExpanded ? (
                  <div className="border-t border-[#e5e5e5] bg-[#fafafa] px-5 py-4">
                    <div className="rounded-[8px] border border-[#e5e5e5] bg-white p-4">
                      <div className="text-[11px] font-[600] uppercase tracking-[0.08em] text-[#888]">Subject</div>
                      <div className="mt-2 text-[14px] font-[600] text-[#0a0a0a]">{log.subject}</div>
                      <div className="mt-4 text-[14px] leading-6 text-[#404040]">{log.body}</div>
                      <div className="mt-4 text-[12px] text-[#888]">Sent {log.timestamp} · Read status: {log.readStatus ?? 'unread'}</div>
                    </div>
                    {log.response ? (
                      <div className="mt-4 rounded-[8px] border border-[#a7f3d0] bg-[#ecfdf5] p-4">
                        <div className="text-[11px] font-[600] uppercase tracking-[0.08em] text-[#065f46]">Vendor Reply</div>
                        <div className="mt-2 text-[14px] leading-6 text-[#065f46]">{log.response}</div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
