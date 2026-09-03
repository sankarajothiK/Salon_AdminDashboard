import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'gold' | 'berry';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-alata shadow-2xs';

  const variantStyles = {
    // Primary #601D49
    primary: 'bg-[#601D49] hover:bg-[#78245b] text-[#FFEBB8] shadow-plum-sm focus:ring-[#601D49]',
    // Berry & Blush Gradient #BD5579 -> #EA9D9D
    berry: 'bg-gradient-to-r from-[#601D49] via-[#BD5579] to-[#EA9D9D] hover:opacity-95 text-white shadow-plum-sm focus:ring-[#BD5579]',
    gold: 'bg-gradient-to-r from-[#BD5579] via-[#EA9D9D] to-[#FFEBB8] hover:opacity-95 text-[#601D49] shadow-berry-sm focus:ring-[#EA9D9D]',
    secondary: 'bg-white hover:bg-[#fdf4f7] text-[#601D49] border border-[#BD5579]/20 focus:ring-[#BD5579]',
    outline: 'border border-[#BD5579] text-[#601D49] hover:bg-[#FFEBB8]/40 focus:ring-[#BD5579]',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500',
    ghost: 'text-[#601D49] hover:bg-[#fdf4f7] focus:ring-[#BD5579] shadow-none',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs px-4 py-2.5 gap-2',
    lg: 'text-sm px-5 py-3 gap-2.5',
  };

  return (
    <button
      className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};
