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
        'h-screen bg-white border-r-2 border-[#D4AF37]/25 flex flex-col transition-all duration-300 font-alata select-none',
        // Mobile Drawer behavior
        'max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:w-72 max-lg:shadow-2xl',
        mobileOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full',
        // Desktop pinned sidebar behavior
        'lg:sticky lg:top-0 lg:z-30 lg:translate-x-0',
        collapsed ? 'lg:w-20' : 'lg:w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b-2 border-[#D4AF37]/25 bg-gradient-to-r from-white via-[#FCF9EE] to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#161826] flex items-center justify-center text-[#DFB847] shadow-dark-sm flex-shrink-0 border-2 border-[#D4AF37]/40">
            <Crown className="w-5 h-5 text-[#DFB847]" />
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-[#161826] tracking-wide truncate flex items-center gap-1.5">
                <span>STYLE FLEET</span>
                <span className="text-[10px] text-[#161826] bg-[#FCF9EE] px-1.5 py-0.5 rounded-md border border-[#D4AF37]/40 font-bold shadow-2xs">
                  SUPER ADMIN
                </span>
              </h1>
              <div className="flex items-center gap-1 text-[11px] text-[#D4AF37] font-bold tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>HQ Command</span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-[#161826] hover:bg-[#FCF9EE] transition-colors border border-[#D4AF37]/30"
          title="Close Navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Super Admin Indicator */}
      {(!collapsed || mobileOpen) && (
        <div className="px-4 py-2.5 bg-[#FCF9EE]/60 border-b border-[#D4AF37]/20">
          <div className="flex items-center justify-between text-xs font-bold text-[#161826]">
            <span className="truncate max-w-[130px] text-[#161826]">{user?.name}</span>
            <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs bg-[#161826] text-[#DFB847] border-[#161826]">
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
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#161826] shadow-gold-sm font-bold border border-[#D4AF37]'
                  : 'text-[#161826] hover:text-[#161826] hover:bg-[#FCF9EE] border border-transparent'
              )
            }
            title={collapsed && !mobileOpen ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={clsx(
                    'w-4 h-4 flex-shrink-0 transition-colors',
                    isActive ? 'text-[#161826]' : 'text-[#161826] group-hover:text-[#D4AF37]'
                  )}
                />
                {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Sign Out Bar */}
      <div className="p-3 border-t-2 border-[#D4AF37]/20 bg-[#FCF9EE]/50">
        <button
          onClick={logout}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#161826] hover:bg-rose-100 hover:text-rose-900 transition-colors border border-rose-200',
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
