import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  RefreshCw,
  Crown,
  Database,
  Users,
  Calendar,
  Sparkles,
  UserCheck,
  Receipt,
  PieChart,
  ChevronDown,
} from 'lucide-react';
import { SalonSelector } from './SalonSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useSalons } from '@/contexts/SalonContext';

interface TopNavProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const { refreshSalons, loading } = useSalons();

  // Corner dropdown state for Salon Private Ops / Debug
  const [opsDropdownOpen, setOpsDropdownOpen] = useState(false);
  const opsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (opsDropdownRef.current && !opsDropdownRef.current.contains(e.target as Node)) {
        setOpsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b-2 border-[#BD5579]/20 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs font-alata">
      {/* Left controls */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-black hover:bg-[#fdf2f7] hover:text-[#601D49] rounded-xl transition-colors border border-[#BD5579]/25 flex-shrink-0"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Multi-Salon Filter */}
        <div className="min-w-0 flex-shrink">
          <SalonSelector />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        {/* Corner Salon Private Data Debug Dropdown */}
        <div className="relative" ref={opsDropdownRef}>
          <button
            onClick={() => setOpsDropdownOpen(!opsDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fdf5f8] hover:bg-[#fce7f1] text-[#601D49] border border-[#BD5579]/25 text-xs font-bold transition-all shadow-2xs"
            title="Salon Operations Data (Admin Inspection)"
          >
            <Database className="w-3.5 h-3.5 text-[#601D49]" />
            <span className="hidden md:inline">Salon Ops (Debug)</span>
            <ChevronDown className="w-3 h-3 text-[#601D49] ml-0.5" />
          </button>

          {opsDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border-2 border-[#BD5579]/25 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-alata">
              <div className="px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#601D49] bg-[#fdf5f8] border-b border-[#BD5579]/15">
                Salon Operational Data
              </div>

              <Link
                to="/customers"
                onClick={() => setOpsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-black hover:bg-[#fdf2f7] hover:text-[#601D49] transition-colors"
              >
                <Users className="w-4 h-4 text-[#601D49]" />
                <span>Customers Directory</span>
              </Link>

              <Link
                to="/appointments"
                onClick={() => setOpsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-black hover:bg-[#fdf2f7] hover:text-[#601D49] transition-colors"
              >
                <Calendar className="w-4 h-4 text-[#601D49]" />
                <span>Appointments Schedule</span>
              </Link>

              <Link
                to="/services"
                onClick={() => setOpsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-black hover:bg-[#fdf2f7] hover:text-[#601D49] transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[#601D49]" />
                <span>Services & Price List</span>
              </Link>

              <Link
                to="/staff"
                onClick={() => setOpsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-black hover:bg-[#fdf2f7] hover:text-[#601D49] transition-colors"
              >
                <UserCheck className="w-4 h-4 text-[#601D49]" />
                <span>Staff & Stylists</span>
              </Link>

              <Link
                to="/billing"
                onClick={() => setOpsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-black hover:bg-[#fdf2f7] hover:text-[#601D49] transition-colors"
              >
                <Receipt className="w-4 h-4 text-[#601D49]" />
                <span>Invoices Ledger</span>
              </Link>

              <Link
                to="/expenses"
                onClick={() => setOpsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-black hover:bg-[#fdf2f7] hover:text-[#601D49] transition-colors"
              >
                <PieChart className="w-4 h-4 text-[#601D49]" />
                <span>Salon Expenses</span>
              </Link>
            </div>
          )}
        </div>

        {/* Live Supabase Connectivity Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fdf5f8] border border-[#BD5579]/30 text-xs text-[#601D49] font-bold shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#601D49]"></span>
          </span>
          <span>Supabase Synced</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => refreshSalons()}
          className="p-2 text-black hover:text-[#601D49] hover:bg-[#fdf2f7] rounded-xl transition-colors border border-[#BD5579]/25"
          title="Refresh Live Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#601D49]' : ''}`} />
        </button>

        {/* Permanent Super Admin Role Pill */}
        <div className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#601D49] text-[#FFEBB8] border border-[#601D49] text-xs font-bold shadow-wine-sm">
          <Crown className="w-3.5 h-3.5 text-[#FFEBB8]" />
          <span className="hidden xs:inline sm:inline">SUPER ADMIN</span>
        </div>
      </div>
    </header>
  );
};
