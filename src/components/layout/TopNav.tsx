import React from 'react';
import { Menu, RefreshCw, Crown } from 'lucide-react';
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

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b-2 border-[#BD5579]/20 px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs font-alata">
      {/* Left controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-black hover:bg-[#fcf2f6] rounded-xl transition-colors border border-[#BD5579]/20"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Multi-Salon Filter */}
        <SalonSelector />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Live Supabase Connectivity Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-xs text-black font-bold shadow-2xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-700"></span>
          </span>
          <span>Supabase Synced</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => refreshSalons()}
          className="p-2 text-black hover:text-[#601D49] hover:bg-[#fcf2f6] rounded-xl transition-colors border border-[#BD5579]/20"
          title="Refresh Live Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#601D49]' : ''}`} />
        </button>

        {/* Permanent Super Admin Role Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FFEBB8] border border-[#BD5579]/40 text-xs text-black font-bold shadow-2xs">
          <Crown className="w-4 h-4 text-[#601D49]" />
          <span>SUPER ADMIN</span>
        </div>
      </div>
    </header>
  );
};
