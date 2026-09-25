import { supabase } from '@/lib/supabase';
import { Salon } from '@/types';

export const salonService = {
  /**
   * Fetch all registered salons/shops with calculated real live statistics
   */
  async getAllSalons(salonId?: string): Promise<{ data: Salon[]; error: string | null }> {
    try {
      // 1. Fetch shops or salons
      let rawSalons: any[] = [];
      let shopsQuery = supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });

      if (salonId && salonId !== 'all') {
        shopsQuery = shopsQuery.eq('id', salonId);
      }

      const { data: shops, error: shopsError } = await shopsQuery;

      if (!shopsError && shops && shops.length > 0) {
        // Fetch profiles to get owner names
        const { data: profiles } = await supabase.from('profiles').select('*');
        const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

        rawSalons = shops.map((s: any) => ({
          id: s.id,
          name: s.name,
          owner_name: profileMap.get(s.owner_profile_id)?.full_name || 'Salon Owner',
          phone_number: s.phone || profileMap.get(s.owner_profile_id)?.phone || '—',
          address: s.address || '',
          city: s.city || '',
          pin_code: s.pin_code || '',
          theme_color: s.accent_color || '#D4AF37',
          app_version: '1.0.0',
          created_at: s.created_at,
          updated_at: s.updated_at,
        }));
      } else {
        let salonsQuery = supabase
          .from('salons')
          .select('*')
          .order('created_at', { ascending: false });

        if (salonId && salonId !== 'all') {
          salonsQuery = salonsQuery.eq('id', salonId);
        }

        const { data: salons } = await salonsQuery;
        if (salons) rawSalons = salons;
      }

      if (!rawSalons.length) return { data: [], error: null };

      // 2. Fetch customer counts
      const { data: customers } = await supabase
        .from('customers')
        .select('id, shop_id, salon_id');

      // 3. Fetch appointment metrics
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id, shop_id, salon_id, status, created_at, starts_at, start_time');

      // 4. Fetch bills metrics
      const { data: bills } = await supabase
        .from('bills')
        .select('id, shop_id, salon_id, total, total_minor, created_at');

      // 5. Fetch staff counts
      const { data: staff } = await supabase
        .from('staff')
        .select('id, shop_id, salon_id');

      // Map enriched metadata
      const enrichedSalons: Salon[] = rawSalons.map((salon) => {
        const salonCustomers = (customers || []).filter(
          (c: any) => c.shop_id === salon.id || c.salon_id === salon.id
        );
        const salonAppointments = (appointments || []).filter(
          (a: any) => a.shop_id === salon.id || a.salon_id === salon.id
        );
        const salonBills = (bills || []).filter(
          (b: any) => b.shop_id === salon.id || b.salon_id === salon.id
        );
        const salonStaff = (staff || []).filter(
          (s: any) => s.shop_id === salon.id || s.salon_id === salon.id
        );

        const totalRevenue = salonBills.reduce((sum: number, b: any) => {
          const amt = b.total_minor !== undefined ? Number(b.total_minor) / 100 : Number(b.total) || 0;
          return sum + amt;
        }, 0);

        // Find last activity
        const activityDates = [
          ...salonAppointments.map((a: any) => a.created_at || a.starts_at || a.start_time),
          ...salonBills.map((b: any) => b.created_at),
          salon.created_at,
        ].filter(Boolean);

        const latestTimestamp = activityDates.length
          ? new Date(Math.max(...activityDates.map((d: any) => new Date(d).getTime()))).toISOString()
          : salon.created_at;

        return {
          ...salon,
          customerCount: salonCustomers.length,
          appointmentCount: salonAppointments.length,
          totalRevenue,
          staffCount: salonStaff.length,
          status: 'active',
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
   * Alias for getAllSalons to support callers using getSalons
   */
  async getSalons(salonId?: string): Promise<{ data: Salon[]; error: string | null }> {
    return this.getAllSalons(salonId);
  },

  /**
   * Fetch single salon with deep 360 overview
   */
  async getSalonById(salonId: string): Promise<{ data: Salon | null; error: string | null }> {
    try {
      let salonData: any = null;

      const { data: shop } = await supabase
        .from('shops')
        .select('*')
        .eq('id', salonId)
        .maybeSingle();

      if (shop) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', shop.owner_profile_id)
          .maybeSingle();

        salonData = {
          id: shop.id,
          name: shop.name,
          owner_name: profile?.full_name || 'Salon Owner',
          phone_number: shop.phone || profile?.phone || '—',
          address: shop.address || '',
          city: shop.city || '',
          pin_code: shop.pin_code || '',
          theme_color: shop.accent_color || '#D4AF37',
          app_version: '1.0.0',
          created_at: shop.created_at,
          updated_at: shop.updated_at,
        };
      } else {
        const { data: salon } = await supabase
          .from('salons')
          .select('*')
          .eq('id', salonId)
          .maybeSingle();
        salonData = salon;
      }

      if (!salonData) return { data: null, error: 'Salon not found' };

      // Aggregates for this salon
      const [
        custRes,
        apptRes,
        billsRes,
        staffRes,
      ] = await Promise.all([
        supabase.from('customers').select('id').or(`shop_id.eq.${salonId},salon_id.eq.${salonId}`),
        supabase.from('appointments').select('id').or(`shop_id.eq.${salonId},salon_id.eq.${salonId}`),
        supabase.from('bills').select('total, total_minor').or(`shop_id.eq.${salonId},salon_id.eq.${salonId}`),
        supabase.from('staff').select('id').or(`shop_id.eq.${salonId},salon_id.eq.${salonId}`),
      ]);

      const totalRevenue = (billsRes.data || []).reduce((sum: number, b: any) => {
        const amt = b.total_minor !== undefined ? Number(b.total_minor) / 100 : Number(b.total) || 0;
        return sum + amt;
      }, 0);

      return {
        data: {
          ...salonData,
          customerCount: (custRes.data || []).length,
          appointmentCount: (apptRes.data || []).length,
          totalRevenue,
          staffCount: (staffRes.data || []).length,
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
