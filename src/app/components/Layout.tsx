import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import {
  AlertCircle,
  Bell,
  CheckSquare,
  ChevronDown,
  Filter,
  Layers3,
  LayoutDashboard,
  Mail,
  Search,
  Settings,
  User,
  Zap,
  ChevronLeft,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import LogoImg from '../../assets/239adfb2a2fd601ae32ecb61000056ccc0d35ded.png';
import { cn } from './ui/Shared';

interface LayoutProps {
  children: ReactNode;
}

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
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Vendor Discovery': true
  });

  const toggleGroup = (name: string) => {
    setOpenGroups(prev => ({ ...prev, [name]: !prev[name] }));
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModuleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const meta = location.pathname.startsWith('/vendor/')
    ? { breadcrumbs: ['Procurement', 'Vendor Detail'], moduleName: 'Procurement Module' }
    : (routeMeta[location.pathname] ?? routeMeta['/']);

  // We are storing the selected module, initially set based on meta or default.
  const [selectedModule, setSelectedModule] = useState(meta.moduleName);

  return (
    <div className="flex h-screen overflow-hidden bg-[#ffffff] text-[#0a0a0a]">
      <aside className={cn(
        "group relative flex h-screen flex-shrink-0 flex-col border-r border-[rgba(255,255,255,0.12)] bg-[#0a0a0a] text-white transition-all duration-300",
        isSidebarCollapsed ? "w-[80px]" : "w-[320px]"
      )}>
        <div className={cn("flex h-14 items-center border-b border-[rgba(255,255,255,0.15)]", isSidebarCollapsed ? "justify-center px-0" : "justify-between px-4")}>
          <div className="flex items-center gap-2 text-[18px] font-[700] overflow-hidden whitespace-nowrap">
            <div className="flex shrink-0 h-6 w-6 items-center justify-center overflow-hidden rounded-md bg-white">
              <img src={LogoImg} alt="Logo" className="h-full w-full object-fill" />
            </div>
            {!isSidebarCollapsed && (
              <>
                <span>Niyanta</span>
                <span className="text-[#c084fc]">AI</span>
              </>
            )}
          </div>
        </div>

        {/* Collapsible Sidebar Icon */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 z-50 items-center justify-center rounded-full border border-[rgba(255,255,255,0.3)] bg-[#0a0a0a] text-white/50 hover:text-white hover:bg-[#0a0a0a] hover:border-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", isSidebarCollapsed && "rotate-180")} />
        </button>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              if ('children' in item) {
                const groupActive = item.children.some((child) => location.pathname === child.path);
                const isOpen = openGroups[item.name];
                return (
                  <li key={item.name} className="space-y-1">
                    <button 
                      onClick={() => toggleGroup(item.name)}
                      className={cn(
                        'flex h-10 w-full items-center justify-between rounded-[8px] px-3 text-[14px] text-white transition hover:bg-[rgba(255,255,255,0.08)]', 
                        groupActive && 'bg-[rgba(255,255,255,0.06)]',
                        isSidebarCollapsed && 'justify-center'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-[18px] w-[18px] shrink-0 text-white" />
                        {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                      </div>
                      {!isSidebarCollapsed && <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")} />}
                    </button>
                    {(!isSidebarCollapsed && isOpen) && (
                      <div className="ml-9 space-y-1 mt-1">
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
                    )}
                  </li>
                );
              }

              const active = location.pathname === item.path || (item.path.startsWith('/vendor/') && location.pathname.startsWith('/vendor/'));
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      'flex h-10 items-center rounded-[8px] px-3 text-[14px] text-white transition hover:bg-[rgba(255,255,255,0.08)]',
                      active && 'bg-[rgba(255,255,255,0.15)]',
                      isSidebarCollapsed && 'justify-center'
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0 text-white" />
                    {!isSidebarCollapsed && <span className="ml-3 truncate">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-[rgba(255,255,255,0.15)] p-3">
          <button type="button" className={cn("flex h-10 w-full items-center rounded-[8px] text-[14px] text-white/70 transition hover:bg-[rgba(255,255,255,0.08)] hover:text-white", isSidebarCollapsed ? 'justify-center px-0' : 'px-3')}>
            <Settings className="h-[18px] w-[18px] shrink-0" />
            {!isSidebarCollapsed && <span className="ml-3">Settings</span>}
          </button>
          <div className="mt-3 relative" ref={dropdownRef}>
            <button 
              type="button" 
              onClick={() => setIsModuleDropdownOpen(!isModuleDropdownOpen)}
              className={cn("flex w-full items-center justify-between rounded-[8px] bg-[rgba(255,255,255,0.06)] py-2 text-white hover:bg-[rgba(255,255,255,0.1)] transition", isSidebarCollapsed ? "justify-center px-0" : "px-3")}
            >
              <div className="flex items-center gap-2">
                <div className="flex shrink-0 h-5 w-5 items-center justify-center overflow-hidden rounded-md bg-white">
                  <img src={LogoImg} alt="Module Logo" className="h-full w-full object-fill" />
                </div>
                {!isSidebarCollapsed && <span className="text-[13px] font-[500] truncate">{selectedModule}</span>}
              </div>
              {!isSidebarCollapsed && <ChevronDown className={cn("h-4 w-4 shrink-0 text-white/70 transition-transform", isModuleDropdownOpen && "rotate-180")} />}
            </button>
            
            {isModuleDropdownOpen && (
              <div className={cn("absolute bottom-[calc(100%+8px)] w-[240px] rounded-[8px] border border-[rgba(255,255,255,0.1)] bg-[#1a1a1a] p-1 shadow-lg z-50", isSidebarCollapsed ? "left-[60px]" : "left-0 min-w-full w-auto")}>
                {['Procurement', 'Revenue', 'Business Insights'].map((mod) => (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => {
                      setSelectedModule(mod + ' Module');
                      setIsModuleDropdownOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-[6px] px-3 py-2 text-[13px] text-left transition",
                      selectedModule === mod + ' Module' 
                        ? "bg-[#2563eb] text-white" 
                        : "text-white/70 hover:bg-[rgba(255,255,255,0.1)] hover:text-white"
                    )}
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white">
                      <img src={LogoImg} alt={`${mod} Logo`} className="h-full w-full object-fill" />
                    </div>
                    <span>{mod}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-[#e5e5e5] bg-white px-6">
          <div className="text-[14px] text-[#888]">
            {meta.breadcrumbs.slice(0, -1).join(' / ')} / <span className="font-[600] text-[#0a0a0a]">{meta.breadcrumbs[meta.breadcrumbs.length - 1]}</span>
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
