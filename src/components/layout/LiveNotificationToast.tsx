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
          className="pointer-events-auto bg-white border border-amber-300 rounded-2xl p-4 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">{notif.title}</span>
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                <div className="text-[10px] text-slate-400 mt-1.5">{formatTimeAgo(notif.timestamp)}</div>
              </div>
            </div>
            <button
              onClick={() => clearNotification(notif.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
