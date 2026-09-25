import { supabase } from '@/lib/supabase';
import { Service } from '@/types';

// Standard base preset services as defined in mobile application
export const PRESET_SERVICES: Service[] = [
  { id: 'def-1', name: 'Haircut', price: 300, duration_minutes: 30, is_default: true, category: 'HAIR', description: 'Classic professional haircut and hair shaping' },
  { id: 'def-2', name: 'Hair Styling', price: 250, duration_minutes: 20, is_default: true, category: 'HAIR', description: 'Premium hair styling, blow dry or setting' },
  { id: 'def-3', name: 'Hair Wash', price: 150, duration_minutes: 15, is_default: true, category: 'HAIR', description: 'Nourishing wash with luxury shampoo & conditioner' },
  { id: 'def-4', name: 'Hair Spa', price: 1000, duration_minutes: 45, is_default: true, category: 'HAIR', description: 'Deep conditioning treatment for scalp health' },
  { id: 'def-5', name: 'Hair Coloring', price: 1200, duration_minutes: 60, is_default: true, category: 'HAIR', description: 'Complete hair color or root touch-up styling' },
  { id: 'def-6', name: 'Beard Trim', price: 150, duration_minutes: 15, is_default: true, category: 'BEARD', description: 'Neat shape, trim, and beard styling lines' },
  { id: 'def-7', name: 'Shaving', price: 100, duration_minutes: 15, is_default: true, category: 'BEARD', description: 'Classic hot towel shave with premium foam' },
  { id: 'def-8', name: 'Facial', price: 800, duration_minutes: 45, is_default: true, category: 'SPA', description: 'Skin brightening facial massage and mask pack' },
  { id: 'def-9', name: 'Cleanup', price: 500, duration_minutes: 30, is_default: true, category: 'SPA', description: 'Gentle exfoliation & deep pore cleansing treatment' },
  { id: 'def-10', name: 'Manicure', price: 400, duration_minutes: 30, is_default: true, category: 'SPA', description: 'Nail shaping, cuticle care, and hand massage' },
  { id: 'def-11', name: 'Pedicure', price: 500, duration_minutes: 30, is_default: true, category: 'SPA', description: 'Nail shaping, foot scrub, and relaxing foot massage' },
  { id: 'def-12', name: 'Threading', price: 60, duration_minutes: 10, is_default: true, category: 'SPA', description: 'Precision eyebrow threading and facial hair removal' },
  { id: 'def-13', name: 'Waxing', price: 350, duration_minutes: 20, is_default: true, category: 'SPA', description: 'Smooth waxing hair removal for hands or legs' },
  { id: 'def-14', name: 'Bridal Makeup', price: 5000, duration_minutes: 120, is_default: true, category: 'GENERAL', description: 'Luxury bridal makeover and cosmetics alignment' },
  { id: 'def-15', name: 'Party Makeup', price: 2000, duration_minutes: 60, is_default: true, category: 'GENERAL', description: 'Glamorous makeover for special party occasions' },
  { id: 'def-16', name: 'Saree Draping', price: 800, duration_minutes: 30, is_default: true, category: 'GENERAL', description: 'Elegant traditional saree draping by specialists' },
  { id: 'def-17', name: 'Head Massage', price: 250, duration_minutes: 20, is_default: true, category: 'SPA', description: 'Relaxing hot oil scalp massage for stress relief' },
  { id: 'def-18', name: 'Body Massage', price: 1500, duration_minutes: 60, is_default: true, category: 'SPA', description: 'Full body massage with organic aroma therapy oils' },
  { id: 'def-19', name: 'Dandruff Treatment', price: 800, duration_minutes: 40, is_default: true, category: 'HAIR', description: 'Specialized scalp treatment to eliminate dandruff' },
  { id: 'def-20', name: 'Hair Treatment', price: 1000, duration_minutes: 45, is_default: true, category: 'HAIR', description: 'Targeted care for dry, damaged, or frizzy hair' },
  { id: 'def-21', name: 'Keratin Treatment', price: 3000, duration_minutes: 90, is_default: true, category: 'HAIR', description: 'Smoothing treatment for shiny, frizz-free straight hair' },
  { id: 'def-22', name: 'Smoothening', price: 4000, duration_minutes: 120, is_default: true, category: 'HAIR', description: 'Semi-permanent hair smoothing and straightening style' },
  { id: 'def-23', name: 'Hair Straightening', price: 2500, duration_minutes: 90, is_default: true, category: 'HAIR', description: 'Permanent straight styling with professional creams' },
  { id: 'def-24', name: 'Kids Haircut', price: 200, duration_minutes: 20, is_default: true, category: 'HAIR', description: 'Quick and gentle haircut service for children' },
  { id: 'def-25', name: 'Groom Makeup', price: 4000, duration_minutes: 90, is_default: true, category: 'GENERAL', description: 'Sophisticated natural grooming makeover for grooms' },
];

export const serviceCatalogService = {
  /**
   * Fetch services directly from Supabase with strict deduplication
   */
  async getServices(salonId?: string): Promise<{ data: Service[]; error: string | null }> {
    try {
      let query = supabase.from('services').select('*');
      if (salonId && salonId !== 'all') {
        query = query.or(`shop_id.eq.${salonId},salon_id.eq.${salonId}`);
      }

      const { data: dbServices, error } = await query;
      if (error && error.code !== 'PGRST116') {
        console.warn('Services table query warning:', error.message);
      }

      const customList = (dbServices || []).map((s: any) => ({
        id: s.id,
        salon_id: s.shop_id || s.salon_id,
        name: s.name,
        price: s.price_minor !== undefined ? s.price_minor / 100 : Number(s.price) || 0,
        duration_minutes: s.duration_minutes || s.duration || 30,
        description: s.description || 'Custom salon service',
        category: s.category || 'GENERAL',
        is_default: false,
        created_at: s.created_at,
      }));

      // Deduplicate: If Supabase has custom services with same name as presets, prefer Supabase custom service
      const serviceMap = new Map<string, Service>();

      PRESET_SERVICES.forEach((preset) => {
        serviceMap.set(preset.name.toLowerCase().trim(), preset);
      });

      customList.forEach((custom) => {
        serviceMap.set(custom.name.toLowerCase().trim(), custom);
      });

      const uniqueServices = Array.from(serviceMap.values());

      return { data: uniqueServices, error: null };
    } catch (err: any) {
      console.error('serviceCatalogService.getServices error:', err);
      return { data: PRESET_SERVICES, error: null };
    }
  },
};
