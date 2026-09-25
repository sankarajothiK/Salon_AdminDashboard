import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { alertService } from '@/services/alertService';
import { SystemAlert } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      const res = await alertService.getSystemAlerts();
      if (res.data) setAlerts(res.data);
      setLoading(false);
    };

    fetchAlerts();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Evaluating health heuristics and operational flags..." size="md" />;
  }

  const getSeverityStyle = (sev: SystemAlert['severity']) => {
    switch (sev) {
      case 'critical':
      case 'high':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          badge: 'bg-rose-100 text-rose-900 border-rose-300',
        };
      case 'medium':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          badge: 'bg-amber-100 text-amber-900 border-amber-300',
        };
      default:
        return {
          bg: 'bg-[#FCF9EE] border-[#D4AF37]/30 text-[#161826]',
          badge: 'bg-[#FCF9EE] text-[#161826] border-[#D4AF37]/40',
        };
    }
  };

  return (
    <div className="space-y-6 font-alata text-[#161826]">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#161826] tracking-tight">System & Salon Health Alerts</h1>
        <p className="text-xs text-[#161826]/80 font-semibold mt-1">
          Automated rule-based heuristics detecting salon inactivity, cancellation spikes, and messaging failures ({alerts.length} active flags)
        </p>
      </div>

      {/* Alerts Grid with Gold & Dark Styling */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="bg-white border border-[#D4AF37]/25 rounded-2xl p-12 text-center shadow-card-subtle">
            <div className="w-12 h-12 rounded-2xl bg-[#FCF9EE] text-[#D4AF37] flex items-center justify-center mx-auto mb-3 border border-[#D4AF37]/30 shadow-2xs">
              <CheckCircle2 className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h3 className="text-sm font-bold text-[#161826]">All Salons Operational & Healthy</h3>
            <p className="text-xs text-[#161826]/75 font-semibold mt-1 max-w-sm mx-auto">
              No inactivity flags, excessive cancellations, or delivery exceptions detected.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);

            return (
              <div
                key={alert.id}
                className="bg-white border-2 border-[#D4AF37]/25 rounded-2xl p-5 hover:border-[#D4AF37] transition-all shadow-card-subtle"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 shadow-2xs ${style.bg}`}>
                      <AlertTriangle className="w-5 h-5 text-current" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#161826]">{alert.title}</h3>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${style.badge}`}>
                          {alert.severity}
                        </span>
                        <span className="text-[10.5px] font-bold text-[#161826] px-2 py-0.5 rounded bg-[#FCF9EE] border border-[#D4AF37]/30">
                          {alert.salonName}
                        </span>
                      </div>
                      <p className="text-xs text-[#161826]/80 font-semibold mt-1 leading-relaxed">{alert.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
