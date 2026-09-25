import { supabase } from '@/lib/supabase';
import { Bill } from '@/types';

export interface BillingFilterOptions {
  salonId?: string;
  customerId?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  search?: string;
  limit?: number;
  offset?: number;
}

export interface RevenueSummaryData {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalRevenue: number;
  allTimeRevenue: number;
  todayBillCount: number;
  monthBillCount: number;
  totalBillCount: number;
}

export const billingService = {
  /**
   * Fetch bills with salon, customer, and item joins
   */
  async getBills(options: BillingFilterOptions = {}): Promise<{
    data: Bill[];
    totalCount: number;
    error: string | null;
  }> {
    try {
      let query = supabase.from('bills').select('*', { count: 'exact' });

      if (options.salonId && options.salonId !== 'all') {
        query = query.or(`shop_id.eq.${options.salonId},salon_id.eq.${options.salonId}`);
      }

      if (options.customerId) {
        query = query.eq('customer_id', options.customerId);
      }

      query = query.order('created_at', { ascending: false });

      if (options.limit) {
        const offset = options.offset || 0;
        query = query.range(offset, offset + options.limit - 1);
      }

      const { data, count, error } = await query;
      if (error) throw error;
      if (!data) return { data: [], totalCount: 0, error: null };

      // Enrich with customers and shops
      const [custRes, shopsRes, itemsRes] = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('shops').select('*'),
        supabase.from('bill_items').select('*'),
      ]);

      const custMap = new Map((custRes.data || []).map((c: any) => [c.id, c]));
      const shopMap = new Map((shopsRes.data || []).map((s: any) => [s.id, s]));
      const itemsList = itemsRes.data || [];

      const enriched: Bill[] = data.map((b: any) => {
        const cust = custMap.get(b.customer_id);
        const shp = shopMap.get(b.shop_id || b.salon_id);
        const billItems = itemsList.filter((i: any) => i.bill_id === b.id);

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
          items: billItems.map((item: any) => ({
            id: item.id,
            bill_id: item.bill_id,
            service_name: item.name || item.service_name || 'Service Item',
            price: item.price_minor !== undefined ? item.price_minor / 100 : item.price || 0,
            qty: item.quantity || item.qty || 1,
            total: item.price_minor !== undefined ? (item.price_minor * (item.quantity || item.qty || 1)) / 100 : item.total || 0,
          })),
        };
      });

      return {
        data: enriched,
        totalCount: count || enriched.length,
        error: null,
      };
    } catch (err: any) {
      console.error('billingService.getBills error:', err);
      return { data: [], totalCount: 0, error: err.message || 'Failed to fetch billing data' };
    }
  },

  /**
   * Get overall revenue aggregates for today, this week, this month, and all time
   */
  async getRevenueSummary(salonId?: string): Promise<{
    data: RevenueSummaryData | null;
    error: string | null;
  }> {
    try {
      let query = supabase.from('bills').select('id, total, total_minor, created_at, issued_at, shop_id, salon_id');
      if (salonId && salonId !== 'all') {
        query = query.or(`shop_id.eq.${salonId},salon_id.eq.${salonId}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (!data) {
        return {
          data: {
            todayRevenue: 0,
            weekRevenue: 0,
            monthRevenue: 0,
            totalRevenue: 0,
            allTimeRevenue: 0,
            todayBillCount: 0,
            monthBillCount: 0,
            totalBillCount: 0,
          },
          error: null,
        };
      }

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

      let todayRevenue = 0;
      let weekRevenue = 0;
      let monthRevenue = 0;
      let totalRevenue = 0;
      let todayBillCount = 0;
      let monthBillCount = 0;

      data.forEach((b: any) => {
        const amount = b.total_minor !== undefined ? Number(b.total_minor) / 100 : Number(b.total) || 0;
        const time = new Date(b.issued_at || b.created_at).getTime();

        totalRevenue += amount;

        if (time >= todayStart) {
          todayRevenue += amount;
          todayBillCount++;
        }
        if (time >= weekStart) {
          weekRevenue += amount;
        }
        if (time >= monthStart) {
          monthRevenue += amount;
          monthBillCount++;
        }
      });

      return {
        data: {
          todayRevenue,
          weekRevenue,
          monthRevenue,
          totalRevenue,
          allTimeRevenue: totalRevenue,
          todayBillCount,
          monthBillCount,
          totalBillCount: data.length,
        },
        error: null,
      };
    } catch (err: any) {
      console.error('billingService.getRevenueSummary error:', err);
      return {
        data: {
          todayRevenue: 0,
          weekRevenue: 0,
          monthRevenue: 0,
          totalRevenue: 0,
          allTimeRevenue: 0,
          todayBillCount: 0,
          monthBillCount: 0,
          totalBillCount: 0,
        },
        error: err.message,
      };
    }
  },
};
