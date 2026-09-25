import { supabase } from '@/lib/supabase';
import { Staff } from '@/types';

export const staffService = {
  /**
   * Fetch staff with salon and performance metrics
   */
  async getStaff(salonIdOrOptions?: string | { salonId?: string }): Promise<{ data: Staff[]; error: string | null }> {
    try {
      const salonId = typeof salonIdOrOptions === 'object' && salonIdOrOptions !== null
        ? salonIdOrOptions.salonId
        : salonIdOrOptions;

      let query = supabase.from('staff').select('*');

      if (salonId && salonId !== 'all') {
        query = query.or(`shop_id.eq.${salonId},salon_id.eq.${salonId}`);
      }

      query = query.order('created_at', { ascending: false });

      const { data: staffList, error } = await query;
      if (error) throw error;
      if (!staffList) return { data: [], error: null };

      // Fetch shops, appointments, and bills to compute metrics
      const [shopsRes, apptsRes, billsRes] = await Promise.all([
        supabase.from('shops').select('*'),
        supabase.from('appointments').select('id, staff_id, status, total_amount_minor, total_amount'),
        supabase.from('bills').select('id, staff_id, total_minor, total'),
      ]);

      const shopMap = new Map((shopsRes.data || []).map((s: any) => [s.id, s]));
      const appointments = apptsRes.data || [];
      const bills = billsRes.data || [];

      const enriched: Staff[] = staffList.map((s: any) => {
        const staffAppts = appointments.filter((a: any) => a.staff_id === s.id);
        const completedAppts = staffAppts.filter((a: any) => a.status === 'completed' || a.status === 'done' || a.status === 'Done');
        const staffBills = bills.filter((b: any) => b.staff_id === s.id);

        const revenueFromBills = staffBills.reduce(
          (sum: number, b: any) => sum + (b.total_minor !== undefined ? b.total_minor / 100 : Number(b.total) || 0),
          0
        );

        const revenueFromAppts = completedAppts.reduce(
          (sum: number, a: any) => sum + (a.total_amount_minor !== undefined ? a.total_amount_minor / 100 : Number(a.total_amount) || 0),
          0
        );

        const shp = shopMap.get(s.shop_id || s.salon_id);

        return {
          id: s.id,
          salon_id: s.shop_id || s.salon_id,
          name: s.name || 'Stylist',
          role: s.role || 'Stylist',
          phone_number: s.phone || '',
          created_at: s.created_at,
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
          appointmentCount: staffAppts.length,
          completedAppointments: completedAppts.length,
          revenueGenerated: Math.max(revenueFromBills, revenueFromAppts),
        };
      });

      return { data: enriched, error: null };
    } catch (err: any) {
      console.error('staffService.getStaff error:', err);
      return { data: [], error: err.message || 'Failed to fetch staff' };
    }
  },
};
