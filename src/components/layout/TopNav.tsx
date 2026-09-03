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
    <header className="h-16 bg-white/95 backdrop-blur-md border-b-2 border-emerald-100 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs font-alata">
      {/* Left controls */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-black hover:bg-emerald-50 hover:text-emerald-800 rounded-xl transition-colors border border-emerald-200 flex-shrink-0"
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
        {/* Live Supabase Connectivity Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-xs text-emerald-950 font-bold shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-700"></span>
          </span>
          <span>Supabase Synced</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => refreshSalons()}
          className="p-2 text-black hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors border border-emerald-200"
          title="Refresh Live Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>

        {/* Permanent Super Admin Role Pill */}
        <div className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white border border-emerald-700 text-xs font-bold shadow-emerald-sm">
          <Crown className="w-3.5 h-3.5 text-white" />
          <span className="hidden xs:inline sm:inline">SUPER ADMIN</span>
        </div>
      </div>
    </header>
  );
};
