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
      let query = supabase
        .from('bills')
        .select('*, customer:customer_id(*), salon:salon_id(*), items:bill_items(*)', { count: 'exact' });

      if (options.salonId && options.salonId !== 'all') {
        query = query.eq('salon_id', options.salonId);
      }

      if (options.customerId) {
        query = query.eq('customer_id', options.customerId);
      }

      if (options.dateRange?.start) {
        query = query.gte('created_at', options.dateRange.start);
      }

      if (options.dateRange?.end) {
        query = query.lte('created_at', options.dateRange.end);
      }

      query = query.order('created_at', { ascending: false });

      if (options.limit) {
        const offset = options.offset || 0;
        query = query.range(offset, offset + options.limit - 1);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      return {
        data: (data || []) as Bill[],
        totalCount: count || (data || []).length,
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
      let query = supabase.from('bills').select('id, total, created_at, salon_id');
      if (salonId && salonId !== 'all') {
        query = query.eq('salon_id', salonId);
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

      data.forEach((b) => {
        const amount = Number(b.total) || 0;
        const time = new Date(b.created_at).getTime();

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
