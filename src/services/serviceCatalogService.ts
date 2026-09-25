import { supabase } from '@/lib/supabase';
import { Service } from '@/types';

export const serviceCatalogService = {
  /**
   * Fetch services directly from live Supabase 'services' table with category resolution
   */
  async getServices(salonIdOrOptions?: string | { salonId?: string }): Promise<{ data: Service[]; error: string | null }> {
    try {
      const salonId = typeof salonIdOrOptions === 'object' && salonIdOrOptions !== null
        ? salonIdOrOptions.salonId
        : salonIdOrOptions;

      let query = supabase.from('services').select('*').order('created_at', { ascending: false });
      if (salonId && salonId !== 'all') {
        query = query.or(`shop_id.eq.${salonId},salon_id.eq.${salonId}`);
      }

      const { data: dbServices, error } = await query;
      if (error) {
        console.warn('Services table query warning:', error.message);
        return { data: [], error: error.message };
      }

      if (!dbServices || dbServices.length === 0) {
        return { data: [], error: null };
      }

      const services: Service[] = dbServices.map((s: any) => ({
        id: s.id,
        salon_id: s.shop_id || s.salon_id,
        name: s.name,
        price: s.price_minor !== undefined ? s.price_minor / 100 : Number(s.price) || 0,
        duration_minutes: s.duration_minutes || s.duration || 30,
        description: s.description || 'Salon service',
        category: s.category || 'GENERAL',
        is_default: !s.shop_id,
        created_at: s.created_at,
      }));

      return { data: services, error: null };
    } catch (err: any) {
      console.error('serviceCatalogService.getServices error:', err);
      return { data: [], error: err.message };
    }
  },
};

