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
  variant?: 'amber' | 'emerald' | 'purple' | 'blue' | 'rose' | 'indigo' | 'gold' | 'plum' | 'berry' | 'blush' | 'cream' | 'wine';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  variant = 'wine',
  className,
}) => {
  const iconColors = {
    wine: 'bg-[#fdf2f7] text-[#601D49] border-[#BD5579]/30 shadow-wine-sm',
    plum: 'bg-[#fdf2f7] text-[#601D49] border-[#BD5579]/30 shadow-wine-sm',
    berry: 'bg-[#fce7f1] text-[#BD5579] border-[#BD5579]/30 shadow-wine-sm',
    blush: 'bg-[#fdf2f7] text-[#601D49] border-[#EA9D9D]/40 shadow-2xs',
    cream: 'bg-[#FFEBB8] text-black border-[#BD5579]/30 shadow-2xs',
    gold: 'bg-[#FFEBB8] text-black border-[#BD5579]/30 shadow-2xs',
    emerald: 'bg-emerald-100 text-emerald-950 border-emerald-300 shadow-2xs',
    amber: 'bg-amber-100 text-amber-950 border-amber-300 shadow-2xs',
    purple: 'bg-[#fdf2f7] text-[#601D49] border-[#BD5579]/30 shadow-2xs',
    blue: 'bg-blue-100 text-blue-950 border-blue-300 shadow-2xs',
    rose: 'bg-rose-100 text-rose-950 border-rose-300 shadow-2xs',
    indigo: 'bg-[#fdf2f7] text-[#601D49] border-[#BD5579]/30 shadow-2xs',
  };

  return (
    <div
      className={clsx(
        'bg-white border-2 border-[#BD5579]/20 rounded-2xl p-5 hover:shadow-card-elevated hover:border-[#601D49] transition-all shadow-card-subtle font-alata group',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-black">{title}</span>
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center border-2 group-hover:scale-105 transition-transform', iconColors[variant])}>
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-black tracking-tight">{value}</div>
        {(trend || subtitle) && (
          <div className="mt-2 flex items-center gap-2 text-xs font-bold">
            {trend && (
              <span
                className={clsx(
                  'inline-flex items-center gap-0.5 font-bold px-2 py-0.5 rounded-md text-[11px]',
                  trend.isPositive ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 'bg-rose-100 text-rose-950 border border-rose-300'
                )}
              >
                {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5 text-emerald-800" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-800" />}
                {trend.value}
              </span>
            )}
            {subtitle && <span className="text-black font-bold">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
