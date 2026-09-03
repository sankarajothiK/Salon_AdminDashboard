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
   * Fetch appointments with full customer, staff, and salon joins
   */
  async getAppointments(options: AppointmentFilterOptions = {}): Promise<{
    data: Appointment[];
    totalCount: number;
    error: string | null;
  }> {
    try {
      let query = supabase
        .from('appointments')
        .select('*, customer:customer_id(*), staff:staff_id(*), salon:salon_id(*)', { count: 'exact' });

      if (options.salonId && options.salonId !== 'all') {
        query = query.eq('salon_id', options.salonId);
      }

      if (options.status && options.status !== 'all') {
        query = query.eq('status', options.status);
      }

      if (options.staffId && options.staffId !== 'all') {
        query = query.eq('staff_id', options.staffId);
      }

      if (options.dateRange?.start) {
        query = query.gte('start_time', options.dateRange.start);
      }

      if (options.dateRange?.end) {
        query = query.lte('start_time', options.dateRange.end);
      }

      if (options.search) {
        const term = `%${options.search}%`;
        query = query.or(`service_name.ilike.${term},notes.ilike.${term}`);
      }

      query = query.order('start_time', { ascending: false });

      if (options.limit) {
        const offset = options.offset || 0;
        query = query.range(offset, offset + options.limit - 1);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      return {
        data: (data || []) as Appointment[],
        totalCount: count || (data || []).length,
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
