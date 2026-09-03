import { supabase } from '@/lib/supabase';
import { Salon } from '@/types';

export const salonService = {
  /**
   * Fetch all registered salons with calculated statistics
   */
  async getAllSalons(): Promise<{ data: Salon[]; error: string | null }> {
    try {
      // 1. Fetch salons
      const { data: salons, error: salonsError } = await supabase
        .from('salons')
        .select('*')
        .order('created_at', { ascending: false });

      if (salonsError) throw salonsError;
      if (!salons) return { data: [], error: null };

      // 2. Fetch customer counts
      const { data: customers } = await supabase
        .from('customers')
        .select('id, salon_id');

      // 3. Fetch appointment metrics
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id, salon_id, status, created_at, start_time');

      // 4. Fetch bills metrics
      const { data: bills } = await supabase
        .from('bills')
        .select('id, salon_id, total, created_at');

      // 5. Fetch staff counts
      const { data: staff } = await supabase
        .from('staff')
        .select('id, salon_id');

      // Map enriched metadata
      const enrichedSalons: Salon[] = salons.map((salon) => {
        const salonCustomers = (customers || []).filter((c) => c.salon_id === salon.id);
        const salonAppointments = (appointments || []).filter((a) => a.salon_id === salon.id);
        const salonBills = (bills || []).filter((b) => b.salon_id === salon.id);
        const salonStaff = (staff || []).filter((s) => s.salon_id === salon.id);

        const totalRevenue = salonBills.reduce((sum, b) => sum + (Number(b.total) || 0), 0);

        // Find last activity
        const activityDates = [
          ...salonAppointments.map((a) => a.created_at || a.start_time),
          ...salonBills.map((b) => b.created_at),
          salon.created_at,
        ].filter(Boolean);

        const latestTimestamp = activityDates.length
          ? new Date(Math.max(...activityDates.map((d) => new Date(d).getTime()))).toISOString()
          : salon.created_at;

        // Health Status determination
        const now = Date.now();
        const diffDays = (now - new Date(latestTimestamp).getTime()) / (1000 * 60 * 60 * 24);
        let status: Salon['status'] = 'active';
        if (diffDays > 30) status = 'inactive';
        else if (diffDays <= 7) status = 'active';
        else status = 'active';

        return {
          ...salon,
          customerCount: salonCustomers.length,
          appointmentCount: salonAppointments.length,
          totalRevenue,
          staffCount: salonStaff.length,
          status,
          lastActivity: latestTimestamp,
        };
      });

      return { data: enrichedSalons, error: null };
    } catch (err: any) {
      console.error('salonService.getAllSalons error:', err);
      return { data: [], error: err.message || 'Failed to fetch salons' };
    }
  },

  /**
   * Fetch single salon with deep 360 overview
   */
  async getSalonById(salonId: string): Promise<{ data: Salon | null; error: string | null }> {
    try {
      const { data: salon, error } = await supabase
        .from('salons')
        .select('*')
        .eq('id', salonId)
        .single();

      if (error) throw error;
      if (!salon) return { data: null, error: 'Salon not found' };

      // Aggregates for this salon
      const [
        { count: customerCount },
        { count: appointmentCount },
        { data: bills },
        { count: staffCount },
      ] = await Promise.all([
        supabase.from('customers').select('*', { count: 'exact', head: true }).eq('salon_id', salonId),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('salon_id', salonId),
        supabase.from('bills').select('total, created_at').eq('salon_id', salonId),
        supabase.from('staff').select('*', { count: 'exact', head: true }).eq('salon_id', salonId),
      ]);

      const totalRevenue = (bills || []).reduce((sum, b) => sum + (Number(b.total) || 0), 0);

      return {
        data: {
          ...salon,
          customerCount: customerCount || 0,
          appointmentCount: appointmentCount || 0,
          totalRevenue,
          staffCount: staffCount || 0,
          status: 'active',
        },
        error: null,
      };
    } catch (err: any) {
      console.error('salonService.getSalonById error:', err);
      return { data: null, error: err.message || 'Failed to fetch salon details' };
    }
  },
};
