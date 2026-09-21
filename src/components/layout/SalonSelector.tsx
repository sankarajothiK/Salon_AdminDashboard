import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { useSalons } from '@/contexts/SalonContext';
import { clsx } from 'clsx';

export const SalonSelector: React.FC = () => {
  const { salons, selectedSalonId, setSelectedSalonId } = useSalons();
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

  return (
    <div className="relative font-alata" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#fdf2f7] border-2 border-[#BD5579]/25 text-xs font-bold text-black transition-all shadow-2xs max-w-[150px] sm:max-w-[240px]'
        )}
      >
        {selectedSalonId === 'all' ? (
          <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#601D49] flex-shrink-0" />
        ) : (
          <div
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-[#BD5579]/40 flex-shrink-0"
            style={{ backgroundColor: selectedSalon?.theme_color || '#601D49' }}
          />
        )}
        <span className="font-bold text-black truncate">
          {selectedSalonId === 'all' ? 'All Salons' : selectedSalon?.name || 'Selected Salon'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#601D49] ml-0.5 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border-2 border-[#BD5579]/25 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#601D49] bg-[#fdf5f8] border-b border-[#BD5579]/15">
            Select Scope
          </div>

          <button
            onClick={() => {
              setSelectedSalonId('all');
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left hover:bg-[#fdf2f7] transition-colors text-black"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#601D49]" />
              <span className="font-bold text-black">All Salons (Global)</span>
            </div>
            {selectedSalonId === 'all' && <Check className="w-4 h-4 text-[#601D49]" />}
          </button>

          <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#601D49] bg-[#fdf5f8] border-t border-b border-[#BD5579]/15 mt-1">
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
                className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-left hover:bg-[#fdf2f7] transition-colors text-black"
              >
                <div className="flex items-center gap-2 truncate">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: salon.theme_color || '#601D49' }}
                  />
                  <div className="truncate">
                    <div className="font-bold text-black truncate">{salon.name}</div>
                    <div className="text-[10.5px] text-[#601D49] font-semibold">{salon.city || 'Salon'}</div>
                  </div>
                </div>
                {selectedSalonId === salon.id && <Check className="w-4 h-4 text-[#601D49] flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
