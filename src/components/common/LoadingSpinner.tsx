import React from 'react';
import { Loader2, Crown } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading platform data...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center font-alata">
      <div className="relative mb-3 flex items-center justify-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-amber-600`} />
      </div>
      <p className="text-xs text-slate-600 font-medium animate-pulse">{message}</p>
    </div>
  );
};
