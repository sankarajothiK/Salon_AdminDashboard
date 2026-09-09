import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserX,
  MessageSquare,
  Gem,
  Activity,
  ArrowRight,
  Crown,
  IndianRupee,
} from 'lucide-react';
import { useSalons } from '@/contexts/SalonContext';
import { analyticsService } from '@/services/analyticsService';
import { activityService } from '@/services/activityService';
import { telemetryService } from '@/services/telemetryService';
import { supportMessageService } from '@/services/supportMessageService';
import { PlatformMetrics, ActivityEvent, SupportMessage } from '@/types';
import { StatCard } from '@/components/common/StatCard';
import { RevenueTrendChart } from '@/components/charts/RevenueTrendChart';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency, formatTimeAgo } from '@/utils/formatters';
import { ExportDropdown } from '@/components/common/ExportDropdown';

export const DashboardPage: React.FC = () => {
  const { selectedSalonId, selectedSalon } = useSalons();
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [telemetrySummary, setTelemetrySummary] = useState<{
    active: number;
    inactive: number;
    uninstalled: number;
    deleted: number;
    total: number;
    versionBreakdown: { version: string; count: number; percentage: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      const [metricsRes, actRes, telRes, suppRes] = await Promise.all([
        analyticsService.getPlatformMetrics(selectedSalonId),
        activityService.getRecentActivity(15, selectedSalonId),
        telemetryService.getStatusSummary(),
        supportMessageService.getSupportMessages({ status: 'open' }),
      ]);

      if (metricsRes.data) setMetrics(metricsRes.data);
      if (actRes.data) setActivities(actRes.data);
      if (telRes) setTelemetrySummary(telRes);
      if (suppRes.data) setSupportMessages(suppRes.data);
      setLoading(false);
    };

    loadDashboard();
  }, [selectedSalonId]);

  if (loading || !metrics) {
    return <LoadingSpinner message="Loading executive company telemetry & platform intelligence..." size="lg" />;
  }

  const isMultiSalon = selectedSalonId === 'all';

  return (
    <div className="space-y-6 font-alata text-black">
      {/* Executive Company Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-100/70 via-emerald-50/50 to-white border-2 border-emerald-200 rounded-3xl p-6 sm:p-7 shadow-card-subtle">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-500 flex items-center justify-center text-white shadow-emerald-sm flex-shrink-0 border-2 border-emerald-300">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
              {isMultiSalon ? 'Company Platform Overview' : `${selectedSalon?.name || 'Salon'} Telemetry`}
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold shadow-2xs">
              Live Supabase
            </span>
          </div>
          <p className="text-xs text-black mt-1.5 leading-relaxed font-bold">
            High-level executive telemetry for salon onboardings, app version distribution, active user states, support tickets, and system health.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/reports"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-emerald-sm transition-all"
          >
            <Gem className="w-3.5 h-3.5 text-white" />
            <span>Executive BI Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards: Active Users, Inactive, Uninstalled, Deleted, Support */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Salons"
          value={telemetrySummary?.active || metrics.activeSalons}
          icon={<CheckCircle2 className="w-5 h-5" />}
          subtitle="Operating in last 14 days"
          variant="emerald"
        />

        <StatCard
          title="Inactive Accounts"
          value={telemetrySummary?.inactive || 0}
          icon={<Clock className="w-5 h-5" />}
          subtitle="Dormant 14–45 days"
          variant="amber"
        />

        <StatCard
          title="Uninstalled App"
          value={telemetrySummary?.uninstalled || 0}
          icon={<Smartphone className="w-5 h-5" />}
          subtitle="Disconnected >45 days"
          variant="rose"
        />

        <StatCard
          title="Open Support Inquiries"
          value={supportMessages.length}
          icon={<MessageSquare className="w-5 h-5" />}
          subtitle="Needs team response"
          variant="blue"
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-emerald-100 rounded-2xl p-5 shadow-card-subtle flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-black">Current App Version</div>
            <div className="text-xl font-bold text-black mt-1">v1.0.0 (Release)</div>
            <div className="text-[11px] text-emerald-900 font-bold mt-0.5">100% adoption on Android</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
            <Smartphone className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border-2 border-emerald-100 rounded-2xl p-5 shadow-card-subtle flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-black">Platform Billing Total</div>
            <div className="text-xl font-bold text-black mt-1">{formatCurrency(metrics.thisMonthRevenue)}</div>
            <div className="text-[11px] text-emerald-900 font-bold mt-0.5">Aggregated platform billing</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border-2 border-emerald-100 rounded-2xl p-5 shadow-card-subtle flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-black">Deleted Accounts</div>
            <div className="text-xl font-bold text-black mt-1">{telemetrySummary?.deleted || 0}</div>
            <div className="text-[11px] text-rose-900 font-bold mt-0.5">Exit feedback audited</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-800">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trajectory Chart */}
        <div className="lg:col-span-2 bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-card-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-black">Revenue Trajectory (Last 14 Days)</h3>
              <p className="text-xs text-black font-semibold">Daily gross collection trends</p>
            </div>
            <Link
              to="/reports"
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
            >
              <span>Full BI Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <RevenueTrendChart data={metrics.dailyRevenueTrend} />
        </div>

        {/* Live Support Inquiries Stream */}
        <div className="bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-card-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-black">Customer Support Inquiries</h3>
                <p className="text-xs text-black font-semibold">Recent open tickets</p>
              </div>
              <Link to="/support-messages" className="text-xs text-emerald-700 hover:text-emerald-900 font-bold">
                View All &rarr;
              </Link>
            </div>

            <div className="space-y-2.5">
              {supportMessages.length === 0 ? (
                <div className="text-center py-8 text-xs text-black font-bold">No open support inquiries</div>
              ) : (
                supportMessages.slice(0, 4).map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-black">
                      <span className="truncate max-w-[150px]">{msg.customer_name}</span>
                      <span className="text-[10px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 uppercase">
                        {msg.priority}
                      </span>
                    </div>
                    <p className="text-black font-semibold text-xs mt-1 truncate">{msg.subject}</p>
                    <div className="text-[10px] text-emerald-900 font-semibold mt-1">
                      {formatTimeAgo(msg.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/support-messages"
            className="w-full mt-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-xs font-bold text-emerald-950 text-center transition-all"
          >
            Open Support Center
          </Link>
        </div>
      </div>

      {/* Bottom Row: Salon Directory Snippet & Activity Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Salon Status Snapshot */}
        <div className="lg:col-span-1 bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-card-subtle flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-black">Salon Directory Snapshot</h3>
              <p className="text-xs text-black font-semibold">Registered partners</p>
            </div>
            <Link to="/salons" className="text-xs text-emerald-700 hover:text-emerald-900 font-bold">
              All Salons &rarr;
            </Link>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {metrics.revenueBySalon.map((s) => (
              <div
                key={s.salonId}
                className="p-3.5 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 transition-all flex items-center justify-between"
              >
                <div>
                  <Link
                    to={`/salons/${s.salonId}`}
                    className="text-xs font-bold text-black hover:text-emerald-700 transition-colors"
                  >
                    {s.salonName}
                  </Link>
                  <div className="text-[10.5px] text-emerald-900 font-semibold">{s.appointments} bookings</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-950 border border-emerald-300">
                    Active (v1.0.0)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live System Activity Feed */}
        <div className="lg:col-span-2 bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-card-subtle flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <div>
                <h3 className="text-sm font-bold text-black">Platform Activity & Audit Trail</h3>
                <p className="text-xs text-black font-semibold">Live operational events & health logs</p>
              </div>
            </div>
            <Link to="/activity" className="text-xs text-emerald-700 hover:text-emerald-900 font-bold">
              Full Audit Stream &rarr;
            </Link>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-96 pr-1">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-xs text-black font-bold">No recent activity detected</div>
            ) : (
              activities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 transition-all flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black">{act.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-950 font-bold border border-emerald-300">
                          {act.salonName}
                        </span>
                      </div>
                      <p className="text-black font-semibold text-xs mt-0.5">{act.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-900 font-bold whitespace-nowrap flex-shrink-0">
                    {formatTimeAgo(act.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
