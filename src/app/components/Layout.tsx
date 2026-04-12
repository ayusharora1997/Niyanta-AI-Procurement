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
} from 'lucide-react';
import { cn } from './ui/Shared';
import { SidebarProvider } from './ui/sidebar';

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

const modules: Array<{ key: ModuleContext; title: string; description: string }> = [
  {
    key: 'Procurement',
    title: 'Procurement',
    description: 'Vendor sourcing and review',
  },
  {
    key: 'Revenue',
    title: 'Revenue',
    description: 'Commercial planning and tracking',
  },
  {
    key: 'Business Insights',
    title: 'Business Insights',
    description: 'Cross-module analytics',
  },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(location.pathname.startsWith('/discovery'));
  const [selectedModule, setSelectedModule] = useState<ModuleContext>('Procurement');
  const [isModuleListOpen, setIsModuleListOpen] = useState(false);

  const meta = location.pathname.startsWith('/vendor/')
    ? { breadcrumbs: ['Procurement', 'Vendor Detail'], moduleName: 'Procurement Module' }
    : (routeMeta[location.pathname] ?? routeMeta['/']);

  const currentModule = modules.find((module) => module.key === selectedModule) ?? modules[0];
  const isActiveModuleAvailable = selectedModule === 'Procurement';
  const breadcrumbs = isActiveModuleAvailable
    ? [selectedModule, ...meta.breadcrumbs.slice(1)]
    : [selectedModule, '404 Not Found'];

  useEffect(() => {
    if (location.pathname.startsWith('/discovery')) {
      setIsDiscoveryOpen(true);
    }
  }, [location.pathname]);

  return (
    <SidebarProvider open={!isSidebarCollapsed} onOpenChange={(open) => setIsSidebarCollapsed(!open)}>
      <div className="min-h-screen bg-[#f3f1ec] text-[#111111] w-full">
        <aside
          className={cn(
            'fixed left-0 top-0 z-30 flex h-screen flex-col overflow-hidden border-r border-[#1f1f1f] bg-[radial-gradient(circle_at_top,_#1b1b1b_0%,_#0c0c0c_52%,_#060606_100%)] text-white transition-[width] duration-200',
            isSidebarCollapsed ? 'w-[92px]' : 'w-[336px]',
          )}
        >
        <div className="border-b border-white/8 px-5 py-5">
          <div className={cn('flex items-center gap-3', isSidebarCollapsed && 'justify-center')}>
            <BrandMark compact={isSidebarCollapsed} />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;

              if ('children' in item) {
                const groupActive = item.children.some((child) => location.pathname === child.path);
                return (
                  <div key={item.name} className="space-y-2">
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
                        'group relative flex h-11 w-full items-center rounded-[16px] border border-transparent px-3.5 text-[14px] font-[600] text-white/90 transition',
                        groupActive ? 'bg-[#dedad2] !text-[#111111] shadow-[0_10px_28px_rgba(0,0,0,0.16)] [&_svg]:!text-[#111111]' : 'hover:bg-white/7 hover:text-white',
                        isSidebarCollapsed && 'justify-center px-0',
                      )}
                    >
                      {groupActive ? <span className="absolute left-0 top-2.5 h-6 w-[3px] rounded-r-full bg-[#7b7467]" /> : null}
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {!isSidebarCollapsed ? (
                        <>
                          <span className="ml-3 truncate">{item.name}</span>
                          <ChevronDown className={cn('ml-auto h-4 w-4 transition-transform', groupActive ? 'text-[#4b4b4b]' : 'text-white/55', isDiscoveryOpen ? 'rotate-0' : '-rotate-90')} />
                        </>
                      ) : null}
                    </button>
                    {!isSidebarCollapsed && isDiscoveryOpen ? (
                      <div className="ml-6 space-y-1 border-l border-white/8 pl-4">
                        {item.children.map((child) => {
                          const childActive = location.pathname === child.path;
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={cn(
                                'flex h-10 items-center rounded-[14px] px-3 text-[13px] font-[600] transition',
                                childActive ? 'bg-[#dedad2] !text-[#111111]' : 'text-white/65 hover:bg-white/7 hover:text-white',
                              )}
                            >
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              }

              const active = location.pathname === item.path || (item.path.startsWith('/vendor/') && location.pathname.startsWith('/vendor/'));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.name}
                  className={cn(
                    'group relative flex h-11 items-center rounded-[16px] border border-transparent px-3.5 text-[14px] font-[600] text-white/85 transition',
                    active ? 'bg-[#dedad2] !text-[#111111] shadow-[0_10px_28px_rgba(0,0,0,0.16)] [&_svg]:!text-[#111111]' : 'hover:bg-white/7 hover:text-white',
                    isSidebarCollapsed && 'justify-center px-0',
                  )}
                >
                  {active ? <span className="absolute left-0 top-2.5 h-6 w-[3px] rounded-r-full bg-[#7b7467]" /> : null}
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!isSidebarCollapsed ? <span className="ml-3 truncate">{item.name}</span> : null}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="border-t border-white/8 px-4 py-4">
          <button
            type="button"
            title="Settings"
            className={cn(
              'flex h-11 w-full items-center rounded-[16px] px-3.5 text-[14px] font-[600] text-white/70 transition hover:bg-white/7 hover:text-white',
              isSidebarCollapsed && 'justify-center px-0',
            )}
          >
            <Settings className="h-[18px] w-[18px] shrink-0" />
            {!isSidebarCollapsed ? <span className="ml-3">Settings</span> : null}
          </button>

          {!isSidebarCollapsed ? (
            <div className="mt-3 max-h-[42vh] overflow-y-auto rounded-[20px] border border-white/8 bg-white/6 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[14px] border border-white/12 bg-[#f8f4ed]">
                  <img src="/niyanta-favicon.png" alt="Module icon" className="h-8 w-8 rounded-[10px] object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-[700] text-white">{currentModule.title}</div>
                  <div className="text-[12px] text-white/55">{currentModule.description}</div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setIsModuleListOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-[14px] border border-white/8 bg-black/10 px-3 py-2.5 text-left transition hover:border-white/14 hover:bg-white/7"
                >
                  <div>
                    <div className="text-[11px] font-[700] uppercase tracking-[0.08em] text-white/40">Modules</div>
                    <div className="mt-1 text-[13px] font-[600] text-white/72">Select active module</div>
                  </div>
                  <ChevronDown className={cn('h-4 w-4 text-white/55 transition-transform', isModuleListOpen ? 'rotate-0' : '-rotate-90')} />
                </button>

                {isModuleListOpen ? (
                  <div className="grid grid-cols-1 gap-2">
                    {modules.map((module) => {
                      const active = module.key === selectedModule;
                      return (
                        <button
                          key={module.key}
                          type="button"
                          onClick={() => setSelectedModule(module.key)}
                          className={cn(
                            'flex items-center justify-between rounded-[14px] border px-3 py-2.5 text-left transition',
                            active ? 'border-[#d1ccc2] bg-[#dedad2] !text-[#111111] shadow-[0_10px_28px_rgba(0,0,0,0.12)]' : 'border-white/8 bg-black/15 text-white/72 hover:border-white/16 hover:bg-white/8 hover:text-white',
                          )}
                        >
                          <div>
                            <div className="text-[13px] font-[700]">{module.title}</div>
                            <div className={cn('text-[11px]', active ? 'text-[#5f5a52]' : 'text-white/45')}>{module.description}</div>
                          </div>
                          {active ? <span className="h-2.5 w-2.5 rounded-full bg-[#5f5a52]" /> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute right-[-18px] top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#121212] text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition hover:bg-[#1a1a1a]"
        >
          {isSidebarCollapsed ? <ChevronRight className="h-[18px] w-[18px]" /> : <ChevronLeft className="h-[18px] w-[18px]" />}
        </button>
      </aside>

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col transition-[margin-left] duration-200',
          isSidebarCollapsed ? 'ml-[92px]' : 'ml-[336px]',
        )}
      >
        <header className="border-b border-[#ddd7ca] bg-[#f8f5ef]/95 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="text-[14px] text-[#7d7366]">
              {breadcrumbs.slice(0, -1).join(' / ')} / <span className="font-[700] text-[#111111]">{breadcrumbs[breadcrumbs.length - 1]}</span>
            </div>
            <div className="flex items-center gap-5">
              <button type="button" className="text-[#6d6559] transition hover:text-[#111111]">
                <Search className="h-5 w-5" />
              </button>
              <button type="button" className="relative text-[#6d6559] transition hover:text-[#111111]">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#dc2626] text-[10px] font-[700] text-white">3</span>
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111111] text-[12px] font-[700] text-white">AA</div>
            </div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-73px)] bg-[linear-gradient(180deg,_#f8f5ef_0%,_#f3f1ec_46%,_#efede7_100%)] p-8">
          {isActiveModuleAvailable ? children : <ModuleNotFound moduleName={selectedModule} />}
        </main>
      </div>
    </SidebarProvider>
  );
}

function BrandMark({ compact }: { compact: boolean }) {
  return (
    <div className={cn('flex items-center gap-3', compact && 'justify-center')}>
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[14px] border border-white/10 bg-[#f8f4ed] shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
        <img src="/niyanta-favicon.png" alt="Niyanta AI mark" className="h-8 w-8 rounded-[10px] object-cover" />
      </div>
      {!compact ? (
        <div>
          <div className="text-[20px] font-[800] tracking-[-0.03em] text-white">Niyanta AI</div>
          <div className="text-[12px] text-white/55">Modular operating system for growth teams</div>
        </div>
      ) : null}
    </div>
  );
}

function ModuleNotFound({ moduleName }: { moduleName: string }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-180px)] max-w-[760px] items-center justify-center">
      <div className="w-full rounded-[28px] border border-[#ddd7ca] bg-[#fbf8f2] p-10 text-center shadow-[0_24px_70px_rgba(17,17,17,0.08)]">
        <div className="text-[14px] font-[700] uppercase tracking-[0.16em] text-[#8b8275]">404</div>
        <h1 className="mt-4 text-[40px] font-[800] tracking-[-0.04em] text-[#111111]">Module Not Found</h1>
        <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-7 text-[#6e665c]">
          {moduleName} is not available in this build yet. Switch back to Procurement from the module selector to continue using the live procurement workspace.
        </p>
      </div>
    </div>
  );
}
