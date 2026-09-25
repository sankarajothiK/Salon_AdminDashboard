import { supabase } from '@/lib/supabase';
import { Appointment } from '@/types';

export interface AppointmentFilterOptions {
  salonId?: string;
  status?: string;
  staffId?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  search?: string;
  limit?: number;
  offset?: number;
}

export const appointmentService = {
  /**
   * Fetch appointments with full customer, staff, service, and salon joins
   */
  async getAppointments(optionsOrSalonId?: AppointmentFilterOptions | string): Promise<{
    data: Appointment[];
    totalCount: number;
    error: string | null;
  }> {
    try {
      const options: AppointmentFilterOptions =
        typeof optionsOrSalonId === 'string'
          ? { salonId: optionsOrSalonId }
          : (optionsOrSalonId || {});

      let query = supabase.from('appointments').select('*', { count: 'exact' });

      if (options.salonId && options.salonId !== 'all') {
        query = query.or(`shop_id.eq.${options.salonId},salon_id.eq.${options.salonId}`);
      }

      if (options.status && options.status !== 'all') {
        query = query.ilike('status', options.status);
      }

      if (options.staffId && options.staffId !== 'all') {
        query = query.eq('staff_id', options.staffId);
      }

      query = query.order('created_at', { ascending: false });

      if (options.limit) {
        const offset = options.offset || 0;
        query = query.range(offset, offset + options.limit - 1);
      }

      const { data, count, error } = await query;
      if (error) throw error;
      if (!data) return { data: [], totalCount: 0, error: null };

      // Fetch related records to enrich
      const [custRes, staffRes, servRes, shopsRes] = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('staff').select('*'),
        supabase.from('services').select('*'),
        supabase.from('shops').select('*'),
      ]);

      const custMap = new Map((custRes.data || []).map((c: any) => [c.id, c]));
      const staffMap = new Map((staffRes.data || []).map((s: any) => [s.id, s]));
      const servMap = new Map((servRes.data || []).map((s: any) => [s.id, s]));
      const shopMap = new Map((shopsRes.data || []).map((s: any) => [s.id, s]));

      const enriched: Appointment[] = data.map((a: any) => {
        const cust = custMap.get(a.customer_id);
        const stf = staffMap.get(a.staff_id);
        const srv = servMap.get(a.service_id);
        const shp = shopMap.get(a.shop_id || a.salon_id);

        const startTime = a.starts_at || a.start_time || a.created_at;
        const totalAmount = a.total_amount_minor !== undefined ? a.total_amount_minor / 100 : a.total_amount || 0;
        const finalAmount = a.final_amount_minor !== undefined ? a.final_amount_minor / 100 : a.final_amount || totalAmount;

        return {
          id: a.id,
          salon_id: a.shop_id || a.salon_id,
          customer_id: a.customer_id,
          staff_id: a.staff_id,
          service_id: a.service_id,
          service_name: srv?.name || a.service_name || 'Hair & Styling',
          start_time: startTime,
          duration: a.duration_minutes || a.duration || 30,
          status: (a.status || 'scheduled').toLowerCase(),
          total_amount: totalAmount,
          final_amount: finalAmount,
          notes: a.notes || '',
          created_at: a.created_at,
          customer: cust
            ? {
                id: cust.id,
                name: cust.name,
                phone_number: cust.phone || cust.phone_number || '',
                notes: cust.notes || '',
                starred: !!(cust.is_starred || cust.starred),
                created_at: cust.created_at,
              }
            : undefined,
          staff: stf || undefined,
          salon: shp
            ? {
                id: shp.id,
                name: shp.name,
                owner_name: 'Salon Owner',
                phone_number: shp.phone || '',
                city: shp.city || '',
                address: shp.address || '',
                pin_code: shp.pin_code || '',
                theme_color: shp.accent_color || '#D4AF37',
                created_at: shp.created_at,
                updated_at: shp.updated_at,
              }
            : undefined,
        };
      });

      return {
        data: enriched,
        totalCount: count || enriched.length,
        error: null,
      };
    } catch (err: any) {
      console.error('appointmentService.getAppointments error:', err);
      return { data: [], totalCount: 0, error: err.message || 'Failed to fetch appointments' };
    }
  },

  /**
   * Fetch today's appointments across all accessible salons
   */
  async getTodayAppointments(salonId?: string): Promise<{
    data: Appointment[];
    error: string | null;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return this.getAppointments({
        salonId,
        dateRange: {
          start: today.toISOString(),
          end: tomorrow.toISOString(),
        },
      });
    } catch (err: any) {
      return { data: [], error: err.message };
    }
  },
};
