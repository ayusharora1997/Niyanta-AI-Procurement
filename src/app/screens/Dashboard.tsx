import { Link } from 'react-router';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';
import { Card, MetricCard, SectionLabel, StatusPill, Title } from '../components/ui/Shared';
import { dashboardActivities, mockOutreachLogs, mockSearches, mockVendors } from '../data/mockVendors';

export function Dashboard() {
  const totalVendors = mockVendors.length;
  const avgScore = (mockVendors.reduce((sum, vendor) => sum + vendor.score, 0) / totalVendors).toFixed(1);
  const emailsSent = mockOutreachLogs.filter((log) => log.channel === 'email').length;
  const inPipeline = mockVendors.filter((vendor) => vendor.pipelineStage).length;

  const riskData = [
    { label: 'Low risk', count: mockVendors.filter((vendor) => vendor.riskLevel === 'low').length, color: '#059669' },
    { label: 'Medium risk', count: mockVendors.filter((vendor) => vendor.riskLevel === 'medium').length, color: '#d97706' },
    { label: 'High risk', count: mockVendors.filter((vendor) => vendor.riskLevel === 'high').length, color: '#dc2626' },
  ];

  const scoreDistribution = [
    { range: '1-3', count: mockVendors.filter((vendor) => vendor.score < 4).length, color: '#dc2626' },
    { range: '4-6', count: mockVendors.filter((vendor) => vendor.score >= 4 && vendor.score < 7).length, color: '#d97706' },
    { range: '7-8', count: mockVendors.filter((vendor) => vendor.score >= 7 && vendor.score < 9).length, color: '#84cc16' },
    { range: '9-10', count: mockVendors.filter((vendor) => vendor.score >= 9).length, color: '#059669' },
  ];

  const outreachData = [
    { day: 'Mon', email: 4, whatsapp: 2, sms: 1 },
    { day: 'Tue', email: 6, whatsapp: 4, sms: 1 },
    { day: 'Wed', email: 8, whatsapp: 3, sms: 2 },
    { day: 'Thu', email: 5, whatsapp: 4, sms: 1 },
    { day: 'Fri', email: 9, whatsapp: 6, sms: 2 },
    { day: 'Sat', email: 3, whatsapp: 2, sms: 1 },
    { day: 'Sun', email: 2, whatsapp: 1, sms: 0 },
  ];

  const activityColors = {
    email: 'bg-[#ecfdf5]',
    pipeline: 'bg-[#eff6ff]',
    manual: 'bg-[#fffbeb]',
    discovery: 'bg-[#e5e7eb]',
  } as const;

  return (
    <div className="space-y-8">
      <Title>Dashboard</Title>

      <div className="grid gap-6 xl:grid-cols-4 md:grid-cols-2">
        <MetricCard label="Total Vendors" value={String(totalVendors)} subtitle="Discovered this week" borderColor="#0a0a0a" trend={{ direction: 'up', value: '12%' }} />
        <MetricCard label="Avg Score" value={`${avgScore}/10`} subtitle="Overall quality" borderColor="#059669" trend={{ direction: 'up', value: '5%' }} />
        <MetricCard label="Emails Sent" value={String(emailsSent)} subtitle="This month" borderColor="#3b82f6" trend={{ direction: 'down', value: '3%' }} />
        <MetricCard label="In Pipeline" value={String(inPipeline)} subtitle="Awaiting review" borderColor="#d97706" trend={{ direction: 'up', value: '24%' }} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <SectionLabel className="mb-6">Recent Activity</SectionLabel>
          <div className="space-y-4">
            {dashboardActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 border-b border-[#f5f5f5] pb-4 last:border-b-0 last:pb-0">
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${activityColors[activity.type]}`} />
                <div className="flex-1 text-[14px] text-[#404040]">
                  <div>{activity.text}</div>
                  <div className="mt-1 text-[13px] text-[#888]">{activity.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionLabel className="mb-6">Risk Breakdown</SectionLabel>
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
                <div className="text-[30px] font-[700] text-[#0a0a0a]">{totalVendors}</div>
                <div className="text-[11px] uppercase tracking-[0.08em] text-[#888]">total</div>
              </div>
            </div>
            <div className="space-y-4">
              {riskData.map((item) => {
                const percentage = Math.round((item.count / totalVendors) * 100);
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
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionLabel className="mb-6">Vendor Score Distribution</SectionLabel>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#f2f2f2" horizontal vertical={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="range" axisLine={false} tickLine={false} width={40} tick={{ fill: '#666', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {scoreDistribution.map((item) => <Cell key={item.range} fill={item.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionLabel className="mb-6">Outreach Activity - Last 7 Days</SectionLabel>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={outreachData}>
                <CartesianGrid stroke="#f2f2f2" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="email" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="whatsapp" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="sms" stroke="#d97706" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-[#e5e5e5] px-6 py-5">
          <SectionLabel>Recent Searches</SectionLabel>
          <StatusPill className="bg-[#f5f5f5] text-[#0a0a0a]">{mockSearches.length} tracked</StatusPill>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-[#f5f5f5]">
                {['Keyword', 'Date', 'Vendors Found', 'Avg Score', 'Status', ''].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-[12px] font-[600] uppercase tracking-[0.06em] text-[#888]">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockSearches.map((search) => (
                <tr key={search.id} className="h-12 border-b border-[#f5f5f5] text-[14px] text-[#0a0a0a] hover:bg-[#fafafa]">
                  <td className="px-6">{search.keyword}</td>
                  <td className="px-6 text-[#666]">{search.date}</td>
                  <td className="px-6">{search.vendorsFound}</td>
                  <td className="px-6">{search.avgScore.toFixed(1)}/10</td>
                  <td className="px-6">
                    <StatusPill className="bg-[#ecfdf5] text-[#065f46]">{search.status}</StatusPill>
                  </td>
                  <td className="px-6 text-right">
                    <Link to="/discovery/dump" className="text-[13px] font-[600] text-[#0a0a0a] hover:text-[#404040]">View Results</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
