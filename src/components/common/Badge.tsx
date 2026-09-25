import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gold' | 'plum' | 'berry' | 'blush' | 'cream' | 'emerald' | 'wine' | 'dark';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  dot = false,
  className,
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border-slate-300',
    gold: 'bg-[#FCF9EE] text-[#161826] border-[#D4AF37]/40 shadow-2xs',
    dark: 'bg-[#161826] text-[#DFB847] border-[#161826] shadow-2xs',
    wine: 'bg-[#FCF9EE] text-[#161826] border-[#D4AF37]/40 shadow-2xs',
    plum: 'bg-[#FCF9EE] text-[#161826] border-[#D4AF37]/40 shadow-2xs',
    berry: 'bg-[#161826] text-[#DFB847] border-[#161826] shadow-2xs',
    blush: 'bg-[#FCF9EE] text-[#161826] border-[#D4AF37]/30',
    cream: 'bg-[#FCF9EE] text-[#161826] border-[#D4AF37]/40',
    emerald: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    success: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    warning: 'bg-amber-100 text-amber-950 border-amber-300',
    danger: 'bg-rose-100 text-rose-950 border-rose-300',
    info: 'bg-blue-100 text-blue-950 border-blue-300',
    purple: 'bg-[#FCF9EE] text-[#161826] border-[#D4AF37]/40',
  };

  const dotColors = {
    default: 'bg-slate-500',
    gold: 'bg-[#D4AF37]',
    dark: 'bg-[#DFB847]',
    wine: 'bg-[#D4AF37]',
    plum: 'bg-[#D4AF37]',
    berry: 'bg-[#DFB847]',
    blush: 'bg-[#D4AF37]',
    cream: 'bg-[#D4AF37]',
    emerald: 'bg-emerald-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    danger: 'bg-rose-600',
    info: 'bg-blue-600',
    purple: 'bg-[#D4AF37]',
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
