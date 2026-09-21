import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'gold' | 'berry' | 'emerald' | 'wine';
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
    // Primary Royal Wine #601D49
    primary: 'bg-[#601D49] hover:bg-[#7d2347] text-[#FFEBB8] shadow-wine-sm focus:ring-[#601D49]',
    wine: 'bg-gradient-to-r from-[#601D49] to-[#BD5579] hover:opacity-95 text-[#FFEBB8] shadow-wine-sm focus:ring-[#601D49]',
    berry: 'bg-[#BD5579] hover:bg-[#9e355c] text-white shadow-wine-sm focus:ring-[#BD5579]',
    gold: 'bg-[#FFEBB8] hover:bg-[#ffd580] text-black border border-[#BD5579]/30 focus:ring-[#BD5579]',
    secondary: 'bg-white hover:bg-[#fdf2f7] text-black border-2 border-[#BD5579]/30 focus:ring-[#601D49]',
    outline: 'border-2 border-[#601D49] text-[#601D49] hover:bg-[#fdf2f7] focus:ring-[#601D49]',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500',
    ghost: 'text-black hover:bg-[#fdf2f7] hover:text-[#601D49] focus:ring-[#601D49] shadow-none',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500',
    emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500',
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
