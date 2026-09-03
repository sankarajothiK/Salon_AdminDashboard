import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Users,
  Calendar,
  Sparkles,
  UserCheck,
  Receipt,
  PieChart,
  Activity,
  AlertTriangle,
  Settings,
  LogOut,
  Crown,
  ShieldCheck,
  Gem,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { clsx } from 'clsx';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Salons', path: '/salons', icon: Store },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Appointments', path: '/appointments', icon: Calendar },
    { label: 'Services', path: '/services', icon: Sparkles },
    { label: 'Staff & Stylists', path: '/staff', icon: UserCheck },
    { label: 'Billing & Invoices', path: '/billing', icon: Receipt },
    { label: 'Expenses', path: '/expenses', icon: PieChart },
    { label: 'Reports & BI', path: '/reports', icon: Gem },
    { label: 'Activity & Audit', path: '/activity', icon: Activity },
    { label: 'System Alerts', path: '/alerts', icon: AlertTriangle },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'super_admin':
        return { label: 'Super Admin', color: 'bg-[#FFEBB8] text-black border-[#BD5579]/40' };
      case 'company_admin':
        return { label: 'Company Admin', color: 'bg-[#EA9D9D]/30 text-black border-[#BD5579]/40' };
      case 'support_admin':
        return { label: 'Support Staff', color: 'bg-slate-200 text-black border-slate-300' };
      case 'salon_admin':
        return { label: 'Salon Admin', color: 'bg-emerald-100 text-black border-emerald-300' };
      default:
        return { label: 'Admin', color: 'bg-slate-200 text-black border-slate-300' };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <aside
      className={clsx(
        'h-screen bg-white border-r-2 border-[#BD5579]/20 flex flex-col transition-all duration-300 z-30 sticky top-0 shadow-md font-alata select-none',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center gap-3 border-b-2 border-[#BD5579]/20 bg-gradient-to-r from-white via-[#FFEBB8]/30 to-white">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#601D49] via-[#BD5579] to-[#EA9D9D] flex items-center justify-center text-[#FFEBB8] shadow-plum-sm flex-shrink-0 border-2 border-[#FFEBB8]">
          <Crown className="w-5 h-5 text-[#FFEBB8]" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-black tracking-wide truncate flex items-center gap-1.5">
              <span>SALON CRM</span>
              <span className="text-[10px] text-black bg-[#FFEBB8] px-1.5 py-0.5 rounded-md border border-[#BD5579]/40 font-bold shadow-2xs">
                ROYAL
              </span>
            </h1>
            <div className="flex items-center gap-1 text-[11px] text-black font-bold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-[#601D49]" />
              <span>Company Portal</span>
            </div>
          </div>
        )}
      </div>

      {/* Role Indicator */}
      {!collapsed && (
        <div className="px-4 py-2.5 bg-[#fdf5f8] border-b border-[#BD5579]/15">
          <div className="flex items-center justify-between text-xs font-bold text-black">
            <span className="truncate max-w-[110px] text-black">{user?.name}</span>
            <span className={clsx('text-[10.5px] font-bold px-2 py-0.5 rounded-full border shadow-2xs', roleInfo.color)}>
              {roleInfo.label}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links with Bold Black High Contrast */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all group',
                isActive
                  ? 'bg-gradient-to-r from-[#601D49] to-[#BD5579] text-[#FFEBB8] shadow-plum-sm font-bold border border-[#601D49]'
                  : 'text-black hover:text-[#601D49] hover:bg-[#fcf2f6] border border-transparent'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={clsx(
                    'w-4 h-4 flex-shrink-0 transition-colors',
                    isActive ? 'text-[#FFEBB8]' : 'text-black group-hover:text-[#601D49]'
                  )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom User / Logout Bar */}
      <div className="p-3 border-t-2 border-[#BD5579]/15 bg-[#fdf5f8]">
        <button
          onClick={logout}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-black hover:bg-rose-100 hover:text-rose-900 transition-colors border border-rose-200',
            collapsed && 'justify-center'
          )}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 text-rose-700" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
