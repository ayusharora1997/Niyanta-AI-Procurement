import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import {
  AlertCircle,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Filter,
  Layers3,
  LayoutDashboard,
  Mail,
  Search,
  Settings,
  User,
  Zap,
} from 'lucide-react';
import { cn } from './ui/Shared';

interface LayoutProps {
  children: ReactNode;
}

type ModuleContext = 'Procurement' | 'Revenue' | 'Business Insights';

const navigation = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  {
    name: 'Vendor Discovery',
    icon: Search,
    children: [
      { name: 'Vendor Search', path: '/discovery' },
      { name: 'Vendor Dump', path: '/discovery/dump' },
    ],
  },
  { name: 'Vendor Master', path: '/vendor-master', icon: Layers3 },
  { name: 'Vendor Review', path: '/review', icon: CheckSquare },
  { name: 'Vendor Pipeline', path: '/pipeline', icon: Filter },
  { name: 'Outreach Log', path: '/outreach-log', icon: Mail },
  { name: 'Manual Queue', path: '/manual-queue', icon: AlertCircle },
  { name: 'Vendor Detail', path: '/vendor/v1', icon: User },
];

const routeMeta: Record<string, { breadcrumbs: string[]; moduleName: string }> = {
  '/': { breadcrumbs: ['Procurement', 'Dashboard'], moduleName: 'Procurement Module' },
  '/discovery': { breadcrumbs: ['Procurement', 'Vendor Discovery', 'Vendor Search'], moduleName: 'Procurement Module' },
  '/discovery/dump': { breadcrumbs: ['Procurement', 'Vendor Discovery', 'Vendor Dump'], moduleName: 'Procurement Module' },
  '/dump': { breadcrumbs: ['Procurement', 'Vendor Discovery', 'Vendor Dump'], moduleName: 'Procurement Module' },
  '/vendor-master': { breadcrumbs: ['Procurement', 'Vendor Master'], moduleName: 'Procurement Module' },
  '/review': { breadcrumbs: ['Procurement', 'Vendor Review'], moduleName: 'Procurement Module' },
  '/pipeline': { breadcrumbs: ['Procurement', 'Vendor Pipeline'], moduleName: 'Procurement Module' },
  '/outreach-log': { breadcrumbs: ['Procurement', 'Outreach Log'], moduleName: 'Procurement Module' },
  '/manual-queue': { breadcrumbs: ['Procurement', 'Manual Queue'], moduleName: 'Procurement Module' },
};

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(location.pathname.startsWith('/discovery'));
  const [logoLoadError, setLogoLoadError] = useState(false);
  const [faviconLoadError, setFaviconLoadError] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleContext>('Procurement');
  const meta = location.pathname.startsWith('/vendor/')
    ? { breadcrumbs: ['Procurement', 'Vendor Detail'], moduleName: 'Procurement Module' }
    : (routeMeta[location.pathname] ?? routeMeta['/']);

  const moduleDetails: Record<ModuleContext, { title: string; description: string }> = {
    Procurement: {
      title: 'Procurement Module',
      description: 'Vendor discovery, scoring, pipeline, and outreach.',
    },
    Revenue: {
      title: 'Revenue Module',
      description: 'Revenue attributes (placeholder for now).',
    },
    'Business Insights': {
      title: 'Business Insights',
      description: 'Cross-module insights (placeholder for now).',
    },
  };

  const breadcrumbs = [selectedModule, ...meta.breadcrumbs.slice(1)];

  useEffect(() => {
    if (location.pathname.startsWith('/discovery')) {
      setIsDiscoveryOpen(true);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#0a0a0a]">
      <aside className={cn(
        'fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-[rgba(255,255,255,0.12)] bg-[#0a0a0a] text-white transition-[width] duration-200',
        isSidebarCollapsed ? 'w-[84px]' : 'w-[320px]',
      )}>
        <div className="flex h-14 items-center border-b border-[rgba(255,255,255,0.15)] px-4">
          <div className={cn('flex w-full items-center', isSidebarCollapsed ? 'justify-center' : 'justify-start')}>
            {!isSidebarCollapsed ? (
              logoLoadError ? (
                <div className="flex items-center gap-2 text-[18px] font-[700]">
                  <Zap className="h-4 w-4" />
                  <span>Niyanta</span>
                  <span className="text-white/85">AI</span>
                </div>
              ) : (
                <img
                  src="/niyanta-logo.png"
                  alt="Niyanta AI"
                  className="h-9 w-auto rounded-[12px] bg-white/95 p-1 object-contain"
                  onError={() => setLogoLoadError(true)}
                />
              )
            ) : faviconLoadError ? (
              <span className="rounded-full bg-white/15 p-2"><Zap className="h-4 w-4" /></span>
            ) : (
              <img
                src="/niyanta-favicon.png"
                alt="Niyanta favicon"
                className="h-9 w-9 rounded-[12px] bg-white/95 p-1 object-contain"
                onError={() => setFaviconLoadError(true)}
              />
            )}
          </div>
        </div>

        <nav className="sidebar-scrollbar flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              if ('children' in item) {
                const groupActive = item.children.some((child) => location.pathname === child.path);
                return (
                  <li key={item.name} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isSidebarCollapsed) {
                          setIsSidebarCollapsed(false);
                          setIsDiscoveryOpen(true);
                          return;
                        }
                        setIsDiscoveryOpen((prev) => !prev);
                      }}
                      title={item.name}
                      className={cn(
                        'relative flex h-10 w-full items-center rounded-[8px] px-3 text-[14px] text-white transition hover:bg-[rgba(255,255,255,0.08)]',
                        groupActive && 'bg-[rgba(255,255,255,0.06)]',
                        isSidebarCollapsed && 'justify-center px-0',
                      )}
                    >
                      {groupActive ? <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#5865f2]" /> : null}
                      <Icon className="h-[18px] w-[18px] shrink-0 text-white" />
                      {!isSidebarCollapsed ? (
                        <>
                          <span className="ml-3 truncate">{item.name}</span>
                          <ChevronDown className={cn('ml-auto h-4 w-4 transition-transform', isDiscoveryOpen ? 'rotate-0' : '-rotate-90')} />
                        </>
                      ) : null}
                    </button>
                    {!isSidebarCollapsed && isDiscoveryOpen ? (
                      <div className="ml-9 space-y-1">
                        {item.children.map((child) => {
                          const childActive = location.pathname === child.path;
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={cn(
                                'flex h-9 items-center rounded-[8px] px-3 text-[13px] text-white/80 transition hover:bg-[rgba(255,255,255,0.08)] hover:text-white',
                                childActive && 'bg-[rgba(255,255,255,0.15)] text-white',
                              )}
                            >
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}
                  </li>
                );
              }

              const active = location.pathname === item.path || (item.path.startsWith('/vendor/') && location.pathname.startsWith('/vendor/'));
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    title={item.name}
                    className={cn(
                      'relative flex h-10 items-center rounded-[8px] px-3 text-[14px] text-white transition hover:bg-[rgba(255,255,255,0.08)]',
                      active && 'bg-[rgba(255,255,255,0.15)]',
                      isSidebarCollapsed && 'justify-center px-0',
                    )}
                  >
                    {active ? <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#5865f2]" /> : null}
                    <Icon className="h-[18px] w-[18px] shrink-0 text-white" />
                    {!isSidebarCollapsed ? <span className="ml-3 truncate">{item.name}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-[rgba(255,255,255,0.15)] p-3">
          <button type="button" title="Settings" className={cn(
            'flex h-10 w-full items-center rounded-[8px] px-3 text-[14px] text-white/70 transition hover:bg-[rgba(255,255,255,0.08)] hover:text-white',
            isSidebarCollapsed && 'justify-center px-0',
          )}>
            <Settings className="h-[18px] w-[18px] shrink-0" />
            {!isSidebarCollapsed ? <span className="ml-3">Settings</span> : null}
          </button>
          {!isSidebarCollapsed ? (
            <div className="mt-3 rounded-[12px] bg-[rgba(255,255,255,0.08)] px-3 py-3">
              <div className="flex items-center gap-3">
                {faviconLoadError ? (
                  <span className="rounded-full bg-white/15 p-2"><Zap className="h-4 w-4" /></span>
                ) : (
                  <img
                    src="/niyanta-favicon.png"
                    alt="Niyanta icon"
                    className="h-8 w-8 rounded-[10px] bg-white/95 p-1 object-contain"
                    onError={() => setFaviconLoadError(true)}
                  />
                )}
                <div>
                  <div className="text-[13px] font-[600] text-white">{moduleDetails[selectedModule].title}</div>
                  <div className="text-[11px] text-white/70">{moduleDetails[selectedModule].description}</div>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-[11px] font-[700] uppercase tracking-[0.08em] text-white/60">Select module</label>
                <select
                  value={selectedModule}
                  onChange={(event) => setSelectedModule(event.target.value as ModuleContext)}
                  className="mt-2 h-10 w-full rounded-[10px] border border-white/15 bg-[rgba(0,0,0,0.35)] px-3 text-[13px] font-[600] text-white outline-none focus:ring-4 focus:ring-white/10"
                >
                  <option value="Procurement">Procurement</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Business Insights">Business Insights</option>
                </select>
              </div>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'absolute top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#121212] text-white shadow-[0_6px_16px_rgba(0,0,0,0.35)] transition hover:bg-[#1a1a1a]',
            isSidebarCollapsed ? '-right-5' : '-right-5',
          )}
        >
          {isSidebarCollapsed ? <ChevronRight className="h-[18px] w-[18px]" /> : <ChevronLeft className="h-[18px] w-[18px]" />}
        </button>
      </aside>

      <div className={cn(
        'flex min-w-0 flex-1 flex-col transition-[margin-left] duration-200',
        isSidebarCollapsed ? 'ml-[84px]' : 'ml-[320px]',
      )}>
        <header className="flex h-14 items-center justify-between border-b border-[#e5e5e5] bg-white px-6">
          <div className="text-[14px] text-[#888]">
            {breadcrumbs.slice(0, -1).join(' / ')} / <span className="font-[600] text-[#0a0a0a]">{breadcrumbs[breadcrumbs.length - 1]}</span>
          </div>
          <div className="flex items-center gap-5">
            <button type="button" className="text-[#666] transition hover:text-[#0a0a0a]">
              <Search className="h-5 w-5" />
            </button>
            <button type="button" className="relative text-[#666] transition hover:text-[#0a0a0a]">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#dc2626] text-[10px] font-[700] text-white">3</span>
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a0a0a] text-[12px] font-[700] text-white">AA</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-white p-8">{children}</main>
      </div>
    </div>
  );
}
