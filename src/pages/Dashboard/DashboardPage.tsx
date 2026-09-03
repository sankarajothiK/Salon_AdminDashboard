import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Users,
  Calendar,
  IndianRupee,
  Activity,
  ArrowRight,
  Sparkles,
  Crown,
  Gem,
} from 'lucide-react';
import { useSalons } from '@/contexts/SalonContext';
import { analyticsService } from '@/services/analyticsService';
import { activityService } from '@/services/activityService';
import { PlatformMetrics, ActivityEvent } from '@/types';
import { StatCard } from '@/components/common/StatCard';
import { RevenueTrendChart } from '@/components/charts/RevenueTrendChart';
import { AppointmentStatusDonut } from '@/components/charts/AppointmentStatusDonut';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency, formatTimeAgo } from '@/utils/formatters';
import { ExportDropdown } from '@/components/common/ExportDropdown';

export const DashboardPage: React.FC = () => {
  const { selectedSalonId, selectedSalon } = useSalons();
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      const [metricsRes, actRes] = await Promise.all([
        analyticsService.getPlatformMetrics(selectedSalonId),
        activityService.getRecentActivity(15, selectedSalonId),
      ]);

      if (metricsRes.data) setMetrics(metricsRes.data);
      if (actRes.data) setActivities(actRes.data);
      setLoading(false);
    };

    loadDashboard();
  }, [selectedSalonId]);

  if (loading || !metrics) {
    return <LoadingSpinner message="Loading royal company analytics & live CRM telemetry..." size="lg" />;
  }

  const isMultiSalon = selectedSalonId === 'all';

  return (
    <div className="space-y-6 font-alata text-black">
      {/* Executive Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-100/70 via-emerald-50/50 to-white border-2 border-emerald-200 rounded-3xl p-6 sm:p-7 shadow-card-subtle">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-500 flex items-center justify-center text-white shadow-emerald-sm flex-shrink-0 border-2 border-emerald-300">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
              {isMultiSalon ? 'Company Platform Overview' : `${selectedSalon?.name || 'Salon'} Dashboard`}
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold shadow-2xs">
              Live Supabase
            </span>
          </div>
          <p className="text-xs text-black mt-1.5 leading-relaxed font-bold">
            {isMultiSalon
              ? 'Executive monitoring of multi-salon operations, transactions, customer retention, and stylists.'
              : `Operational telemetry for ${selectedSalon?.name}, located in ${selectedSalon?.city || 'India'}.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ExportDropdown
            data={metrics.revenueBySalon}
            fileName={`salon_crm_summary_${selectedSalonId}`}
            pdfConfig={{
              title: isMultiSalon ? 'Salon CRM — Platform Company Report' : `${selectedSalon?.name} Report`,
              subtitle: `Total Revenue: ${formatCurrency(metrics.thisMonthRevenue)} | Total Salons: ${metrics.totalSalons}`,
              headers: ['Salon Name', 'Total Revenue', 'Appointments'],
              rows: metrics.revenueBySalon.map((r) => [r.salonName, formatCurrency(r.revenue), r.appointments]),
            }}
          />
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isMultiSalon ? (
          <StatCard
            title="Total Salons"
            value={metrics.totalSalons}
            icon={<Store className="w-5 h-5" />}
            subtitle={`${metrics.activeSalons} actively operating`}
            variant="emerald"
          />
        ) : (
          <StatCard
            title="Salon Status"
            value="Active"
            icon={<Store className="w-5 h-5" />}
            subtitle={`Owner: ${selectedSalon?.owner_name || 'Owner'}`}
            variant="emerald"
          />
        )}

        <StatCard
          title="Total Customers"
          value={metrics.totalCustomers}
          icon={<Users className="w-5 h-5" />}
          subtitle={`${metrics.returningCustomers} repeat client visits`}
          variant="emerald"
        />

        <StatCard
          title="Today's Revenue"
          value={formatCurrency(metrics.todayRevenue)}
          icon={<IndianRupee className="w-5 h-5" />}
          subtitle={`Month: ${formatCurrency(metrics.thisMonthRevenue)}`}
          variant="emerald"
        />

        <StatCard
          title="Today's Appointments"
          value={metrics.todayAppointments}
          icon={<Calendar className="w-5 h-5" />}
          subtitle={`${metrics.completedAppointmentsToday} completed today`}
          variant="emerald"
        />
      </div>

      {/* Charts Section with Emerald & White Styling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-card-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-black">Revenue Trajectory (Last 14 Days)</h3>
              <p className="text-xs text-black font-semibold">Daily gross billing collection aggregated from invoices</p>
            </div>
            <span className="text-xs font-bold text-emerald-950 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
              {formatCurrency(metrics.dailyRevenueTrend.reduce((sum, d) => sum + d.revenue, 0))} Total
            </span>
          </div>
          <RevenueTrendChart data={metrics.dailyRevenueTrend} />
        </div>

        {/* Appointment Status Donut */}
        <div className="bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-card-subtle">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-black">Appointment Breakdown</h3>
            <p className="text-xs text-black font-semibold">Status distribution across bookings</p>
          </div>
          <AppointmentStatusDonut data={metrics.appointmentStatusCounts} />
        </div>
      </div>

      {/* Bottom Section: Salon Leaderboard & Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Salon Leaderboard */}
        <div className="lg:col-span-1 bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-card-subtle flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-black">Salon Performance</h3>
              <p className="text-xs text-black font-semibold">Revenue & volume ranking</p>
            </div>
            <Link to="/salons" className="text-xs text-emerald-700 hover:text-emerald-900 font-bold">
              View All &rarr;
            </Link>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {metrics.revenueBySalon.map((s, idx) => (
              <div
                key={s.salonId}
                className="p-3.5 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-950 flex items-center justify-center text-xs font-bold border border-emerald-300 shadow-2xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <Link
                      to={`/salons/${s.salonId}`}
                      className="text-xs font-bold text-black hover:text-emerald-700 transition-colors"
                    >
                      {s.salonName}
                    </Link>
                    <div className="text-[10.5px] text-emerald-900 font-semibold">{s.appointments} appointments</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-black">{formatCurrency(s.revenue)}</div>
                  <div className="text-[10px] text-emerald-900 font-bold">Collected</div>
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
                <h3 className="text-sm font-bold text-black">Recent Platform Activity</h3>
                <p className="text-xs text-black font-semibold">Live operational event stream across all salons</p>
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
