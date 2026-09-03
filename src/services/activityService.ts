import { supabase } from '@/lib/supabase';
import { ActivityEvent } from '@/types';
import { formatCurrency } from '@/utils/formatters';

export const activityService = {
  /**
   * Aggregate real activity events across tables into a unified chronological stream
   */
  async getRecentActivity(limit = 40, salonId?: string): Promise<{ data: ActivityEvent[]; error: string | null }> {
    try {
      // 1. Fetch recent records in parallel
      let salonsQuery = supabase.from('salons').select('id, name, created_at').order('created_at', { ascending: false }).limit(limit);
      let customersQuery = supabase.from('customers').select('id, name, phone_number, salon_id, created_at, salon:salon_id(name)').order('created_at', { ascending: false }).limit(limit);
      let apptsQuery = supabase.from('appointments').select('id, service_name, status, total_amount, start_time, created_at, salon_id, customer:customer_id(name), salon:salon_id(name)').order('created_at', { ascending: false }).limit(limit);
      let billsQuery = supabase.from('bills').select('id, total, created_at, salon_id, customer:customer_id(name), salon:salon_id(name)').order('created_at', { ascending: false }).limit(limit);
      let notifsQuery = supabase.from('notifications').select('id, title, message, status, type, created_at, salon_id, salon:salon_id(name)').order('created_at', { ascending: false }).limit(limit);
      let waQuery = supabase.from('whatsapp_messages').select('id, phone_number, status, created_at, salon_id, salon:salon_id(name)').order('created_at', { ascending: false }).limit(limit);

      if (salonId && salonId !== 'all') {
        customersQuery = customersQuery.eq('salon_id', salonId);
        apptsQuery = apptsQuery.eq('salon_id', salonId);
        billsQuery = billsQuery.eq('salon_id', salonId);
        notifsQuery = notifsQuery.eq('salon_id', salonId);
        waQuery = waQuery.eq('salon_id', salonId);
      }

      const [salonsRes, customersRes, apptsRes, billsRes, notifsRes, waRes] = await Promise.all([
        salonsQuery,
        customersQuery,
        apptsQuery,
        billsQuery,
        notifsQuery,
        waQuery,
      ]);

      const events: ActivityEvent[] = [];

      // Process Salons
      if (!salonId || salonId === 'all') {
        (salonsRes.data || []).forEach((s: any) => {
          events.push({
            id: `salon-${s.id}`,
            type: 'salon_registered',
            title: 'New Salon Registered',
            description: `"${s.name}" onboarded onto the Salon CRM platform.`,
            salonId: s.id,
            salonName: s.name,
            timestamp: s.created_at,
            entityId: s.id,
            entityType: 'salon',
          });
        });
      }

      // Process Customers
      (customersRes.data || []).forEach((c: any) => {
        events.push({
          id: `cust-${c.id}`,
          type: 'customer_created',
          title: 'New Customer Registered',
          description: `Customer "${c.name || c.phone_number}" registered.`,
          salonId: c.salon_id,
          salonName: c.salon?.name || 'Salon',
          timestamp: c.created_at,
          entityId: c.id,
          entityType: 'customer',
        });
      });

      // Process Appointments
      (apptsRes.data || []).forEach((a: any) => {
        const custName = a.customer?.name || 'Client';
        if (a.status === 'completed') {
          events.push({
            id: `appt-comp-${a.id}`,
            type: 'appointment_completed',
            title: 'Appointment Completed',
            description: `${custName} completed service "${a.service_name}" (${formatCurrency(a.total_amount)}).`,
            salonId: a.salon_id,
            salonName: a.salon?.name || 'Salon',
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
            salonName: a.salon?.name || 'Salon',
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
            salonName: a.salon?.name || 'Salon',
            timestamp: a.created_at,
            entityId: a.id,
            entityType: 'appointment',
          });
        }
      });

      // Process Bills
      (billsRes.data || []).forEach((b: any) => {
        const custName = b.customer?.name || 'Walk-in Client';
        events.push({
          id: `bill-${b.id}`,
          type: 'bill_generated',
          title: 'Invoice Generated',
          description: `Bill of ${formatCurrency(b.total)} created for ${custName}.`,
          salonId: b.salon_id,
          salonName: b.salon?.name || 'Salon',
          timestamp: b.created_at,
          entityId: b.id,
          entityType: 'bill',
        });
      });

      // Process WhatsApp Messages
      (waRes.data || []).forEach((w: any) => {
        events.push({
          id: `wa-${w.id}`,
          type: 'whatsapp_sent',
          title: w.status === 'sent' ? 'WhatsApp Invoice Sent' : 'WhatsApp Dispatch Pending',
          description: `Invoice dispatch to +91 ${w.phone_number} [Status: ${w.status}].`,
          salonId: w.salon_id,
          salonName: w.salon?.name || 'Salon',
          timestamp: w.created_at,
          entityId: w.id,
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
