import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gold' | 'plum' | 'berry' | 'blush' | 'cream' | 'emerald';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  size = 'md',
  dot = false,
  className,
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border-slate-300',
    emerald: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    plum: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    berry: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    blush: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    cream: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    gold: 'bg-emerald-100 text-emerald-950 border-emerald-300 shadow-2xs',
    success: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    warning: 'bg-amber-100 text-amber-950 border-amber-300',
    danger: 'bg-rose-100 text-rose-950 border-rose-300',
    info: 'bg-blue-100 text-blue-950 border-blue-300',
    purple: 'bg-emerald-100 text-emerald-950 border-emerald-300',
  };

  const dotColors = {
    default: 'bg-slate-500',
    emerald: 'bg-emerald-600',
    plum: 'bg-emerald-600',
    berry: 'bg-emerald-600',
    blush: 'bg-emerald-500',
    cream: 'bg-emerald-500',
    gold: 'bg-emerald-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    danger: 'bg-rose-600',
    info: 'bg-blue-600',
    purple: 'bg-emerald-600',
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
