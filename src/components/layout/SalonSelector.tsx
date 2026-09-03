import React, { useState, useRef, useEffect } from 'react';
import { Store, ChevronDown, Check, Globe, Crown } from 'lucide-react';
import { useSalons } from '@/contexts/SalonContext';
import { useAuth } from '@/contexts/AuthContext';
import { clsx } from 'clsx';

export const SalonSelector: React.FC = () => {
  const { salons, selectedSalonId, setSelectedSalonId } = useSalons();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedSalon = salons.find((s) => s.id === selectedSalonId);
  const isRestrictedToSalon = user?.role === 'salon_admin' && !!user.salonId;

  return (
    <div className="relative font-alata" ref={dropdownRef}>
      <button
        onClick={() => !isRestrictedToSalon && setIsOpen(!isOpen)}
        disabled={isRestrictedToSalon}
        className={clsx(
          'flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#fdf8fa] hover:bg-[#faebf2] border border-[#BD5579]/25 text-xs font-medium text-[#601D49] transition-all shadow-2xs',
          isRestrictedToSalon && 'cursor-default opacity-90'
        )}
      >
        {selectedSalonId === 'all' ? (
          <Globe className="w-4 h-4 text-[#BD5579]" />
        ) : (
          <div
            className="w-3.5 h-3.5 rounded-full border border-[#BD5579]/40"
            style={{ backgroundColor: selectedSalon?.theme_color || '#BD5579' }}
          />
        )}
        <span className="font-bold text-[#601D49] max-w-[160px] truncate">
          {selectedSalonId === 'all' ? 'All Salons (Company View)' : selectedSalon?.name || 'Selected Salon'}
        </span>
        {!isRestrictedToSalon && <ChevronDown className="w-3.5 h-3.5 text-[#BD5579] ml-0.5" />}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-[#BD5579]/20 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#BD5579] border-b border-slate-100">
            Select Scope
          </div>

          <button
            onClick={() => {
              setSelectedSalonId('all');
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-left hover:bg-[#fcf2f6] transition-colors text-slate-800"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#BD5579]" />
              <span className="font-bold text-[#601D49]">All Salons (Global)</span>
            </div>
            {selectedSalonId === 'all' && <Check className="w-4 h-4 text-[#BD5579]" />}
          </button>

          <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#BD5579] border-t border-b border-slate-100 mt-1">
            Registered Salons ({salons.length})
          </div>

          <div className="max-h-56 overflow-y-auto">
            {salons.map((salon) => (
              <button
                key={salon.id}
                onClick={() => {
                  setSelectedSalonId(salon.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-left hover:bg-[#fcf2f6] transition-colors text-slate-800"
              >
                <div className="flex items-center gap-2 truncate">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: salon.theme_color || '#BD5579' }}
                  />
                  <div className="truncate">
                    <div className="font-bold text-[#601D49] truncate">{salon.name}</div>
                    <div className="text-[10.5px] text-slate-500">{salon.city || 'Salon'}</div>
                  </div>
                </div>
                {selectedSalonId === salon.id && <Check className="w-4 h-4 text-[#BD5579] flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
