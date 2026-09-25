import { salonService } from './salonService';
import { customerService } from './customerService';
import { appointmentService } from './appointmentService';
import { billingService } from './billingService';
import { staffService } from './staffService';
import { PlatformMetrics } from '@/types';
import { format, subDays, startOfMonth } from 'date-fns';

export const analyticsService = {
  /**
   * Fetch company-level and salon-level comprehensive BI metrics
   */
  async getPlatformMetrics(salonId?: string): Promise<{ data: PlatformMetrics | null; error: string | null }> {
    try {
      // 1. Fetch mapped domain entities in parallel
      const [salonsRes, customersRes, apptsRes, billsRes, staffRes] = await Promise.all([
        salonService.getSalons(),
        customerService.getCustomers(salonId),
        appointmentService.getAppointments(salonId),
        billingService.getBills(salonId),
        staffService.getStaff(salonId),
      ]);

      let salons = salonsRes.data || [];
      const customers = customersRes.data || [];
      const appointments = apptsRes.data || [];
      const bills = billsRes.data || [];
      const staff = staffRes.data || [];

      if (salonId && salonId !== 'all') {
        salons = salons.filter((s) => s.id === salonId);
      }

      // Calculate time boundaries
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const monthStart = startOfMonth(now).getTime();

      // Today's appointments & completion
      const todayAppts = appointments.filter((a) => {
        const t = new Date(a.start_time || a.created_at).getTime();
        return t >= todayStart;
      });
      const completedToday = todayAppts.filter((a) => a.status === 'completed').length;

      // Revenue computations
      let todayRevenue = 0;
      let thisMonthRevenue = 0;

      bills.forEach((b) => {
        const amount = Number(b.total) || 0;
        const time = new Date(b.created_at).getTime();
        if (time >= todayStart) todayRevenue += amount;
        if (time >= monthStart) thisMonthRevenue += amount;
      });

      // Customer computations
      const newThisMonth = customers.filter((c) => new Date(c.created_at).getTime() >= monthStart).length;
      const returningCount = customers.filter((c) => {
        const count = bills.filter((b) => b.customer_id === c.id).length;
        return count > 1;
      }).length;

      // Revenue by Salon
      const salonRevenueMap: Record<string, { name: string; revenue: number; appointments: number }> = {};
      salons.forEach((s) => {
        salonRevenueMap[s.id] = { name: s.name, revenue: 0, appointments: 0 };
      });

      bills.forEach((b) => {
        const sId = b.salon_id;
        if (sId && salonRevenueMap[sId]) {
          salonRevenueMap[sId].revenue += Number(b.total) || 0;
        }
      });

      appointments.forEach((a) => {
        const sId = a.salon_id;
        if (sId && salonRevenueMap[sId]) {
          salonRevenueMap[sId].appointments += 1;
        }
      });

      const revenueBySalon = Object.entries(salonRevenueMap).map(([id, data]) => ({
        salonId: id,
        salonName: data.name,
        revenue: data.revenue,
        appointments: data.appointments,
      })).sort((a, b) => b.revenue - a.revenue);

      // Daily Revenue Trend (Last 14 days)
      const trendMap: Record<string, { revenue: number; count: number }> = {};
      for (let i = 13; i >= 0; i--) {
        const d = format(subDays(now, i), 'yyyy-MM-dd');
        trendMap[d] = { revenue: 0, count: 0 };
      }

      bills.forEach((b) => {
        try {
          const d = format(new Date(b.created_at), 'yyyy-MM-dd');
          if (trendMap[d]) {
            trendMap[d].revenue += Number(b.total) || 0;
            trendMap[d].count += 1;
          }
        } catch (e) {}
      });

      const dailyRevenueTrend = Object.entries(trendMap).map(([date, val]) => ({
        date: format(new Date(date), 'dd MMM'),
        revenue: val.revenue,
        count: val.count,
      }));

      // Status breakdown
      const statusMap: Record<string, number> = {
        completed: 0,
        scheduled: 0,
        confirmed: 0,
        in_progress: 0,
        cancelled: 0,
        noshow: 0,
      };

      appointments.forEach((a) => {
        const s = (a.status || 'scheduled').toLowerCase();
        statusMap[s] = (statusMap[s] || 0) + 1;
      });

      const appointmentStatusCounts = Object.entries(statusMap).map(([status, count]) => ({
        status: status.replace('_', ' ').toUpperCase(),
        count,
      }));

      const activeSalonsCount = salons.filter((s) => {
        const lastAppt = appointments.find((a) => a.salon_id === s.id);
        const lastBill = bills.find((b) => b.salon_id === s.id);
        return !!(lastAppt || lastBill);
      }).length || salons.length;

      return {
        data: {
          totalSalons: salons.length,
          activeSalons: activeSalonsCount,
          totalCustomers: customers.length,
          newCustomersThisMonth: newThisMonth,
          returningCustomers: returningCount,
          todayAppointments: todayAppts.length,
          completedAppointmentsToday: completedToday,
          todayRevenue,
          thisMonthRevenue,
          totalStaff: staff.length,
          revenueBySalon,
          dailyRevenueTrend,
          appointmentStatusCounts,
        },
        error: null,
      };
    } catch (err: any) {
      console.error('analyticsService.getPlatformMetrics error:', err);
      return { data: null, error: err.message || 'Failed to aggregate analytics' };
    }
  },
};
