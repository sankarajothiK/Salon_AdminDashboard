import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center font-alata">
      <div className="w-14 h-14 rounded-2xl bg-[#FCF9EE] border-2 border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-4 shadow-2xs">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-bold text-[#161826]">{title}</h3>
      {description && <p className="text-xs text-[#161826]/75 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
