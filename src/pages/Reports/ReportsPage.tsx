import React, { useState, useEffect } from 'react';
import {
  Gem,
  Download,
  Calendar,
  IndianRupee,
  Users,
  Store,
  Crown,
} from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import { useSalons } from '@/contexts/SalonContext';
import { PlatformMetrics } from '@/types';
import { RevenueTrendChart } from '@/components/charts/RevenueTrendChart';
import { SalonComparisonChart } from '@/components/charts/SalonComparisonChart';
import { AppointmentStatusDonut } from '@/components/charts/AppointmentStatusDonut';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ExportDropdown } from '@/components/common/ExportDropdown';
import { formatCurrency } from '@/utils/formatters';

export const ReportsPage: React.FC = () => {
  const { salons, selectedSalonId } = useSalons();
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const res = await analyticsService.getPlatformMetrics(selectedSalonId);
      if (res.data) setMetrics(res.data);
      setLoading(false);
    };

    fetchReports();
  }, [selectedSalonId]);

  if (loading || !metrics) {
    return <LoadingSpinner message="Generating executive business intelligence reports..." size="lg" />;
  }

  return (
    <div className="space-y-6 font-alata text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">Executive Business Intelligence</h1>
          <p className="text-xs text-black font-semibold mt-1">
            Comparative salon metrics, revenue trajectories, and downloadable board-ready reports
          </p>
        </div>

        <ExportDropdown
          data={metrics.revenueBySalon}
          fileName="executive_bi_report"
          pdfConfig={{
            title: 'Salon CRM Executive BI & Analytics Report',
            subtitle: `Generated on ${new Date().toLocaleDateString()} | Total Revenue: ${formatCurrency(metrics.thisMonthRevenue)}`,
            headers: ['Salon Name', 'Total Gross Billing', 'Total Appointments'],
            rows: metrics.revenueBySalon.map((r) => [r.salonName, formatCurrency(r.revenue), r.appointments]),
          }}
        />
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-[#BD5579]/20 rounded-2xl p-5 shadow-card-subtle">
          <div className="text-xs font-bold uppercase text-black">Gross Monthly Revenue</div>
          <div className="text-2xl font-bold text-black mt-1">{formatCurrency(metrics.thisMonthRevenue)}</div>
          <div className="text-[11px] text-black font-bold mt-1">Aggregated across all salons</div>
        </div>

        <div className="bg-white border-2 border-[#BD5579]/20 rounded-2xl p-5 shadow-card-subtle">
          <div className="text-xs font-bold uppercase text-black">Total Customer Base</div>
          <div className="text-2xl font-bold text-black mt-1">{metrics.totalCustomers}</div>
          <div className="text-[11px] text-black font-bold mt-1">{metrics.returningCustomers} repeat clients</div>
        </div>

        <div className="bg-white border-2 border-[#BD5579]/20 rounded-2xl p-5 shadow-card-subtle">
          <div className="text-xs font-bold uppercase text-black">Active Salons</div>
          <div className="text-2xl font-bold text-black mt-1">{metrics.activeSalons} / {metrics.totalSalons}</div>
          <div className="text-[11px] text-black font-bold mt-1">100% Operational health</div>
        </div>

        <div className="bg-white border-2 border-[#BD5579]/20 rounded-2xl p-5 shadow-card-subtle">
          <div className="text-xs font-bold uppercase text-black">Today's Completed</div>
          <div className="text-2xl font-bold text-black mt-1">{metrics.completedAppointmentsToday}</div>
          <div className="text-[11px] text-black font-bold mt-1">{metrics.todayAppointments} total scheduled</div>
        </div>
      </div>

      {/* Comparative Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-[#BD5579]/20 rounded-2xl p-6 shadow-card-subtle space-y-4">
          <div>
            <h3 className="text-sm font-bold text-black">Salon Revenue Comparison</h3>
            <p className="text-xs text-black font-semibold">Billing comparison across all salons</p>
          </div>
          <SalonComparisonChart data={metrics.revenueBySalon} />
        </div>

        <div className="bg-white border-2 border-[#BD5579]/20 rounded-2xl p-6 shadow-card-subtle space-y-4">
          <div>
            <h3 className="text-sm font-bold text-black">14-Day Revenue Trajectory</h3>
            <p className="text-xs text-black font-semibold">Daily gross collection trends</p>
          </div>
          <RevenueTrendChart data={metrics.dailyRevenueTrend} />
        </div>
      </div>
    </div>
  );
};
