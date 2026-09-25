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
      let query = supabase.from('customers').select('*', { count: 'exact' });

      if (options.salonId && options.salonId !== 'all') {
        query = query.or(`shop_id.eq.${options.salonId},salon_id.eq.${options.salonId}`);
      }

      if (options.search) {
        const term = `%${options.search}%`;
        query = query.or(`name.ilike.${term},phone.ilike.${term},notes.ilike.${term}`);
      }

      query = query.order('created_at', { ascending: false });

      if (options.limit) {
        const offset = options.offset || 0;
        query = query.range(offset, offset + options.limit - 1);
      }

      const { data, count, error } = await query;
      if (error) throw error;
      if (!data) return { data: [], totalCount: 0, error: null };

      // Fetch shops/salons for linking
      const { data: shops } = await supabase.from('shops').select('*');
      const shopMap = new Map((shops || []).map((s: any) => [s.id, s]));

      // Fetch appointments and bills for customer metric enrichment
      const customerIds = data.map((c: any) => c.id);

      const [appointmentsRes, billsRes] = await Promise.all([
        supabase
          .from('appointments')
          .select('id, customer_id, starts_at, start_time, status, service_id, staff_id')
          .in('customer_id', customerIds),
        supabase
          .from('bills')
          .select('id, customer_id, total, total_minor, created_at')
          .in('customer_id', customerIds),
      ]);

      const appointments = appointmentsRes.data || [];
      const bills = billsRes.data || [];

      const enriched: Customer[] = data.map((c: any) => {
        const cAppts = appointments.filter((a: any) => a.customer_id === c.id);
        const cBills = bills.filter((b: any) => b.customer_id === c.id);

        const totalSpent = cBills.reduce((sum: number, b: any) => {
          const amt = b.total_minor !== undefined ? Number(b.total_minor) / 100 : Number(b.total) || 0;
          return sum + amt;
        }, 0);
        const totalVisits = cBills.length || cAppts.filter((a: any) => a.status === 'completed' || a.status === 'Done').length || cAppts.length;

        const visitDates = [...cAppts.map((a: any) => a.starts_at || a.start_time), ...cBills.map((b: any) => b.created_at)].filter(Boolean);
        const firstVisit = visitDates.length
          ? new Date(Math.min(...visitDates.map((d: any) => new Date(d).getTime()))).toISOString()
          : c.created_at;
        const lastVisit = visitDates.length
          ? new Date(Math.max(...visitDates.map((d: any) => new Date(d).getTime()))).toISOString()
          : c.created_at;

        const isStarred = c.is_starred !== undefined ? !!c.is_starred : !!c.starred;
        let segment: Customer['segment'] = 'new';
        if (isStarred) {
          segment = 'vip';
        } else if (totalVisits > 1 || totalSpent > 2000) {
          segment = 'returning';
        } else {
          segment = 'new';
        }

        const shop = shopMap.get(c.shop_id || c.salon_id);

        return {
          id: c.id,
          salon_id: c.shop_id || c.salon_id,
          name: c.name || 'Unnamed Customer',
          phone_number: c.phone || c.phone_number || '',
          notes: c.notes || '',
          starred: isStarred,
          created_at: c.created_at,
          salon: shop
            ? {
                id: shop.id,
                name: shop.name,
                owner_name: 'Salon Owner',
                phone_number: shop.phone || '',
                city: shop.city || '',
                address: shop.address || '',
                pin_code: shop.pin_code || '',
                theme_color: shop.accent_color || '#D4AF37',
                created_at: shop.created_at,
                updated_at: shop.updated_at,
              }
            : undefined,
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
      // 1. Fetch customer
      const { data: customerData, error: customerErr } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (customerErr) throw customerErr;
      if (!customerData) throw new Error('Customer not found');

      const salonId = customerData.shop_id || customerData.salon_id;
      const { data: shop } = await supabase.from('shops').select('*').eq('id', salonId).maybeSingle();

      // 2. Fetch customer appointments, bills, staff, services in parallel
      const [apptsRes, billsRes, staffRes, servicesRes] = await Promise.all([
        supabase
          .from('appointments')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false }),
        supabase
          .from('bills')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false }),
        supabase.from('staff').select('*'),
        supabase.from('services').select('*'),
      ]);

      const staffMap = new Map((staffRes.data || []).map((s: any) => [s.id, s]));
      const servicesMap = new Map((servicesRes.data || []).map((s: any) => [s.id, s]));

      const rawAppts = apptsRes.data || [];
      const rawBills = billsRes.data || [];

      const appointments: Appointment[] = rawAppts.map((a: any) => ({
        id: a.id,
        salon_id: a.shop_id || a.salon_id,
        customer_id: a.customer_id,
        staff_id: a.staff_id,
        service_id: a.service_id,
        service_name: servicesMap.get(a.service_id)?.name || a.service_name || 'Hair & Styling',
        start_time: a.starts_at || a.start_time || a.created_at,
        duration: a.duration_minutes || a.duration || 30,
        status: (a.status || 'scheduled').toLowerCase(),
        total_amount: a.total_amount_minor !== undefined ? a.total_amount_minor / 100 : a.total_amount || 0,
        final_amount: a.final_amount_minor !== undefined ? a.final_amount_minor / 100 : a.final_amount || 0,
        notes: a.notes || '',
        created_at: a.created_at,
        staff: staffMap.get(a.staff_id) || undefined,
        customer: {
          id: customerData.id,
          name: customerData.name,
          phone_number: customerData.phone || customerData.phone_number || '',
          notes: customerData.notes || '',
          starred: !!(customerData.is_starred || customerData.starred),
          created_at: customerData.created_at,
        },
      }));

      const bills: Bill[] = rawBills.map((b: any) => {
        const subtotal = b.subtotal_minor !== undefined ? b.subtotal_minor / 100 : Number(b.subtotal) || 0;
        const total = b.total_minor !== undefined ? b.total_minor / 100 : Number(b.total) || 0;
        const gst = b.tax_minor !== undefined ? b.tax_minor / 100 : Number(b.gst_amount) || 0;
        const discount = b.discount_minor !== undefined ? b.discount_minor / 100 : Number(b.discount) || 0;

        return {
          id: b.id,
          salon_id: b.shop_id || b.salon_id,
          customer_id: b.customer_id,
          subtotal,
          discount,
          gst_amount: gst,
          total,
          payment_method: b.payment_method || 'CASH',
          created_at: b.issued_at || b.created_at,
          customer: {
            id: customerData.id,
            name: customerData.name,
            phone_number: customerData.phone || customerData.phone_number || '',
            notes: customerData.notes || '',
            starred: !!(customerData.is_starred || customerData.starred),
            created_at: customerData.created_at,
          },
          items: [],
        };
      });

      // Calculate aggregates
      const totalSpent = bills.reduce((sum, b) => sum + (Number(b.total) || 0), 0);
      const totalVisits = bills.length || appointments.filter((a) => a.status === 'completed' || a.status === 'done').length || appointments.length;

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

      const isStarred = customerData.is_starred !== undefined ? !!customerData.is_starred : !!customerData.starred;

      const customer: Customer = {
        id: customerData.id,
        salon_id: salonId,
        name: customerData.name || 'Unnamed Customer',
        phone_number: customerData.phone || customerData.phone_number || '',
        notes: customerData.notes || '',
        starred: isStarred,
        created_at: customerData.created_at,
        salon: shop
          ? {
              id: shop.id,
              name: shop.name,
              owner_name: 'Salon Owner',
              phone_number: shop.phone || '',
              city: shop.city || '',
              address: shop.address || '',
              pin_code: shop.pin_code || '',
              theme_color: shop.accent_color || '#D4AF37',
              created_at: shop.created_at,
              updated_at: shop.updated_at,
            }
          : undefined,
        totalVisits,
        totalSpent,
        firstVisit,
        lastVisit,
        preferredStylist: topStylist,
        mostUsedService: appointments[0]?.service_name || 'Haircut & Treatment',
        segment: isStarred ? 'vip' : totalVisits > 1 ? 'returning' : 'new',
      };

      return {
        customer,
        appointments,
        bills,
        notifications: [],
        whatsappMessages: [],
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
