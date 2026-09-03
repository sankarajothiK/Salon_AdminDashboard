import { supabase } from '@/lib/supabase';
import { Staff } from '@/types';

export const staffService = {
  /**
   * Fetch staff with salon and performance metrics
   */
  async getStaff(salonId?: string): Promise<{ data: Staff[]; error: string | null }> {
    try {
      let query = supabase.from('staff').select('*, salon:salon_id(*)');

      if (salonId && salonId !== 'all') {
        query = query.eq('salon_id', salonId);
      }

      query = query.order('created_at', { ascending: false });

      const { data: staffList, error } = await query;
      if (error) throw error;
      if (!staffList) return { data: [], error: null };

      // Fetch appointments and bill items to compute performance
      const [apptsRes, billItemsRes] = await Promise.all([
        supabase.from('appointments').select('id, staff_id, status, total_amount'),
        supabase.from('bill_items').select('id, staff_id, price, qty'),
      ]);

      const appointments = apptsRes.data || [];
      const billItems = billItemsRes.data || [];

      const enriched: Staff[] = staffList.map((s: any) => {
        const staffAppts = appointments.filter((a) => a.staff_id === s.id);
        const completedAppts = staffAppts.filter((a) => a.status === 'completed');
        const staffItems = billItems.filter((item) => item.staff_id === s.id);

        const revenueFromItems = staffItems.reduce(
          (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1),
          0
        );

        const revenueFromAppts = completedAppts.reduce(
          (sum, a) => sum + (Number(a.total_amount) || 0),
          0
        );

        return {
          id: s.id,
          salon_id: s.salon_id,
          name: s.name,
          role: s.role,
          created_at: s.created_at,
          salon: s.salon,
          appointmentCount: staffAppts.length,
          completedAppointments: completedAppts.length,
          revenueGenerated: Math.max(revenueFromItems, revenueFromAppts),
        };
      });

      return { data: enriched, error: null };
    } catch (err: any) {
      console.error('staffService.getStaff error:', err);
      return { data: [], error: err.message || 'Failed to fetch staff' };
    }
  },
};
