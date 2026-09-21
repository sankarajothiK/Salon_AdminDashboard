import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gold' | 'plum' | 'berry' | 'blush' | 'cream' | 'emerald' | 'wine';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'wine',
  size = 'md',
  dot = false,
  className,
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border-slate-300',
    wine: 'bg-[#fdf2f7] text-[#601D49] border-[#BD5579]/30',
    plum: 'bg-[#fdf2f7] text-[#601D49] border-[#BD5579]/30',
    berry: 'bg-[#fce7f1] text-[#BD5579] border-[#BD5579]/30',
    blush: 'bg-[#fdf2f7] text-[#601D49] border-[#EA9D9D]/40',
    cream: 'bg-[#FFEBB8] text-black border-[#BD5579]/30',
    gold: 'bg-[#FFEBB8] text-black border-[#BD5579]/30 shadow-2xs',
    emerald: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    success: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    warning: 'bg-amber-100 text-amber-950 border-amber-300',
    danger: 'bg-rose-100 text-rose-950 border-rose-300',
    info: 'bg-blue-100 text-blue-950 border-blue-300',
    purple: 'bg-[#fdf2f7] text-[#601D49] border-[#BD5579]/30',
  };

  const dotColors = {
    default: 'bg-slate-500',
    wine: 'bg-[#601D49]',
    plum: 'bg-[#601D49]',
    berry: 'bg-[#BD5579]',
    blush: 'bg-[#EA9D9D]',
    cream: 'bg-[#BD5579]',
    gold: 'bg-[#601D49]',
    emerald: 'bg-emerald-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    danger: 'bg-rose-600',
    info: 'bg-blue-600',
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
