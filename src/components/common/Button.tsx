import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'gold' | 'berry' | 'emerald' | 'wine' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'gold',
  size = 'md',
  loading = false,
  disabled,
  icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-alata shadow-2xs';

  const variantStyles = {
    // Gold & Dark Accent Palette (#161826 & #D4AF37)
    gold: 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:opacity-95 text-[#161826] shadow-gold-sm focus:ring-[#D4AF37]',
    primary: 'bg-[#161826] hover:bg-[#252A3F] text-[#DFB847] shadow-dark-sm focus:ring-[#161826] border border-[#D4AF37]/30',
    dark: 'bg-[#161826] hover:bg-[#252A3F] text-[#DFB847] shadow-dark-sm focus:ring-[#161826]',
    wine: 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:opacity-95 text-[#161826] shadow-gold-sm focus:ring-[#D4AF37]',
    berry: 'bg-[#161826] hover:bg-[#252A3F] text-[#DFB847] shadow-dark-sm focus:ring-[#161826]',
    secondary: 'bg-white hover:bg-[#FCF9EE] text-[#161826] border-2 border-[#D4AF37]/30 focus:ring-[#D4AF37]',
    outline: 'border-2 border-[#D4AF37] text-[#161826] hover:bg-[#FCF9EE] focus:ring-[#D4AF37]',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500',
    ghost: 'text-[#161826] hover:bg-[#FCF9EE] hover:text-[#D4AF37] focus:ring-[#D4AF37] shadow-none',
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
