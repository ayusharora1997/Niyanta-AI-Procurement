import { Link, useLocation } from 'react-router';
import { cn } from './ui/Shared';

const tabs = [
  { label: 'Vendor Search', path: '/discovery' },
  { label: 'Vendor Dump', path: '/discovery/dump' },
];

export function DiscoveryTabs() {
  const location = useLocation();

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = location.pathname === tab.path || (tab.path === '/discovery' && location.pathname === '/discovery/search');
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={cn(
              'rounded-[8px] border px-3 py-2 text-[13px] font-[600] transition',
              active ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white' : 'border-[#e5e5e5] bg-white text-[#404040] hover:bg-[#fafafa]',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
