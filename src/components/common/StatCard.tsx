import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
  variant?: 'amber' | 'emerald' | 'purple' | 'blue' | 'rose' | 'indigo' | 'gold' | 'plum' | 'berry' | 'blush' | 'cream' | 'wine' | 'dark';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  variant = 'gold',
  className,
}) => {
  const iconColors = {
    gold: 'bg-[#FCF9EE] text-[#D4AF37] border-[#D4AF37]/30 shadow-gold-sm',
    dark: 'bg-[#161826] text-[#DFB847] border-[#D4AF37]/30 shadow-dark-sm',
    wine: 'bg-[#FCF9EE] text-[#D4AF37] border-[#D4AF37]/30 shadow-gold-sm',
    plum: 'bg-[#FCF9EE] text-[#D4AF37] border-[#D4AF37]/30 shadow-gold-sm',
    berry: 'bg-[#161826] text-[#DFB847] border-[#D4AF37]/30 shadow-dark-sm',
    blush: 'bg-[#FCF9EE] text-[#D4AF37] border-[#D4AF37]/30 shadow-2xs',
    cream: 'bg-[#FCF9EE] text-[#161826] border-[#D4AF37]/30 shadow-2xs',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs',
    amber: 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs',
    purple: 'bg-[#FCF9EE] text-[#D4AF37] border-[#D4AF37]/30 shadow-2xs',
    blue: 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs',
    rose: 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs',
    indigo: 'bg-[#161826] text-[#DFB847] border-[#D4AF37]/30 shadow-2xs',
  };

  return (
    <div
      className={clsx(
        'bg-white border-2 border-[#D4AF37]/25 rounded-2xl p-5 hover:shadow-card-elevated hover:border-[#D4AF37] transition-all shadow-card-subtle font-alata group',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#161826]">{title}</span>
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center border-2 group-hover:scale-105 transition-transform', iconColors[variant])}>
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-[#161826] tracking-tight">{value}</div>
        {(trend || subtitle) && (
          <div className="mt-2 flex items-center gap-2 text-xs font-bold">
            {trend && (
              <span
                className={clsx(
                  'inline-flex items-center gap-0.5 font-bold px-2 py-0.5 rounded-md text-[11px]',
                  trend.isPositive ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-300'
                )}
              >
                {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5 text-emerald-800" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-800" />}
                {trend.value}
              </span>
            )}
            {subtitle && <span className="text-[#161826]/75 font-semibold">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
