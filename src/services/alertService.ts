import { supabase } from '@/lib/supabase';
import { SystemAlert } from '@/types';

export const alertService = {
  /**
   * Evaluate rule-based system and salon health alerts
   */
  async getSystemAlerts(): Promise<{ data: SystemAlert[]; error: string | null }> {
    try {
      const [salonsRes, apptsRes, billsRes, waRes] = await Promise.all([
        supabase.from('salons').select('*'),
        supabase.from('appointments').select('*'),
        supabase.from('bills').select('*'),
        supabase.from('whatsapp_messages').select('*'),
      ]);

      const salons = salonsRes.data || [];
      const appointments = apptsRes.data || [];
      const bills = billsRes.data || [];
      const whatsappMessages = waRes.data || [];

      const alerts: SystemAlert[] = [];
      const now = Date.now();
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

      salons.forEach((salon) => {
        const salonAppts = appointments.filter((a) => a.salon_id === salon.id);
        const salonBills = bills.filter((b) => b.salon_id === salon.id);
        const salonWA = whatsappMessages.filter((w) => w.salon_id === salon.id);

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

        // 3. WhatsApp Messaging Failure Alert
        const failedWA = salonWA.filter((w) => w.status === 'failed');
        if (failedWA.length > 0) {
          alerts.push({
            id: `alert-wa-${salon.id}`,
            salonId: salon.id,
            salonName: salon.name,
            type: 'failed_messaging',
            severity: 'medium',
            title: `WhatsApp Invoicing Delivery Issue (${failedWA.length} Failed)`,
            message: `${failedWA.length} automated WhatsApp invoice dispatches failed due to missing API token or rate limit.`,
            timestamp: failedWA[0]?.created_at || new Date().toISOString(),
          });
        }
      });

      return { data: alerts, error: null };
    } catch (err: any) {
      console.error('alertService.getSystemAlerts error:', err);
      return { data: [], error: err.message || 'Failed to evaluate alerts' };
    }
  },
};
