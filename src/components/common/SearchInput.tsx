import React from 'react';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}) => {
  return (
    <div className={clsx('relative flex items-center font-alata', className)}>
      <Search className="absolute left-3.5 w-4 h-4 text-[#D4AF37] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#FCF9EE]/40 border-2 border-[#D4AF37]/30 text-[#161826] font-bold text-xs rounded-xl pl-10 pr-8 py-2.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition-all shadow-2xs"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 text-[#161826]/50 hover:text-[#161826] p-1 rounded-full hover:bg-[#FCF9EE]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
