import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Gem,
  MessageSquare,
  Smartphone,
  Activity,
  AlertTriangle,
  UserX,
  Settings,
  LogOut,
  Crown,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { clsx } from 'clsx';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();

  // Super Admin Executive Company Navigation
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Salons & 360°', path: '/salons', icon: Store },
    { label: 'Reports & BI', path: '/reports', icon: Gem }, // 3rd item as requested
    { label: 'Support Messages', path: '/support-messages', icon: MessageSquare },
    { label: 'App Version & Telemetry', path: '/app-telemetry', icon: Smartphone },
    { label: 'Platform Audit Trail', path: '/activity', icon: Activity },
    { label: 'System Health Alerts', path: '/alerts', icon: AlertTriangle },
    { label: 'Account Deletions', path: '/account-deletions', icon: UserX },
    { label: 'System Governance', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={clsx(
        'h-screen bg-white border-r-2 border-emerald-100 flex flex-col transition-all duration-300 font-alata select-none',
        // Mobile Drawer behavior
        'max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:w-72 max-lg:shadow-2xl',
        mobileOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full',
        // Desktop pinned sidebar behavior
        'lg:sticky lg:top-0 lg:z-30 lg:translate-x-0',
        collapsed ? 'lg:w-20' : 'lg:w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b-2 border-emerald-100 bg-gradient-to-r from-white via-emerald-50/50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-500 flex items-center justify-center text-white shadow-emerald-sm flex-shrink-0 border-2 border-emerald-300">
            <Crown className="w-5 h-5 text-white" />
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-black tracking-wide truncate flex items-center gap-1.5">
                <span>SALON CRM</span>
                <span className="text-[10px] text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded-md border border-emerald-300 font-bold shadow-2xs">
                  SUPER ADMIN
                </span>
              </h1>
              <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-bold tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Company Portal</span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-black hover:bg-emerald-50 transition-colors border border-emerald-200"
          title="Close Navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Super Admin Indicator */}
      {(!collapsed || mobileOpen) && (
        <div className="px-4 py-2.5 bg-emerald-50/60 border-b border-emerald-100">
          <div className="flex items-center justify-between text-xs font-bold text-black">
            <span className="truncate max-w-[130px] text-black">{user?.name}</span>
            <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs bg-emerald-600 text-white border-emerald-700">
              Super Admin
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
            }}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all group',
                isActive
                  ? 'bg-gradient-to-r from-emerald-700 to-emerald-500 text-white shadow-emerald-sm font-bold border border-emerald-600'
                  : 'text-black hover:text-emerald-800 hover:bg-emerald-50 border border-transparent'
              )
            }
            title={collapsed && !mobileOpen ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={clsx(
                    'w-4 h-4 flex-shrink-0 transition-colors',
                    isActive ? 'text-white' : 'text-emerald-700 group-hover:text-emerald-900'
                  )}
                />
                {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Sign Out Bar */}
      <div className="p-3 border-t-2 border-emerald-100 bg-emerald-50/30">
        <button
          onClick={logout}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-black hover:bg-rose-100 hover:text-rose-900 transition-colors border border-rose-200',
            collapsed && !mobileOpen && 'justify-center'
          )}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 text-rose-700" />
          {(!collapsed || mobileOpen) && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
