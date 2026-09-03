import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gold' | 'plum' | 'berry' | 'blush' | 'cream';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    plum: 'bg-[#601D49]/10 text-[#601D49] border-[#601D49]/30',
    berry: 'bg-[#BD5579]/10 text-[#BD5579] border-[#BD5579]/30',
    blush: 'bg-[#EA9D9D]/20 text-[#601D49] border-[#EA9D9D]/50',
    cream: 'bg-[#FFEBB8]/80 text-[#601D49] border-[#FFEBB8]',
    gold: 'bg-[#FFEBB8] text-[#601D49] border-[#BD5579]/30 shadow-2xs',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    purple: 'bg-[#f5e7f0] text-[#601D49] border-[#edd1e3]',
  };

  const dotColors = {
    default: 'bg-slate-400',
    plum: 'bg-[#601D49]',
    berry: 'bg-[#BD5579]',
    blush: 'bg-[#EA9D9D]',
    cream: 'bg-[#FFEBB8]',
    gold: 'bg-[#BD5579]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-blue-500',
    purple: 'bg-[#601D49]',
  };

  const sizeStyles = {
    sm: 'text-[10.5px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-bold rounded-full border font-alata shadow-2xs',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
};
