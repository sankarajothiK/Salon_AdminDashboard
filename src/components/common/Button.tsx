import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'gold' | 'berry' | 'emerald';
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
    // Primary Emerald #059669
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-sm focus:ring-emerald-500',
    emerald: 'bg-gradient-to-r from-emerald-700 to-emerald-500 hover:opacity-95 text-white shadow-emerald-sm focus:ring-emerald-500',
    berry: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-sm focus:ring-emerald-500',
    gold: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 focus:ring-emerald-500',
    secondary: 'bg-white hover:bg-emerald-50 text-emerald-950 border-2 border-emerald-200 focus:ring-emerald-500',
    outline: 'border-2 border-emerald-600 text-emerald-800 hover:bg-emerald-50 focus:ring-emerald-500',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500',
    ghost: 'text-emerald-950 hover:bg-emerald-50 focus:ring-emerald-500 shadow-none',
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
