import React from 'react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { Bell, X, Sparkles } from 'lucide-react';
import { formatTimeAgo } from '@/utils/formatters';

export const LiveNotificationToast: React.FC = () => {
  const { liveNotifications, clearNotification } = useRealtime();

  if (!liveNotifications.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm w-full pointer-events-none font-alata">
      {liveNotifications.slice(0, 3).map((notif) => (
        <div
          key={notif.id}
          className="pointer-events-auto bg-white border border-[#BD5579]/30 rounded-2xl p-4 shadow-wine-md backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 text-black font-bold"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#fdf5f8] border border-[#BD5579]/20 text-[#601D49] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                <Sparkles className="w-4 h-4 text-[#BD5579]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-black">{notif.title}</span>
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BD5579] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#601D49]"></span>
                  </span>
                </div>
                <p className="text-xs text-black/80 mt-1 font-semibold">{notif.message}</p>
                <div className="text-[10px] text-[#BD5579] mt-1.5 font-bold">{formatTimeAgo(notif.timestamp)}</div>
              </div>
            </div>
            <button
              onClick={() => clearNotification(notif.id)}
              className="text-black/50 hover:text-black p-1 rounded-md hover:bg-wine-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
