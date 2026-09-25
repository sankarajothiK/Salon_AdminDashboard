import { salonService } from './salonService';
import { appointmentService } from './appointmentService';
import { billingService } from './billingService';
import { SystemAlert } from '@/types';

export const alertService = {
  /**
   * Evaluate rule-based system and salon health alerts
   */
  async getSystemAlerts(): Promise<{ data: SystemAlert[]; error: string | null }> {
    try {
      const [salonsRes, apptsRes, billsRes] = await Promise.all([
        salonService.getSalons(),
        appointmentService.getAppointments(),
        billingService.getBills(),
      ]);

      const salons = salonsRes.data || [];
      const appointments = apptsRes.data || [];
      const bills = billsRes.data || [];

      const alerts: SystemAlert[] = [];
      const now = Date.now();
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

      salons.forEach((salon) => {
        const salonAppts = appointments.filter((a) => a.salon_id === salon.id);
        const salonBills = bills.filter((b) => b.salon_id === salon.id);

        // 1. Inactivity Alert: No appointments or bills in 7+ days
        const lastActivityDate = [
          ...salonAppts.map((a) => new Date(a.created_at || a.start_time).getTime()),
          ...salonBills.map((b) => new Date(b.created_at).getTime()),
          new Date(salon.created_at).getTime(),
        ].sort((a, b) => b - a)[0];

        if (lastActivityDate && now - lastActivityDate > SEVEN_DAYS_MS) {
          const daysInactive = Math.floor((now - lastActivityDate) / (1000 * 60 * 60 * 24));
          alerts.push({
            id: `alert-inactive-${salon.id}`,
            salonId: salon.id,
            salonName: salon.name,
            type: 'inactivity',
            severity: daysInactive > 14 ? 'high' : 'medium',
            title: `Prolonged Salon Inactivity (${daysInactive} Days)`,
            message: `${salon.name} has had no appointments or billing activity recorded for the past ${daysInactive} days.`,
            timestamp: new Date().toISOString(),
          });
        }

        // 2. High Cancellation Rate Alert
        if (salonAppts.length >= 3) {
          const cancelledCount = salonAppts.filter((a) => a.status === 'cancelled' || a.status === 'noshow').length;
          const cancelRate = Math.round((cancelledCount / salonAppts.length) * 100);
          if (cancelRate >= 30) {
            alerts.push({
              id: `alert-cancel-${salon.id}`,
              salonId: salon.id,
              salonName: salon.name,
              type: 'cancellation_spike',
              severity: 'high',
              title: `High Cancellation Rate (${cancelRate}%)`,
              message: `${cancelledCount} of ${salonAppts.length} appointments at ${salon.name} were cancelled or marked no-show.`,
              timestamp: new Date().toISOString(),
            });
          }
        }
      });

      return { data: alerts, error: null };
    } catch (err: any) {
      console.error('alertService.getSystemAlerts error:', err);
      return { data: [], error: err.message || 'Failed to evaluate alerts' };
    }
  },
};
