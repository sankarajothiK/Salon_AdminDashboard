import { salonService } from './salonService';
import { customerService } from './customerService';
import { appointmentService } from './appointmentService';
import { billingService } from './billingService';
import { accountDeletionService } from './accountDeletionService';
import { ActivityEvent } from '@/types';
import { formatCurrency } from '@/utils/formatters';

export const activityService = {
  /**
   * Aggregate real activity events across tables into a unified chronological stream
   */
  async getRecentActivity(limit = 40, salonId?: string): Promise<{ data: ActivityEvent[]; error: string | null }> {
    try {
      // 1. Fetch domain records in parallel
      const [salonsRes, customersRes, apptsRes, billsRes, deletionsRes] = await Promise.all([
        salonService.getSalons(),
        customerService.getCustomers(salonId),
        appointmentService.getAppointments(salonId),
        billingService.getBills(salonId),
        accountDeletionService.getAccountDeletions(),
      ]);

      const salons = salonsRes.data || [];
      const customers = customersRes.data || [];
      const appointments = apptsRes.data || [];
      const bills = billsRes.data || [];
      const deletions = deletionsRes.data || [];

      const salonMap = new Map<string, string>();
      salons.forEach((s) => salonMap.set(s.id, s.name));

      const events: ActivityEvent[] = [];

      // Process Account Deletions
      deletions.forEach((d) => {
        if (!salonId || salonId === 'all' || d.salon_id === salonId) {
          events.push({
            id: `del-${d.id}`,
            type: 'account_deleted',
            title: `Account Deleted: ${d.salon_name}`,
            description: `Salon owner requested account deletion. Reason: "${d.reason}"`,
            salonId: d.salon_id,
            salonName: d.salon_name || 'Deleted Salon',
            timestamp: d.deleted_at || d.created_at,
            entityId: d.id,
            entityType: 'account_deletion',
          });
        }
      });

      // Process Salons (Registration)
      if (!salonId || salonId === 'all') {
        salons.forEach((s) => {
          events.push({
            id: `salon-${s.id}`,
            type: 'salon_registered',
            title: 'New Salon Registered',
            description: `"${s.name}" onboarded onto the Style Fleet platform.`,
            salonId: s.id,
            salonName: s.name,
            timestamp: s.created_at,
            entityId: s.id,
            entityType: 'salon',
          });
        });
      }

      // Process Customers
      customers.forEach((c) => {
        events.push({
          id: `cust-${c.id}`,
          type: 'customer_created',
          title: 'New Customer Registered',
          description: `Customer "${c.name || c.phone_number}" registered.`,
          salonId: c.salon_id,
          salonName: c.salon_name || salonMap.get(c.salon_id) || 'Salon',
          timestamp: c.created_at,
          entityId: c.id,
          entityType: 'customer',
        });
      });

      // Process Appointments
      appointments.forEach((a) => {
        const custName = a.customer_name || 'Client';
        const sName = a.salon_name || salonMap.get(a.salon_id) || 'Salon';
        if (a.status === 'completed') {
          events.push({
            id: `appt-comp-${a.id}`,
            type: 'appointment_completed',
            title: 'Appointment Completed',
            description: `${custName} completed service "${a.service_name}" (${formatCurrency(a.total_amount)}).`,
            salonId: a.salon_id,
            salonName: sName,
            timestamp: a.start_time || a.created_at,
            entityId: a.id,
            entityType: 'appointment',
          });
        } else if (a.status === 'cancelled') {
          events.push({
            id: `appt-canc-${a.id}`,
            type: 'appointment_cancelled',
            title: 'Appointment Cancelled',
            description: `Appointment for ${custName} (${a.service_name}) was cancelled.`,
            salonId: a.salon_id,
            salonName: sName,
            timestamp: a.created_at,
            entityId: a.id,
            entityType: 'appointment',
          });
        } else {
          events.push({
            id: `appt-${a.id}`,
            type: 'appointment_created',
            title: 'Appointment Booked',
            description: `${custName} scheduled "${a.service_name}".`,
            salonId: a.salon_id,
            salonName: sName,
            timestamp: a.created_at,
            entityId: a.id,
            entityType: 'appointment',
          });
        }
      });

      // Process Bills
      bills.forEach((b) => {
        const custName = b.customer_name || 'Walk-in Client';
        const sName = b.salon_name || salonMap.get(b.salon_id) || 'Salon';
        events.push({
          id: `bill-${b.id}`,
          type: 'bill_generated',
          title: 'Invoice Generated',
          description: `Bill of ${formatCurrency(b.total)} created for ${custName}.`,
          salonId: b.salon_id,
          salonName: sName,
          timestamp: b.created_at,
          entityId: b.id,
          entityType: 'bill',
        });
      });

      // Sort all events in descending chronological order
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return { data: events.slice(0, limit), error: null };
    } catch (err: any) {
      console.error('activityService.getRecentActivity error:', err);
      return { data: [], error: err.message || 'Failed to aggregate activity log' };
    }
  },
};
