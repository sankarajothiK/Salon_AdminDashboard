import { supabase } from '@/lib/supabase';
import { Customer, Appointment, Bill, WhatsAppMessage, NotificationLog } from '@/types';

export interface CustomerFilterOptions {
  salonId?: string;
  search?: string;
  segment?: 'all' | 'new' | 'returning' | 'vip' | 'inactive';
  limit?: number;
  offset?: number;
}

export const customerService = {
  /**
   * Fetch all customers with metrics & filtering
   */
  async getCustomers(options: CustomerFilterOptions = {}): Promise<{
    data: Customer[];
    totalCount: number;
    error: string | null;
  }> {
    try {
      let query = supabase.from('customers').select('*, salons:salon_id(*)', { count: 'exact' });

      if (options.salonId && options.salonId !== 'all') {
        query = query.eq('salon_id', options.salonId);
      }

      if (options.search) {
        const term = `%${options.search}%`;
        query = query.or(`name.ilike.${term},phone_number.ilike.${term},notes.ilike.${term}`);
      }

      query = query.order('created_at', { ascending: false });

      if (options.limit) {
        const offset = options.offset || 0;
        query = query.range(offset, offset + options.limit - 1);
      }

      const { data, count, error } = await query;
      if (error) throw error;
      if (!data) return { data: [], totalCount: 0, error: null };

      // Fetch appointments and bills for customer metric enrichment
      const customerIds = data.map((c) => c.id);

      const [appointmentsRes, billsRes] = await Promise.all([
        supabase
          .from('appointments')
          .select('id, customer_id, start_time, total_amount, status, service_name, staff_id')
          .in('customer_id', customerIds),
        supabase
          .from('bills')
          .select('id, customer_id, total, created_at')
          .in('customer_id', customerIds),
      ]);

      const appointments = appointmentsRes.data || [];
      const bills = billsRes.data || [];

      const enriched: Customer[] = data.map((c: any) => {
        const cAppts = appointments.filter((a) => a.customer_id === c.id);
        const cBills = bills.filter((b) => b.customer_id === c.id);

        const totalSpent = cBills.reduce((sum, b) => sum + (Number(b.total) || 0), 0);
        const totalVisits = cBills.length || cAppts.filter((a) => a.status === 'completed').length || cAppts.length;

        const visitDates = [...cAppts.map((a) => a.start_time), ...cBills.map((b) => b.created_at)].filter(Boolean);
        const firstVisit = visitDates.length
          ? new Date(Math.min(...visitDates.map((d) => new Date(d).getTime()))).toISOString()
          : c.created_at;
        const lastVisit = visitDates.length
          ? new Date(Math.max(...visitDates.map((d) => new Date(d).getTime()))).toISOString()
          : c.created_at;

        let segment: Customer['segment'] = 'new';
        if (c.starred) {
          segment = 'vip';
        } else if (totalVisits > 1 || totalSpent > 2000) {
          segment = 'returning';
        } else {
          segment = 'new';
        }

        return {
          id: c.id,
          salon_id: c.salon_id,
          name: c.name || 'Unnamed Customer',
          phone_number: c.phone_number || '',
          notes: c.notes || '',
          starred: !!c.starred,
          created_at: c.created_at,
          salon: c.salons || undefined,
          totalVisits,
          totalSpent,
          firstVisit,
          lastVisit,
          segment,
        };
      });

      // Filter by segment if specified
      let filtered = enriched;
      if (options.segment && options.segment !== 'all') {
        filtered = enriched.filter((c) => c.segment === options.segment);
      }

      return {
        data: filtered,
        totalCount: count || filtered.length,
        error: null,
      };
    } catch (err: any) {
      console.error('customerService.getCustomers error:', err);
      return { data: [], totalCount: 0, error: err.message || 'Failed to fetch customers' };
    }
  },

  /**
   * Fetch single customer full 360 profile
   */
  async getCustomerById(customerId: string): Promise<{
    customer: Customer | null;
    appointments: Appointment[];
    bills: Bill[];
    notifications: NotificationLog[];
    whatsappMessages: WhatsAppMessage[];
    error: string | null;
  }> {
    try {
      // 1. Fetch customer with salon info
      const { data: customerData, error: customerErr } = await supabase
        .from('customers')
        .select('*, salons:salon_id(*)')
        .eq('id', customerId)
        .single();

      if (customerErr) throw customerErr;
      if (!customerData) throw new Error('Customer not found');

      // 2. Fetch customer appointments, bills, notifications, whatsapp logs in parallel
      const [apptsRes, billsRes, notifsRes, waRes] = await Promise.all([
        supabase
          .from('appointments')
          .select('*, staff:staff_id(*), salon:salon_id(*)')
          .eq('customer_id', customerId)
          .order('start_time', { ascending: false }),
        supabase
          .from('bills')
          .select('*, salon:salon_id(*), items:bill_items(*)')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false }),
        supabase
          .from('notifications')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false }),
        supabase
          .from('whatsapp_messages')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false }),
      ]);

      const appointments = (apptsRes.data || []) as Appointment[];
      const bills = (billsRes.data || []) as Bill[];
      const notifications = (notifsRes.data || []) as NotificationLog[];
      const whatsappMessages = (waRes.data || []) as WhatsAppMessage[];

      // Calculate aggregates
      const totalSpent = bills.reduce((sum, b) => sum + (Number(b.total) || 0), 0);
      const totalVisits = bills.length || appointments.filter((a) => a.status === 'completed').length || appointments.length;

      const visitDates = [...appointments.map((a) => a.start_time), ...bills.map((b) => b.created_at)].filter(Boolean);
      const firstVisit = visitDates.length
        ? new Date(Math.min(...visitDates.map((d) => new Date(d).getTime()))).toISOString()
        : customerData.created_at;
      const lastVisit = visitDates.length
        ? new Date(Math.max(...visitDates.map((d) => new Date(d).getTime()))).toISOString()
        : customerData.created_at;

      // Stylist preferences
      const stylistCounts: Record<string, number> = {};
      appointments.forEach((a) => {
        if (a.staff?.name) {
          stylistCounts[a.staff.name] = (stylistCounts[a.staff.name] || 0) + 1;
        }
      });
      const topStylist = Object.entries(stylistCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

      // Most used service
      const serviceCounts: Record<string, number> = {};
      appointments.forEach((a) => {
        if (a.service_name) {
          a.service_name.split(',').forEach((s) => {
            const trimmed = s.trim();
            if (trimmed) serviceCounts[trimmed] = (serviceCounts[trimmed] || 0) + 1;
          });
        }
      });
      bills.forEach((b) => {
        (b.items || []).forEach((item) => {
          if (item.service_name) {
            serviceCounts[item.service_name] = (serviceCounts[item.service_name] || 0) + (item.qty || 1);
          }
        });
      });
      const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

      const customer: Customer = {
        id: customerData.id,
        salon_id: customerData.salon_id,
        name: customerData.name || 'Unnamed Customer',
        phone_number: customerData.phone_number || '',
        notes: customerData.notes || '',
        starred: !!customerData.starred,
        created_at: customerData.created_at,
        salon: customerData.salons || undefined,
        totalVisits,
        totalSpent,
        firstVisit,
        lastVisit,
        preferredStylist: topStylist,
        mostUsedService: topService,
        segment: customerData.starred ? 'vip' : totalVisits > 1 ? 'returning' : 'new',
      };

      return {
        customer,
        appointments,
        bills,
        notifications,
        whatsappMessages,
        error: null,
      };
    } catch (err: any) {
      console.error('customerService.getCustomerById error:', err);
      return {
        customer: null,
        appointments: [],
        bills: [],
        notifications: [],
        whatsappMessages: [],
        error: err.message || 'Failed to fetch customer profile',
      };
    }
  },
};
